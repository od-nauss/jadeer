/**
 * Jadeer AI — Governance Analysis Engine
 * يحسب الدرجة الكلية ومستوى الثقة والتصنيف المقترح
 */

export interface GovernanceScoreInput {
  profile: {
    completion_score: number;
    years_of_experience?: number;
    internal_experience?: string;
    led_projects?: string;
    committee_participations?: string;
  };
  initiatives: Array<{
    ai_score?: number;
    achieved_impact?: string;
    impact_metrics?: string;
    evidence?: string;
    is_sustainable?: boolean;
  }>;
  kpis: Array<{
    ai_score?: number;
    target_value?: string;
    actual_value?: string;
    used_in_decision?: string;
    is_officially_approved?: boolean;
  }>;
  assessmentResults: Array<{
    assessment_code?: string;
    score: number;
    thinking_pattern?: string;
  }>;
  evaluation360: {
    overall_score: number;
    team_satisfaction_score: number;
    confidence_level: number;
    extreme_count: number;
    evaluators_count: number;
    initiative_verification_rate: number;
    kpi_verification_rate: number;
    detected_leadership_type?: string;
  } | null;
}

export interface GovernanceAnalysisResult {
  // محاور الدرجة (0-100)
  axis_scores: {
    leadership: number;
    strategic: number;
    performance: number;
    innovation: number;
    team: number;
    technology: number;
    integrity: number;
  };
  // الدرجة الكلية المرجحة
  total_score: number;
  // مستوى الثقة (مستقل عن الدرجة)
  trust_score: number;
  // تصنيف الجاهزية
  readiness_level: 'ready_now' | 'ready_within_year' | 'promising' | 'specialist' | 'not_suitable' | 'high_performance_low_satisfaction' | 'human_leader';
  readiness_label: string;
  // نوع القيادة
  leadership_type: 'strategic' | 'operational' | 'technical' | 'human_leader' | 'hidden' | 'emerging';
  leadership_type_label: string;
  // نقاط القوة والفجوات
  primary_strengths: string[];
  development_gaps: string[];
  // التصنيفات الخاصة
  special_flags: string[];
  // الملخص
  ai_summary: string;
  governance_recommendation: string;
  // تنبيهات
  risk_flags: string[];
  confidence_issues: string[];
}

const WEIGHTS = {
  leadership: 0.20,
  strategic: 0.15,
  performance: 0.15,
  innovation: 0.15,
  team: 0.15,
  technology: 0.10,
  integrity: 0.10,
};

const ASSESSMENT_AXIS_MAP: Record<string, string> = {
  leadership_influence: 'leadership',
  strategic_thinking: 'strategic',
  decision_making: 'leadership',
  crisis_management: 'leadership',
  emotional_intelligence: 'team',
  team_management: 'team',
  tech_ai_usage: 'technology',
  case_study: 'strategic',
};

