/**
 * analyzer360.ts
 * تحليل نتائج تقييم 360 درجة وكشف التحيزات والأنماط القيادية
 */

export interface EvalInput {
  evaluator_id: string;
  relationship_type: string;
  scores_json: Record<string, { score: number; comment?: string }>;
  comments_summary: string;
  initiative_verifications_json: Record<string, unknown>;
  kpi_verifications_json: Record<string, unknown>;
}

export interface Analysis360Result {
  overall_score: number;
  team_satisfaction_score: { score: number; label: string };
  confidence_level: { score: number; label: string };
  extreme_count: number;
  extreme_flags: string[];
  axis_averages: Record<string, number>;
  initiative_verification_rate: number;
  kpi_verification_rate: number;
  committee_summary: string;
  detected_leadership_type: string;
}

const REL_WEIGHTS: Record<string, number> = {
  direct_manager: 1.4,
  previous_manager: 1.2,
  peer: 1.0,
  subordinate: 0.9,
  team_member: 0.9,
  stakeholder: 0.85,
  project_partner: 0.85,
  internal_beneficiary: 0.8,
  other: 0.75,
};

export function analyze360Results(inputs: EvalInput[]): Analysis360Result {
  if (!inputs || inputs.length === 0) return emptyResult();

  const axisAccum: Record<string, { sum: number; weight: number }> = {};
  const allScores: number[] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const ev of inputs) {
    const w = REL_WEIGHTS[ev.relationship_type] || 0.8;
    const scoresArr = Object.values(ev.scores_json || {});
    if (scoresArr.length === 0) continue;

    const evalAvg = scoresArr.reduce((s, v) => s + (v.score || 0), 0) / scoresArr.length;
    allScores.push(evalAvg);
    weightedSum += evalAvg * w;
    totalWeight += w;

    for (const [axis, val] of Object.entries(ev.scores_json || {})) {
      if (!axisAccum[axis]) axisAccum[axis] = { sum: 0, weight: 0 };
      axisAccum[axis].sum += (val.score || 0) * w;
      axisAccum[axis].weight += w;
    }
  }

  const overall_score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  const axis_averages: Record<string, number> = {};
  for (const [axis, acc] of Object.entries(axisAccum)) {
    axis_averages[axis] = acc.weight > 0 ? Math.round(acc.sum / acc.weight) : 0;
  }

  const teamScore = axis_averages['team'] ?? overall_score;
  const team_satisfaction_score = {
    score: teamScore,
    label: teamScore >= 80 ? 'ممتاز' : teamScore >= 65 ? 'جيد' : teamScore >= 50 ? 'متوسط' : 'يحتاج تحسيناً',
  };

  const stdDev = calcStdDev(allScores);
  const consistencyBonus = Math.max(0, 30 - stdDev);
  const countBonus = Math.min(inputs.length * 5, 40);
  const confidence_score = Math.min(95, Math.round(30 + consistencyBonus + countBonus));
  const confidence_level = {
    score: confidence_score,
    label: confidence_score >= 80 ? 'عالي' : confidence_score >= 60 ? 'متوسط' : 'منخفض',
  };

  const mean = overall_score;
  const extreme_flags: string[] = [];
  let extreme_count = 0;
  for (const ev of inputs) {
    const scoresArr = Object.values(ev.scores_json || {});
    if (scoresArr.length === 0) continue;
    const avg = scoresArr.reduce((s, v) => s + (v.score || 0), 0) / scoresArr.length;
    if (Math.abs(avg - mean) > 25) {
      extreme_count++;
      extreme_flags.push(
        `مقيّم بعلاقة "${ev.relationship_type}" أعطى ${Math.round(avg)}٪ مقابل المتوسط ${mean}٪`
      );
    }
  }

  const initVerified = inputs.filter(ev => Object.keys(ev.initiative_verifications_json || {}).length > 0).length;
  const kpiVerified = inputs.filter(ev => Object.keys(ev.kpi_verifications_json || {}).length > 0).length;
  const initiative_verification_rate = inputs.length > 0 ? Math.round((initVerified / inputs.length) * 100) : 0;
  const kpi_verification_rate = inputs.length > 0 ? Math.round((kpiVerified / inputs.length) * 100) : 0;

  const detected_leadership_type = detectLeadershipType(axis_averages, overall_score);

  const committee_summary = buildCommitteeSummary({
    overall_score, confidence_score, inputCount: inputs.length, extreme_count,
    team_score: teamScore, detected_leadership_type,
  });

  return {
    overall_score,
    team_satisfaction_score,
    confidence_level,
    extreme_count,
    extreme_flags,
    axis_averages,
    initiative_verification_rate,
    kpi_verification_rate,
    committee_summary,
    detected_leadership_type,
  };
}

