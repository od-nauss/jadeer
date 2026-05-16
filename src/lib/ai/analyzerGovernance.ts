/**
 * analyzerGovernance.ts
 * محرك التحليل الشامل للجنة الحوكمة — يجمع كل مصادر البيانات ويولد درجة مرجحة
 * ويكشف المخاطر والتحيزات ويقترح التصنيف النهائي
 */

export interface GovernanceScoreInput {
  profile: {
    completion_score: number;
    years_of_experience?: number | null;
    internal_experience?: string | null;
    led_projects?: string | null;
    committee_participations?: string | null;
  };
  initiatives: Array<{
    ai_score: number;
    achieved_impact?: string | null;
    impact_metrics?: string | null;
    evidence?: string | null;
    is_sustainable?: boolean | null;
  }>;
  kpis: Array<{
    ai_score: number;
    target_value?: string | null;
    actual_value?: string | null;
    used_in_decision?: string | null;
    is_officially_approved?: boolean | null;
  }>;
  assessmentResults: Array<{
    assessment_code: string;
    score: number;
    thinking_pattern?: string | null;
  }>;
  evaluation360: {
    overall_score: number;
    team_satisfaction_score: number;
    confidence_level: number;
    extreme_count: number;
    evaluators_count: number;
    initiative_verification_rate: number;
    kpi_verification_rate: number;
  } | null;
}

export interface GovernanceScoreResult {
  total_score: number;
  trust_score: number;
  readiness_label: string;
  readiness_level: string;
  leadership_type_label: string;
  leadership_type: string;
  ai_summary: string;
  governance_recommendation: string;
  primary_strengths: string[];
  development_gaps: string[];
  risk_flags: string[];
  confidence_issues: string[];
  special_flags: string[];
  axis_scores: {
    leadership: number;
    strategic: number;
    performance: number;
    innovation: number;
    team: number;
    technology: number;
    integrity: number;
  };
}

/** أوزان المصادر من 100 */
const WEIGHTS = {
  profile: 15,       // اكتمال الملف والخبرة
  initiatives: 20,   // المبادرات والإنجازات
  kpis: 15,          // مؤشرات الأداء
  assessments: 15,   // الاختبارات الذكية
  eval360: 35,       // تقييم 360 درجة
};

const ASSESSMENT_AXIS_MAP: Record<string, string> = {
  leadership_style: 'leadership',
  strategic_thinking: 'strategic',
  innovation: 'innovation',
  emotional_intelligence: 'team',
  tech_readiness: 'technology',
  decision_making: 'strategic',
  crisis_management: 'leadership',
  communication: 'team',
};

