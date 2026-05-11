/**
 * Jadeer AI — 360 Evaluation Results Analyzer
 */
import type { AnalysisScore, AnalysisFeedback } from './analyzer';

// re-export helpers inline since they're not exported from analyzer
function makeScore(score: number): AnalysisScore {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const label: AnalysisScore['label'] =
    clamped >= 85 ? 'ممتاز' : clamped >= 70 ? 'جيد' : clamped >= 55 ? 'مقبول' :
    clamped >= 35 ? 'يحتاج تحسين' : 'ضعيف';
  const color: AnalysisScore['color'] =
    clamped >= 75 ? 'sage' : clamped >= 55 ? 'primary' : clamped >= 35 ? 'gold' : 'wine';
  return { score: clamped, label, color };
}

export interface Evaluation360Input {
  evaluator_id: string;
  relationship_type: string;
  scores_json: Record<string, { score: number; comment?: string }>;
  comments_summary?: string;
  initiative_verifications_json?: Record<string, unknown>;
  kpi_verifications_json?: Record<string, unknown>;
}

export interface Analysis360Result {
  axis_averages: Record<string, number>;
  overall_score: number;
  confidence_level: AnalysisScore;
  team_satisfaction_score: AnalysisScore;
  professional_trust_score: AnalysisScore;
  leadership_readiness_score: AnalysisScore;
  balance_score: AnalysisScore;
  bias_risk: AnalysisScore;
  extreme_count: number;
  extreme_flags: string[];
  initiative_verification_rate: number;
  kpi_verification_rate: number;
  detected_leadership_type: string;
  feedback: AnalysisFeedback[];
  committee_summary: string;
  by_relationship: Record<string, number>;
}

const AXIS_CATEGORY: Record<string, 'team' | 'leadership'> = {
  leadership: 'leadership', strategic: 'leadership', decision_making: 'leadership',
  crisis_management: 'leadership',
  team_satisfaction: 'team', team_development: 'team', communication: 'team',
  stakeholder_relations: 'team',
};

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي',
};