export function computeGovernanceScore(input: GovernanceScoreInput): GovernanceAnalysisResult {
  const risk_flags: string[] = [];
  const confidence_issues: string[] = [];

  // ── المحور 1: القيادة (من الاختبارات + 360) ────────────────
  const leaderAssessments = input.assessmentResults.filter(r =>
    ['leadership_influence', 'decision_making', 'crisis_management'].includes(r.assessment_code || '')
  );
  const leaderAssessScore = leaderAssessments.length > 0
    ? leaderAssessments.reduce((s, r) => s + r.score, 0) / leaderAssessments.length : 50;
  const leader360 = input.evaluation360?.overall_score ?? 50;
  const leadershipScore = leaderAssessments.length > 0
    ? leaderAssessScore * 0.5 + leader360 * 0.5 : leader360;

  // ── المحور 2: التفكير الاستراتيجي ──────────────────────────
  const stratAssessments = input.assessmentResults.filter(r =>
    ['strategic_thinking', 'case_study'].includes(r.assessment_code || '')
  );
  const strategicScore = stratAssessments.length > 0
    ? stratAssessments.reduce((s, r) => s + r.score, 0) / stratAssessments.length : 55;

  // ── المحور 3: الأداء والإنجاز (مبادرات + KPIs + اختبارات) ─
  const validInis = input.initiatives.filter(i => (i.ai_score || 0) > 40);
  const iniScore = validInis.length > 0
    ? Math.min(100, validInis.reduce((s, i) => s + (i.ai_score || 50), 0) / validInis.length) : 40;
  const validKpis = input.kpis.filter(k => k.target_value);
  const kpiScore = validKpis.length > 0
    ? Math.min(100, 50 + validKpis.filter(k => k.is_officially_approved).length * 10 + validKpis.filter(k => k.used_in_decision).length * 8) : 40;
  const performanceScore = (iniScore * 0.4 + kpiScore * 0.4 + (input.profile.completion_score * 0.2));

  // ── المحور 4: الابتكار (من المبادرات) ──────────────────────
  const sustainableInis = input.initiatives.filter(i => i.is_sustainable);
  const withImpact = input.initiatives.filter(i => i.impact_metrics);
  const innovationScore = Math.min(100,
    40 + withImpact.length * 10 + sustainableInis.length * 8 + validInis.length * 5
  );

  // ── المحور 5: الفريق (من 360) ──────────────────────────────
  const teamScore = input.evaluation360?.team_satisfaction_score ?? 55;

  // ── المحور 6: التقنية (من الاختبارات) ──────────────────────
  const techAssessment = input.assessmentResults.find(r => r.assessment_code === 'tech_ai_usage');
  const techScore = techAssessment?.score ?? 55;

  // ── المحور 7: النزاهة (من 360 + الاختبارات) ────────────────
  const integrityBase = input.evaluation360 ? Math.min(100, teamScore * 0.6 + leadershipScore * 0.4) : 60;
  const integrityScore = Math.min(100, integrityBase + (input.profile.committee_participations ? 10 : 0));

  const axis_scores = {
    leadership: Math.round(leadershipScore),
    strategic: Math.round(strategicScore),
    performance: Math.round(performanceScore),
    innovation: Math.round(innovationScore),
    team: Math.round(teamScore),
    technology: Math.round(techScore),
    integrity: Math.round(integrityScore),
  };

  // ── الدرجة الكلية المرجحة ─────────────────────────────────
  const total_score = Math.round(
    axis_scores.leadership * WEIGHTS.leadership +
    axis_scores.strategic * WEIGHTS.strategic +
    axis_scores.performance * WEIGHTS.performance +
    axis_scores.innovation * WEIGHTS.innovation +
    axis_scores.team * WEIGHTS.team +
    axis_scores.technology * WEIGHTS.technology +
    axis_scores.integrity * WEIGHTS.integrity
  );

  // ── مستوى الثقة ──────────────────────────────────────────
  let trust_score = 50;
  if (input.profile.completion_score >= 70) trust_score += 10;
  if (input.initiatives.length >= 2) trust_score += 10;
  if (input.initiatives.filter(i => i.evidence).length >= 1) trust_score += 8;
  if (input.kpis.filter(k => k.target_value && k.actual_value).length >= 2) trust_score += 8;
  if (input.assessmentResults.length >= 4) trust_score += 8;
  if (input.evaluation360) {
    trust_score += Math.min(15, input.evaluation360.evaluators_count * 1.5);
    trust_score -= input.evaluation360.extreme_count * 3;
    if (input.evaluation360.initiative_verification_rate >= 50) trust_score += 5;
    if (input.evaluation360.confidence_level >= 70) trust_score += 5;
  } else {
    trust_score -= 15;
    confidence_issues.push('لم يكتمل تقييم 360 — مستوى الثقة منخفض.');
  }
  trust_score = Math.max(10, Math.min(100, trust_score));

  // ── تصنيف الجاهزية ────────────────────────────────────────
  let readiness_level: GovernanceAnalysisResult['readiness_level'];
  let readiness_label: string;

  // كشف الحالات الخاصة أولاً
  const isHighPerformLowSat = axis_scores.performance >= 75 && axis_scores.team < 55;
  const isHumanLeader = axis_scores.team >= 75 && axis_scores.performance < 60;

  if (isHighPerformLowSat) {
    readiness_level = 'high_performance_low_satisfaction';
    readiness_label = 'أداء مرتفع / رضا منخفض';
    risk_flags.push('أداء مرتفع لكن رضا الفريق منخفض — لا يناسب القيادة المباشرة حالياً.');
  } else if (isHumanLeader) {
    readiness_level = 'human_leader';
    readiness_label = 'قائد إنساني محتمل';
    risk_flags.push('قوة إنسانية مرتفعة مع ضعف في الأداء والإنجاز — يحتاج تأهيلاً في المؤشرات.');
  } else if (total_score >= 85) {
    readiness_level = 'ready_now';
    readiness_label = 'جاهز الآن';
  } else if (total_score >= 75) {
    readiness_level = 'ready_within_year';
    readiness_label = 'جاهز خلال سنة';
  } else if (total_score >= 65) {
    readiness_level = 'promising';
    readiness_label = 'واعد ويحتاج تطويراً موجهاً';
  } else if (total_score >= 55) {
    readiness_level = 'specialist';
    readiness_label = 'متخصص جيد يحتاج تأهيلاً قيادياً';
  } else {
    readiness_level = 'not_suitable';
    readiness_label = 'غير مناسب للمسار القيادي حالياً';
  }

  // ── نوع القيادة ───────────────────────────────────────────
  let leadership_type: GovernanceAnalysisResult['leadership_type'];
  let leadership_type_label: string;

  // قيادة مخفية؟
  const isHidden = axis_scores.team >= 75 && axis_scores.leadership >= 70 && input.profile.completion_score < 70;
  if (isHidden) {
    leadership_type = 'hidden';
    leadership_type_label = 'قيادة مخفية محتملة';
  } else if (axis_scores.strategic >= 80) {
    leadership_type = 'strategic';
    leadership_type_label = 'استراتيجية';
  } else if (axis_scores.technology >= 75) {
    leadership_type = 'technical';
    leadership_type_label = 'تقنية';
  } else if (isHumanLeader) {
    leadership_type = 'human_leader';
    leadership_type_label = 'إنسانية';
  } else {
    leadership_type = 'operational';
    leadership_type_label = 'تشغيلية';
  }

  // ── نقاط القوة والفجوات ────────────────────────────────────
  const primary_strengths: string[] = [];
  const development_gaps: string[] = [];

  const axisLabels: Record<string, string> = {
    leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
    performance: 'الأداء والإنجاز', innovation: 'الابتكار والمبادرات',
    team: 'رضا الفريق وأصحاب العلاقة', technology: 'التقنية والذكاء الاصطناعي',
    integrity: 'النزاهة والالتزام',
  };

  for (const [axis, score] of Object.entries(axis_scores)) {
    if (score >= 78) primary_strengths.push(axisLabels[axis]);
    else if (score < 58) development_gaps.push(axisLabels[axis]);
  }

  // ── التصنيفات الخاصة ──────────────────────────────────────
  const special_flags: string[] = [];
  if (isHidden) special_flags.push('قيادة مخفية محتملة');
  if (isHighPerformLowSat) special_flags.push('أداء مرتفع مع رضا منخفض');
  if (isHumanLeader) special_flags.push('قائد إنساني محتمل');
  if (total_score >= 82 && trust_score < 60) special_flags.push('درجة عالية / ثقة منخفضة');

  if (input.evaluation360?.extreme_count && input.evaluation360.extreme_count > 0) {
    risk_flags.push(`رُصد ${input.evaluation360.extreme_count} تقييم متطرف — يحتاج مراجعة.`);
  }
  if (input.initiatives.filter(i => !i.evidence).length > input.initiatives.length / 2) {
    risk_flags.push('أكثر من نصف المبادرات بدون شواهد — يضعف قابلية التحقق.');
  }

  // ── الملخص ─────────────────────────────────────────────────
  const ai_summary = [
    `${readiness_label} — درجة الجاهزية: ${total_score}٪، مستوى الثقة: ${trust_score}٪.`,
    `نوع القيادة: ${leadership_type_label}.`,
    primary_strengths.length > 0 ? `نقاط القوة: ${primary_strengths.slice(0, 3).join('، ')}.` : '',
    development_gaps.length > 0 ? `فجوات التطوير: ${development_gaps.slice(0, 2).join('، ')}.` : '',
    special_flags.length > 0 ? `تنبيهات: ${special_flags.join(' | ')}.` : '',
  ].filter(Boolean).join(' ');

  const governance_recommendation = readiness_level === 'ready_now'
    ? 'يُوصى باعتماد التصنيف وتحويل الملف لخطة تمكين وتكليف مناسب.'
    : readiness_level === 'ready_within_year'
    ? 'يُوصى باعتماد التصنيف مع خطة تطوير قيادي مركزة لمدة 6-12 شهراً.'
    : readiness_level === 'promising'
    ? 'يُوصى بخطة تطوير موجهة مع إعادة تقييم بعد 12-18 شهراً.'
    : readiness_level === 'high_performance_low_satisfaction'
    ? 'يُوصى بمسار تطوير إنساني قبل أي تكليف قيادي مباشر.'
    : readiness_level === 'human_leader'
    ? 'يُوصى بمسار تطوير في المؤشرات والأداء قبل اعتماد الجاهزية.'
    : 'يُوصى بمسار تخصصي أو مهني وليس قيادياً في هذه المرحلة.';

  return {
    axis_scores,
    total_score,
    trust_score: Math.round(trust_score),
    readiness_level,
    readiness_label,
    leadership_type,
    leadership_type_label,
    primary_strengths,
    development_gaps,
    special_flags,
    ai_summary,
    governance_recommendation,
    risk_flags,
    confidence_issues,
  };
}
