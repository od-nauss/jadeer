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

export interface ScoreWithMeta {
  score: number;
  label: string;
  color: 'sage' | 'primary' | 'gold' | 'wine';
}

export interface FeedbackItem {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export interface Analysis360Result {
  overall_score: number;
  team_satisfaction_score: ScoreWithMeta;
  professional_trust_score: ScoreWithMeta;
  leadership_readiness_score: ScoreWithMeta;
  balance_score: ScoreWithMeta;
  confidence_level: ScoreWithMeta;
  extreme_count: number;
  extreme_flags: string[];
  axis_averages: Record<string, number>;
  initiative_verification_rate: number;
  kpi_verification_rate: number;
  committee_summary: string;
  detected_leadership_type: string;
  feedback: FeedbackItem[];
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

function colorFor(score: number): 'sage' | 'primary' | 'gold' | 'wine' {
  if (score >= 80) return 'sage';
  if (score >= 65) return 'primary';
  if (score >= 50) return 'gold';
  return 'wine';
}

function labelFor(score: number): string {
  if (score >= 80) return 'ممتاز';
  if (score >= 65) return 'جيد';
  if (score >= 50) return 'متوسط';
  return 'يحتاج تحسيناً';
}

function makeScore(score: number): ScoreWithMeta {
  return { score, label: labelFor(score), color: colorFor(score) };
}

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

  // رضا الفريق
  const teamRaw = axis_averages['team'] ?? overall_score;
  const team_satisfaction_score = makeScore(teamRaw);

  // الثقة المهنية — مزيج من النزاهة ومتوسط مقيمي الإدارة
  const integrityRaw = axis_averages['integrity'] ?? overall_score;
  const managerScores = inputs
    .filter(ev => ['direct_manager', 'previous_manager'].includes(ev.relationship_type))
    .map(ev => {
      const arr = Object.values(ev.scores_json || {});
      return arr.length ? arr.reduce((s, v) => s + (v.score || 0), 0) / arr.length : 0;
    });
  const managerAvg = managerScores.length ? Math.round(managerScores.reduce((a, b) => a + b, 0) / managerScores.length) : overall_score;
  const professional_trust_score = makeScore(Math.round((integrityRaw * 0.5 + managerAvg * 0.5)));

  // الاستعداد للقيادة — مزيج من القيادة والاستراتيجي
  const leadRaw = axis_averages['leadership'] ?? overall_score;
  const stratRaw = axis_averages['strategic'] ?? overall_score;
  const leadership_readiness_score = makeScore(Math.round((leadRaw * 0.6 + stratRaw * 0.4)));

  // التوازن — مدى اتساق التقييمات عبر الفئات
  const stdDev = calcStdDev(allScores);
  const balanceRaw = Math.max(0, Math.min(100, Math.round(100 - stdDev)));
  const balance_score = makeScore(balanceRaw);

  // مستوى الثقة
  const consistencyBonus = Math.max(0, 30 - stdDev);
  const countBonus = Math.min(inputs.length * 5, 40);
  const confidence_raw = Math.min(95, Math.round(30 + consistencyBonus + countBonus));
  const confidence_level = makeScore(confidence_raw);

  // التقييمات المتطرفة
  const mean = overall_score;
  const extreme_flags: string[] = [];
  let extreme_count = 0;
  for (const ev of inputs) {
    const scoresArr = Object.values(ev.scores_json || {});
    if (scoresArr.length === 0) continue;
    const avg = scoresArr.reduce((s, v) => s + (v.score || 0), 0) / scoresArr.length;
    if (Math.abs(avg - mean) > 25) {
      extreme_count++;
      extreme_flags.push(`مقيّم بعلاقة "${ev.relationship_type}" أعطى ${Math.round(avg)}٪ مقابل المتوسط ${mean}٪`);
    }
  }