export function analyze360Results(evaluations: Evaluation360Input[]): Analysis360Result {
  const feedback: AnalysisFeedback[] = [];

  if (evaluations.length === 0) {
    return {
      axis_averages: {}, overall_score: 0,
      confidence_level: makeScore(0), team_satisfaction_score: makeScore(0),
      professional_trust_score: makeScore(0), leadership_readiness_score: makeScore(0),
      balance_score: makeScore(50), bias_risk: makeScore(0),
      extreme_count: 0, extreme_flags: [],
      initiative_verification_rate: 0, kpi_verification_rate: 0,
      detected_leadership_type: 'غير محدد',
      feedback: [{ type: 'error', text: 'لا توجد تقييمات لتحليلها.' }],
      committee_summary: 'لا توجد بيانات كافية.',
      by_relationship: {},
    };
  }

  // ── متوسطات المحاور (تحويل 1-5 → 0-100) ──
  const axisTotals: Record<string, number[]> = {};
  for (const ev of evaluations) {
    for (const [axis, data] of Object.entries(ev.scores_json || {})) {
      if (!axisTotals[axis]) axisTotals[axis] = [];
      axisTotals[axis].push(((data.score - 1) / 4) * 100);
    }
  }
  const axis_averages: Record<string, number> = {};
  for (const [axis, vals] of Object.entries(axisTotals)) {
    axis_averages[axis] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  const allScores = Object.values(axis_averages);
  const overall_score = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  // ── متوسطات حسب نوع العلاقة ──────────────
  const by_relationship: Record<string, number[]> = {};
  for (const ev of evaluations) {
    const rel = ev.relationship_type;
    const vals = Object.values(ev.scores_json || {}).map(d => ((d.score - 1) / 4) * 100);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    if (!by_relationship[rel]) by_relationship[rel] = [];
    by_relationship[rel].push(avg);
  }
  const by_relationship_avg: Record<string, number> = {};
  for (const [rel, vals] of Object.entries(by_relationship)) {
    by_relationship_avg[rel] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  // ── كشف التطرف ────────────────────────────
  const evScores = evaluations.map(ev => {
    const vals = Object.values(ev.scores_json || {}).map(d => ((d.score - 1) / 4) * 100);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  const mean = evScores.reduce((a, b) => a + b, 0) / evScores.length;
  const stdDev = Math.sqrt(evScores.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / evScores.length);
  const extremeFlags: string[] = [];
  evScores.forEach((score, i) => {
    if (Math.abs(score - mean) > Math.max(stdDev * 1.8, 25)) {
      const rel = REL_LABELS[evaluations[i].relationship_type] || evaluations[i].relationship_type;
      extremeFlags.push(`${rel}: ${Math.round(score)}٪ (متوسط الدائرة: ${Math.round(mean)}٪)`);
    }
  });
  if (extremeFlags.length > 0)
    feedback.push({ type: 'warning', text: `رُصد ${extremeFlags.length} تقييم بعيد عن المتوسط — يستحق مراجعة اللجنة.` });

  // ── المؤشرات الفئوية ───────────────────────
  const teamAxes = Object.entries(axis_averages).filter(([k]) => AXIS_CATEGORY[k] === 'team').map(([, v]) => v);
  const leaderAxes = Object.entries(axis_averages).filter(([k]) => AXIS_CATEGORY[k] === 'leadership').map(([, v]) => v);
  const teamAvg = teamAxes.length ? teamAxes.reduce((a, b) => a + b, 0) / teamAxes.length : overall_score;
  const leaderAvg = leaderAxes.length ? leaderAxes.reduce((a, b) => a + b, 0) / leaderAxes.length : overall_score;

  // ── التحيز ────────────────────────────────
  const relTypes = evaluations.map(e => e.relationship_type);
  const uniqueTypes = new Set(relTypes).size;
  const dominantCount = Math.max(...[...new Set(relTypes)].map(r => relTypes.filter(x => x === r).length));
  const biasRisk = Math.max(0, Math.min(100,
    (dominantCount / evaluations.length) * 60 + (Math.max(0, 4 - uniqueTypes) * 10)
  ));
  if (biasRisk > 60) feedback.push({ type: 'error', text: 'مخاطر تحيز مرتفعة — التنوع ضعيف في دائرة التقييم.' });
  else if (biasRisk > 35) feedback.push({ type: 'warning', text: 'تنوع المقيمين محدود نسبياً.' });
  else feedback.push({ type: 'success', text: 'تنوع جيد في دائرة الثقة.' });

  // ── تحقق المبادرات والمؤشرات ──────────────
  const iniVerified = evaluations.filter(e => e.initiative_verifications_json && Object.keys(e.initiative_verifications_json).length > 0).length;
  const kpiVerified = evaluations.filter(e => e.kpi_verifications_json && Object.keys(e.kpi_verifications_json).length > 0).length;
  const iniRate = Math.round((iniVerified / evaluations.length) * 100);
  const kpiRate = Math.round((kpiVerified / evaluations.length) * 100);

  if (iniRate < 30) feedback.push({ type: 'warning', text: 'قليل من المقيمين تحققوا من المبادرات — يُضعف مصداقية الملف.' });
  if (kpiRate < 30) feedback.push({ type: 'warning', text: 'ضعف في تأكيد مؤشرات الأداء من المقيمين.' });

  // ── نوع القيادة المكتشف ───────────────────
  let leaderType = 'قائد متوازن';
  if (teamAvg >= 80 && leaderAvg >= 80) leaderType = 'قائد مكتمل';
  else if (teamAvg >= 75 && leaderAvg < 60) leaderType = 'قائد إنساني — يحتاج تطوير الجانب الاستراتيجي';
  else if (leaderAvg >= 75 && teamAvg < 60) leaderType = 'قائد موجه للنتائج — يحتاج تطوير رضا الفريق';
  else if (overall_score >= 75 && teamAvg < 55) leaderType = 'أداء عالٍ / رضا منخفض';
  else if (axis_averages['tech_ai'] > 80 && overall_score > 70) leaderType = 'قائد تقني';

  // ── مستوى الثقة ───────────────────────────
  let confidence = 40;
  if (evaluations.length >= 7) confidence += 20;
  if (evaluations.length >= 9) confidence += 10;
  if (uniqueTypes >= 3) confidence += 15;
  if (stdDev < 15) confidence += 10;
  if (iniRate >= 50) confidence += 5;
  if (extremeFlags.length === 0) confidence += 5;
  else confidence -= extremeFlags.length * 5;

  // ── ملخص ─────────────────────────────────
  const summaryParts: string[] = [
    `اكتمل ${evaluations.length} تقييم.`,
    `الدرجة الكلية: ${overall_score}٪ — مستوى الثقة: ${Math.min(100, confidence)}٪.`,
    `النمط القيادي: ${leaderType}.`,
  ];
  if (Math.abs(teamAvg - leaderAvg) > 20)
    summaryParts.push(`فجوة (${Math.round(Math.abs(teamAvg - leaderAvg))}٪) بين التقييم القيادي (${Math.round(leaderAvg)}٪) وتقييم العلاقات (${Math.round(teamAvg)}٪).`);
  if (extremeFlags.length > 0)
    summaryParts.push(`رُصد ${extremeFlags.length} تقييم متطرف — يُوصى بالمراجعة.`);

  // compare manager vs peers if available
  const managerScore = by_relationship_avg['direct_manager'] || by_relationship_avg['previous_manager'];
  const peerScore = by_relationship_avg['peer'];
  if (managerScore && peerScore) {
    if (managerScore - peerScore > 20) summaryParts.push('تقييم المدير أعلى بكثير من تقييم الزملاء — قد يعكس قيادة ذاتية قوية.');
    else if (peerScore - managerScore > 20) summaryParts.push('تقييم الزملاء أعلى من تقييم المدير — يستحق مناقشة في اللجنة.');
  }

  if (overall_score >= 80) feedback.unshift({ type: 'success', text: 'نتائج تقييم 360 قوية ومتماسكة.' });

  return {
    axis_averages,
    overall_score,
    confidence_level: makeScore(Math.min(100, confidence)),
    team_satisfaction_score: makeScore(teamAvg),
    professional_trust_score: makeScore(leaderAvg),
    leadership_readiness_score: makeScore(axis_averages['leadership'] ?? overall_score),
    balance_score: makeScore(100 - Math.min(50, Math.abs(teamAvg - leaderAvg))),
    bias_risk: makeScore(biasRisk),
    extreme_count: extremeFlags.length,
    extreme_flags: extremeFlags,
    initiative_verification_rate: iniRate,
    kpi_verification_rate: kpiRate,
    detected_leadership_type: leaderType,
    feedback,
    committee_summary: summaryParts.join(' '),
    by_relationship: by_relationship_avg,
  };
}