export function computeGovernanceScore(input: GovernanceScoreInput): GovernanceScoreResult {
  const { profile, initiatives, kpis, assessmentResults, evaluation360 } = input;

  // ── 1. درجة الملف ──────────────────────────────────────────
  let profileScore = profile.completion_score || 0;
  if ((profile.years_of_experience || 0) >= 10) profileScore = Math.min(100, profileScore + 5);
  if (profile.led_projects && profile.led_projects.length > 20) profileScore = Math.min(100, profileScore + 3);
  if (profile.committee_participations && profile.committee_participations.length > 10) profileScore = Math.min(100, profileScore + 2);

  // ── 2. درجة المبادرات ──────────────────────────────────────
  let initiativesScore = 0;
  if (initiatives.length > 0) {
    const scores = initiatives.map(i => i.ai_score || 0);
    initiativesScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const verifiedCount = initiatives.filter(i => i.evidence && i.evidence.length > 5).length;
    const sustainableCount = initiatives.filter(i => i.is_sustainable).length;
    initiativesScore = Math.min(100, initiativesScore + (verifiedCount * 2) + (sustainableCount * 1.5));
  }

  // ── 3. درجة المؤشرات ───────────────────────────────────────
  let kpisScore = 0;
  if (kpis.length > 0) {
    const scores = kpis.map(k => k.ai_score || 0);
    kpisScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const officialCount = kpis.filter(k => k.is_officially_approved).length;
    kpisScore = Math.min(100, kpisScore + (officialCount * 2));
  }

  // ── 4. درجة الاختبارات ─────────────────────────────────────
  const axisFromAssessments: Record<string, number[]> = {};
  let assessmentAvg = 0;
  if (assessmentResults.length > 0) {
    const scores = assessmentResults.map(a => a.score || 0);
    assessmentAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
    for (const ar of assessmentResults) {
      const axis = ASSESSMENT_AXIS_MAP[ar.assessment_code] || 'performance';
      if (!axisFromAssessments[axis]) axisFromAssessments[axis] = [];
      axisFromAssessments[axis].push(ar.score || 0);
    }
  }

  // ── 5. درجة 360 ────────────────────────────────────────────
  const score360 = evaluation360?.overall_score || 0;
  const team360 = evaluation360?.team_satisfaction_score || 0;
  const confidence360 = evaluation360?.confidence_level || 0;
  const evalCount = evaluation360?.evaluators_count || 0;
  const initVerRate = evaluation360?.initiative_verification_rate || 0;
  const kpiVerRate = evaluation360?.kpi_verification_rate || 0;

  // ── 6. الدرجة الكلية المرجحة ───────────────────────────────
  const has360 = evaluation360 !== null && evalCount >= 3;
  const effective360Weight = has360 ? WEIGHTS.eval360 : 0;
  const redistrib = has360 ? 0 : WEIGHTS.eval360 / 4;

  const totalDenom = WEIGHTS.profile + WEIGHTS.initiatives + WEIGHTS.kpis + WEIGHTS.assessments + effective360Weight;

  const rawScore =
    (profileScore * (WEIGHTS.profile + redistrib) +
      initiativesScore * (WEIGHTS.initiatives + redistrib) +
      kpisScore * (WEIGHTS.kpis + redistrib) +
      assessmentAvg * (WEIGHTS.assessments + redistrib) +
      score360 * effective360Weight) /
    totalDenom;

  const total_score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // ── 7. درجة الثقة ──────────────────────────────────────────
  let trustBase = 40;
  if (profile.completion_score >= 80) trustBase += 10;
  if (initiatives.length >= 3) trustBase += 8;
  const verifiedInits = initiatives.filter(i => i.evidence && i.evidence.length > 5).length;
  trustBase += Math.min(verifiedInits * 3, 12);
  if (has360) trustBase += Math.round(confidence360 * 0.2);
  if (initVerRate > 60) trustBase += 5;
  if (kpiVerRate > 60) trustBase += 5;
  const trust_score = Math.min(95, trustBase);

  // ── 8. درجات المحاور السبعة ────────────────────────────────
  const axis_scores = {
    leadership: calcAxis('leadership', axisFromAssessments, evaluation360, initiativesScore),
    strategic: calcAxis('strategic', axisFromAssessments, evaluation360, profileScore),
    performance: calcAxis('performance', axisFromAssessments, evaluation360, kpisScore),
    innovation: calcAxis('innovation', axisFromAssessments, evaluation360, initiativesScore),
    team: has360 ? team360 : calcAxis('team', axisFromAssessments, evaluation360, 50),
    technology: calcAxis('technology', axisFromAssessments, evaluation360, assessmentAvg),
    integrity: Math.round((trust_score * 0.6) + (has360 ? score360 * 0.4 : total_score * 0.4)),
  };

  // ── 9. مستوى الجاهزية ──────────────────────────────────────
  const { level, label } = resolveReadiness(total_score, trust_score, team360, has360);

  // ── 10. نوع القيادة ────────────────────────────────────────
  const { type, type_label } = resolveLeadershipType(axis_scores, assessmentResults);

  // ── 11. نقاط القوة والفجوات ────────────────────────────────
  const primary_strengths = extractStrengths(axis_scores, initiatives, kpis, has360, team360);
  const development_gaps = extractGaps(axis_scores, profile, has360, evalCount);

  // ── 12. مخاطر وتنبيهات ─────────────────────────────────────
  const risk_flags = extractRisks(input, axis_scores, has360, evalCount);
  const confidence_issues = extractConfidenceIssues(input, trust_score, initVerRate, kpiVerRate);
  const special_flags = extractSpecialFlags(total_score, trust_score, axis_scores, has360, team360);

  // ── 13. الملخص الذكي ───────────────────────────────────────
  const ai_summary = buildAiSummary({
    total_score, trust_score, level, type_label,
    primary_strengths, development_gaps, has360, evalCount,
  });

  const governance_recommendation = buildRecommendation(level, total_score, trust_score, risk_flags);

  return {
    total_score,
    trust_score,
    readiness_label: label,
    readiness_level: level,
    leadership_type_label: type_label,
    leadership_type: type,
    ai_summary,
    governance_recommendation,
    primary_strengths,
    development_gaps,
    risk_flags,
    confidence_issues,
    special_flags,
    axis_scores,
  };
}