function emptyResult(): Analysis360Result {
  return {
    overall_score: 0,
    team_satisfaction_score: { score: 0, label: '—' },
    confidence_level: { score: 0, label: '—' },
    extreme_count: 0,
    extreme_flags: [],
    axis_averages: {},
    initiative_verification_rate: 0,
    kpi_verification_rate: 0,
    committee_summary: 'لم تتوفر تقييمات كافية للتحليل.',
    detected_leadership_type: '—',
  };
}

function calcStdDev(scores: number[]): number {
  if (scores.length < 2) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
}

function detectLeadershipType(axes: Record<string, number>, overall: number): string {
  const lead = axes['leadership'] ?? 0;
  const strat = axes['strategic'] ?? 0;
  const team = axes['team'] ?? 0;
  const innov = axes['innovation'] ?? 0;
  const tech = axes['technology'] ?? 0;
  const perf = axes['performance'] ?? 0;

  if (strat >= 80 && lead >= 75) return 'قائد استراتيجي';
  if (team >= 85 && lead >= 70) return 'قائد إنساني';
  if (innov >= 80 && tech >= 75) return 'قائد ابتكاري تقني';
  if (perf >= 85 && strat >= 65) return 'قائد تحويلي';
  if (tech >= 85) return 'قائد تقني متخصص';
  if (overall >= 75) return 'قائد متكامل';
  if (overall >= 55) return 'قائد ناشئ واعد';
  return 'يحتاج تطوير قيادي';
}

function buildCommitteeSummary(ctx: {
  overall_score: number;
  confidence_score: number;
  inputCount: number;
  extreme_count: number;
  team_score: number;
  detected_leadership_type: string;
}): string {
  const { overall_score, confidence_score, inputCount, extreme_count, team_score, detected_leadership_type } = ctx;
  const parts: string[] = [];

  parts.push(`حصل المرشح على متوسط كلي ${overall_score}٪ من خلال ${inputCount} مقيّم.`);

  if (overall_score >= 80) {
    parts.push('تُشير التقييمات إلى كفاءة قيادية واضحة ومستوى أداء متميز.');
  } else if (overall_score >= 65) {
    parts.push('تُشير التقييمات إلى مستوى قيادي جيد مع وجود مجال للتطوير في بعض المحاور.');
  } else {
    parts.push('تُشير التقييمات إلى الحاجة لخطة تطوير قيادية واضحة قبل المضي في مسار التعاقب.');
  }

  if (team_score >= 80) {
    parts.push(`رضا الفريق مرتفع (${team_score}٪)، مما يعكس قدرة على بناء بيئة عمل إيجابية.`);
  } else if (team_score < 60) {
    parts.push(`رضا الفريق منخفض (${team_score}٪)، يُوصى بمزيد من التقييم في هذا الجانب.`);
  }

  if (extreme_count > 0) {
    parts.push(`رُصد ${extreme_count} تقييم متطرف — يُنصح بالتحقق من دوافع الانحراف.`);
  }

  parts.push(`النمط القيادي المرصود: ${detected_leadership_type}. مستوى الثقة: ${confidence_score}٪.`);

  return parts.join(' ');
}