  // نسب التحقق
  const initVerified = inputs.filter(ev => Object.keys(ev.initiative_verifications_json || {}).length > 0).length;
  const kpiVerified = inputs.filter(ev => Object.keys(ev.kpi_verifications_json || {}).length > 0).length;
  const initiative_verification_rate = inputs.length > 0 ? Math.round((initVerified / inputs.length) * 100) : 0;
  const kpi_verification_rate = inputs.length > 0 ? Math.round((kpiVerified / inputs.length) * 100) : 0;

  const detected_leadership_type = detectLeadershipType(axis_averages, overall_score);

  const committee_summary = buildCommitteeSummary({
    overall_score, confidence_score: confidence_raw, inputCount: inputs.length,
    extreme_count, team_score: teamRaw, detected_leadership_type,
  });

  // ملاحظات ذكية
  const feedback: FeedbackItem[] = buildFeedback({
    overall_score, extreme_count, inputs, initiative_verification_rate,
    kpi_verification_rate, balanceRaw, teamRaw,
  });

  return {
    overall_score,
    team_satisfaction_score,
    professional_trust_score,
    leadership_readiness_score,
    balance_score,
    confidence_level,
    extreme_count,
    extreme_flags,
    axis_averages,
    initiative_verification_rate,
    kpi_verification_rate,
    committee_summary,
    detected_leadership_type,
    feedback,
  };
}

function emptyResult(): Analysis360Result {
  const zero = makeScore(0);
  return {
    overall_score: 0,
    team_satisfaction_score: zero,
    professional_trust_score: zero,
    leadership_readiness_score: zero,
    balance_score: zero,
    confidence_level: zero,
    extreme_count: 0,
    extreme_flags: [],
    axis_averages: {},
    initiative_verification_rate: 0,
    kpi_verification_rate: 0,
    committee_summary: 'لم تتوفر تقييمات كافية للتحليل.',
    detected_leadership_type: '—',
    feedback: [],
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

function buildFeedback(ctx: {
  overall_score: number;
  extreme_count: number;
  inputs: EvalInput[];
  initiative_verification_rate: number;
  kpi_verification_rate: number;
  balanceRaw: number;
  teamRaw: number;
}): FeedbackItem[] {
  const { overall_score, extreme_count, inputs, initiative_verification_rate, kpi_verification_rate, balanceRaw, teamRaw } = ctx;
  const items: FeedbackItem[] = [];

  if (overall_score >= 80) items.push({ type: 'success', text: `الدرجة الكلية ${overall_score}٪ — مستوى قيادي ممتاز.` });
  else if (overall_score >= 65) items.push({ type: 'info', text: `الدرجة الكلية ${overall_score}٪ — مستوى قيادي جيد.` });
  else items.push({ type: 'warning', text: `الدرجة الكلية ${overall_score}٪ — يحتاج تطوير قيادي موجه.` });

  if (inputs.length < 5) items.push({ type: 'warning', text: `عدد المقيمين (${inputs.length}) أقل من المثالي (5+) مما يُقلل الموثوقية.` });
  else items.push({ type: 'success', text: `${inputs.length} مقيمون — تغطية جيدة تعزز موثوقية النتائج.` });

  if (extreme_count > 0) items.push({ type: 'error', text: `${extreme_count} تقييم متطرف — يستوجب مراجعة اللجنة.` });

  if (initiative_verification_rate >= 60) items.push({ type: 'success', text: `تأكيد المبادرات ${initiative_verification_rate}٪ — مستوى توثيق جيد.` });
  else if (initiative_verification_rate > 0) items.push({ type: 'warning', text: `تأكيد المبادرات ${initiative_verification_rate}٪ — يُوصى بزيادة التحقق.` });

  if (balanceRaw >= 75) items.push({ type: 'success', text: 'تناسق عالٍ بين تقييمات المجموعات المختلفة.' });
  else if (balanceRaw < 50) items.push({ type: 'warning', text: 'تباين ملحوظ بين تقييمات المجموعات — قد يشير لتحيز.' });

  if (teamRaw < 55) items.push({ type: 'error', text: `رضا الفريق منخفض (${teamRaw}٪) — يستوجب متابعة جدية.` });

  return items;
}