function calcAxis(
  axis: string,
  fromAssessments: Record<string, number[]>,
  eval360: GovernanceScoreInput['evaluation360'],
  fallback: number
): number {
  const vals: number[] = [];
  if (fromAssessments[axis]) vals.push(...fromAssessments[axis]);
  if (eval360 && axis in (eval360 as Record<string, unknown>)) {
    // not every axis is in evaluation360 directly
  }
  if (vals.length === 0) return Math.round(Math.max(0, Math.min(100, fallback)));
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function resolveReadiness(total: number, trust: number, team: number, has360: boolean) {
  if (total >= 85 && trust >= 75 && (!has360 || team >= 70)) {
    return { level: 'ready_now', label: 'جاهز الآن' };
  }
  if (total >= 72 && trust >= 60) {
    return { level: 'ready_within_year', label: 'جاهز خلال سنة' };
  }
  if (total >= 58) {
    return { level: 'promising', label: 'واعد ويحتاج تطويراً موجهاً' };
  }
  if (team < 55 && has360) {
    return { level: 'high_performance_low_satisfaction', label: 'إنجاز عالٍ / رضا منخفض' };
  }
  if (total >= 45) {
    return { level: 'specialist', label: 'متخصص يحتاج تجربة قيادية' };
  }
  return { level: 'not_suitable', label: 'لا يناسب القيادة المباشرة حالياً' };
}

function resolveLeadershipType(
  axes: GovernanceScoreResult['axis_scores'],
  assessments: GovernanceScoreInput['assessmentResults']
) {
  const patterns = assessments.map(a => a.thinking_pattern).filter(Boolean);
  if (patterns.includes('strategic') && axes.strategic >= 75) {
    return { type: 'strategic', type_label: 'قائد استراتيجي' };
  }
  if (patterns.includes('transformational') || (axes.innovation >= 75 && axes.leadership >= 70)) {
    return { type: 'transformational', type_label: 'قائد تحويلي' };
  }
  if (axes.team >= 80 && axes.leadership >= 65) {
    return { type: 'human_leader', type_label: 'قائد إنساني' };
  }
  if (axes.technology >= 80) {
    return { type: 'technical', type_label: 'قائد تقني متخصص' };
  }
  if (axes.performance >= 80 && axes.strategic >= 70) {
    return { type: 'operational', type_label: 'قائد تشغيلي' };
  }
  return { type: 'institutional', type_label: 'قائد تطوير مؤسسي' };
}

function extractStrengths(
  axes: GovernanceScoreResult['axis_scores'],
  initiatives: GovernanceScoreInput['initiatives'],
  kpis: GovernanceScoreInput['kpis'],
  has360: boolean,
  team360: number
): string[] {
  const strengths: string[] = [];
  if (axes.leadership >= 75) strengths.push('قدرة قيادية وتأثيرية مرتفعة');
  if (axes.strategic >= 75) strengths.push('تفكير استراتيجي واضح');
  if (axes.performance >= 75) strengths.push('مستوى أداء وإنجاز متميز');
  if (axes.innovation >= 75) strengths.push('قدرة ابتكارية وريادة المبادرات');
  if (has360 && team360 >= 80) strengths.push('رضا مرتفع من الفريق والمحيط');
  if (axes.technology >= 75) strengths.push('توظيف متقدم للتقنية في العمل');
  const sustainedInits = initiatives.filter(i => i.is_sustainable).length;
  if (sustainedInits >= 2) strengths.push(`${sustainedInits} مبادرات مستدامة الأثر`);
  const officialKpis = kpis.filter(k => k.is_officially_approved).length;
  if (officialKpis >= 2) strengths.push(`${officialKpis} مؤشرات أداء معتمدة رسمياً`);
  return strengths.slice(0, 5);
}

function extractGaps(
  axes: GovernanceScoreResult['axis_scores'],
  profile: GovernanceScoreInput['profile'],
  has360: boolean,
  evalCount: number
): string[] {
  const gaps: string[] = [];
  if (axes.leadership < 60) gaps.push('تطوير مهارات القيادة والتأثير');
  if (axes.strategic < 60) gaps.push('تعزيز التفكير الاستراتيجي ورؤية المستقبل');
  if (axes.innovation < 60) gaps.push('تعزيز الإبداع وقيادة المبادرات');
  if (axes.team < 60) gaps.push('تحسين ديناميكية العمل مع الفريق');
  if (axes.technology < 55) gaps.push('تعزيز استخدام الأدوات الرقمية والتقنية');
  if (!profile.years_of_experience || profile.years_of_experience < 5) gaps.push('بناء رصيد خبرة قيادية ميدانية');
  if (has360 && evalCount < 5) gaps.push('توسيع دائرة التقييم لتشمل فئات أكثر تنوعاً');
  return gaps.slice(0, 4);
}

function extractRisks(
  input: GovernanceScoreInput,
  axes: GovernanceScoreResult['axis_scores'],
  has360: boolean,
  evalCount: number
): string[] {
  const flags: string[] = [];
  const { evaluation360 } = input;

  if (has360 && evaluation360 && evaluation360.extreme_count >= 2) {
    flags.push(`رُصد ${evaluation360.extreme_count} تقييمات متطرفة في نتائج 360 — احتمال وجود تحيز`);
  }
  if (has360 && evalCount < 4) {
    flags.push('عدد المقيمين أقل من الحد الأمثل (4) مما يضعف مصداقية التقييم');
  }
  if (input.profile.completion_score < 60) {
    flags.push(`اكتمال الملف منخفض (${input.profile.completion_score}٪) — يُوصى باستكمال البيانات قبل القرار`);
  }
  if (axes.integrity < 60) {
    flags.push('مؤشر النزاهة أدنى من المستوى المتوقع — يستوجب مزيداً من التدقيق');
  }
  if (has360 && axes.team < 50) {
    flags.push('رضا الفريق منخفض جداً — يُوصى بالتحقق من ديناميكيات بيئة العمل');
  }
  return flags;
}

function extractConfidenceIssues(
  input: GovernanceScoreInput,
  trust_score: number,
  initVerRate: number,
  kpiVerRate: number
): string[] {
  const issues: string[] = [];
  if (trust_score < 55) issues.push('مستوى الثقة الكلي في النتائج منخفض — البيانات غير مكتملة أو غير محققة');
  if (input.initiatives.length > 0 && initVerRate < 40) {
    issues.push(`نسبة التحقق من المبادرات منخفضة (${initVerRate}٪) — يُوصى بطلب أدلة إضافية`);
  }
  if (input.kpis.length > 0 && kpiVerRate < 40) {
    issues.push(`نسبة التحقق من المؤشرات منخفضة (${kpiVerRate}٪) — يُوصى بالتحقق من المصادر الرسمية`);
  }
  if (input.assessmentResults.length === 0) {
    issues.push('لم يكتمل أي اختبار ذكاء — نتائج التحليل النفسي والمعرفي غير متوفرة');
  }
  return issues;
}

function extractSpecialFlags(
  total: number,
  trust: number,
  axes: GovernanceScoreResult['axis_scores'],
  has360: boolean,
  team360: number
): string[] {
  const flags: string[] = [];
  if (total >= 88 && trust >= 80) flags.push('🌟 مرشح استثنائي — يُوصى بالنظر في مسار التعيين المباشر');
  if (has360 && team360 >= 90 && axes.leadership >= 75) flags.push('💡 نمط القيادة الإنسانية بارز — مناسب لقيادة فرق متنوعة');
  if (axes.innovation >= 85 && axes.strategic >= 80) flags.push('🚀 إمكانات تحويلية عالية — مناسب لقيادة مشاريع التحول');
  if (total >= 60 && trust < 50) flags.push('⚠ درجة جيدة لكن الثقة في البيانات منخفضة — يُوصى بمزيد من التحقق');
  return flags;
}

function buildAiSummary(ctx: {
  total_score: number;
  trust_score: number;
  level: string;
  type_label: string;
  primary_strengths: string[];
  development_gaps: string[];
  has360: boolean;
  evalCount: number;
}): string {
  const { total_score, trust_score, level, type_label, primary_strengths, development_gaps, has360, evalCount } = ctx;

  const readinessText: Record<string, string> = {
    ready_now: 'جاهز للتولي القيادي الآن',
    ready_within_year: 'قريب من الجاهزية القيادية خلال سنة',
    promising: 'واعد ويستحق الاستثمار في تطويره',
    specialist: 'متخصص يفتقر إلى تجربة قيادية كافية',
    not_suitable: 'لا يُنصح بتوليه مهام قيادية في المرحلة الراهنة',
    high_performance_low_satisfaction: 'يُحقق نتائج ممتازة لكن يحتاج تطوير الجانب الإنساني',
    human_leader: 'قائد إنساني يتميز بالتأثير الإيجابي على فريقه',
  };

  const parts: string[] = [];
  parts.push(`بناءً على تحليل شامل لجميع مصادر البيانات، يحصل المرشح على درجة إجمالية ${total_score}٪ بمستوى ثقة ${trust_score}٪.`);
  parts.push(`التصنيف: ${readinessText[level] || level}. النمط القيادي المُرصد: ${type_label}.`);

  if (primary_strengths.length > 0) {
    parts.push(`أبرز نقاط القوة: ${primary_strengths.slice(0, 3).join('، ')}.`);
  }
  if (development_gaps.length > 0) {
    parts.push(`مجالات التطوير الأولوية: ${development_gaps.slice(0, 2).join('، ')}.`);
  }
  if (has360) {
    parts.push(`استُكملت ${evalCount} تقييمات 360 درجة، مما يُعزز موثوقية النتائج.`);
  } else {
    parts.push('لم تُستكمل تقييمات 360 درجة بعد، مما يُقلل من شمولية الصورة.');
  }

  return parts.join(' ');
}

function buildRecommendation(level: string, total: number, trust: number, risks: string[]): string {
  if (risks.length >= 2) {
    return 'يُوصى بتعليق القرار لحين معالجة المخاطر المُرصدة وتوثيق ردود المرشح عليها.';
  }
  if (level === 'ready_now') {
    return 'يُوصى باعتماد الترشيح والمضي في إجراءات التعيين القيادي وفقاً للوائح المعمول بها.';
  }
  if (level === 'ready_within_year') {
    return 'يُوصى بالاعتماد المشروط مع وضع خطة تطوير مدتها 6-12 شهراً وإعادة التقييم.';
  }
  if (level === 'promising') {
    return 'يُوصى بإدراجه في برنامج تطوير قيادي موجه وإعادة التقييم خلال 12-18 شهراً.';
  }
  if (total < 50 || trust < 40) {
    return 'يُوصى بإعادة الملف للاستكمال وإخضاعه لتقييم 360 كامل قبل أي قرار.';
  }
  return 'يُوصى بدراسة الملف في ضوء احتياجات المنصب المحدد وإجراء مقابلة تخصصية مع اللجنة.';
}
