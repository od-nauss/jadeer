/**
 * Jadeer AI Analysis Engine — Rules-Based
 * محرك التحليل الذكي لمنصة جدير (قواعد داخلية، بدون API خارجي)
 * يمكن استبداله لاحقاً بـ Claude API عبر تغيير الاستدعاء فقط
 */

export interface AnalysisScore {
  score: number;         // 0–100
  label: 'ممتاز' | 'جيد' | 'مقبول' | 'يحتاج تحسين' | 'ضعيف';
  color: 'sage' | 'primary' | 'gold' | 'wine';
}

export interface AnalysisFeedback {
  type: 'success' | 'warning' | 'info' | 'error';
  text: string;
}

export interface ProfileAnalysisResult {
  completeness: AnalysisScore;
  clarity: AnalysisScore;
  verifiability: AnalysisScore;
  leadership_relevance: AnalysisScore;
  overall: AnalysisScore;
  feedback: AnalysisFeedback[];
}

export interface InitiativeAnalysisResult {
  impact_clarity: AnalysisScore;
  role_clarity: AnalysisScore;
  verifiability: AnalysisScore;
  innovation: AnalysisScore;
  overall: AnalysisScore;
  feedback: AnalysisFeedback[];
}

export interface KpiAnalysisResult {
  definition_quality: AnalysisScore;
  measurement_quality: AnalysisScore;
  decision_impact: AnalysisScore;
  overall: AnalysisScore;
  feedback: AnalysisFeedback[];
}

export interface ConsistencyResult {
  consistency_score: AnalysisScore;
  verifiability_score: AnalysisScore;
  flags: AnalysisFeedback[];
}

export interface NomineeListAnalysisResult {
  diversity_score: AnalysisScore;
  coverage_score: AnalysisScore;
  feedback: AnalysisFeedback[];
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function scoreToLabel(score: number): AnalysisScore['label'] {
  if (score >= 85) return 'ممتاز';
  if (score >= 70) return 'جيد';
  if (score >= 55) return 'مقبول';
  if (score >= 35) return 'يحتاج تحسين';
  return 'ضعيف';
}

function scoreToColor(score: number): AnalysisScore['color'] {
  if (score >= 75) return 'sage';
  if (score >= 55) return 'primary';
  if (score >= 35) return 'gold';
  return 'wine';
}

function makeScore(score: number): AnalysisScore {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { score: clamped, label: scoreToLabel(clamped), color: scoreToColor(clamped) };
}

function textLength(text: string | null | undefined, good = 60, great = 120): number {
  const len = (text || '').trim().length;
  if (len === 0) return 0;
  if (len < 20) return 20;
  if (len < good) return 50;
  if (len < great) return 80;
  return 100;
}

// ──────────────────────────────────────────────
// Profile Analysis
// ──────────────────────────────────────────────
export function analyzeProfile(profile: Record<string, unknown>): ProfileAnalysisResult {
  const feedback: AnalysisFeedback[] = [];

  // Completeness (35% weight)
  const basicFields = ['full_name', 'employee_number', 'job_title', 'department', 'years_of_experience'];
  const qualFields = ['qualification', 'specialization', 'educational_institution', 'graduation_year'];
  const expFields = ['internal_experience', 'current_tasks'];
  const skillFields = ['leadership_skills', 'technical_skills'];

  const basicFilled = basicFields.filter(f => profile[f]).length;
  const qualFilled = qualFields.filter(f => profile[f]).length;
  const expFilled = expFields.filter(f => profile[f]).length;
  const skillFilled = skillFields.filter(f => {
    const v = profile[f];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;

  const completenessScore =
    (basicFilled / basicFields.length) * 40 +
    (qualFilled / qualFields.length) * 20 +
    (expFilled / expFields.length) * 25 +
    (skillFilled / skillFields.length) * 15;

  if (basicFilled < basicFields.length) {
    feedback.push({ type: 'error', text: 'البيانات الأساسية غير مكتملة — أكمل الاسم والمسمى والإدارة وسنوات الخبرة.' });
  }
  if (qualFilled < 2) {
    feedback.push({ type: 'warning', text: 'أضف المؤهل العلمي والتخصص لتعزيز ملفك.' });
  }
  if (!profile['internal_experience']) {
    feedback.push({ type: 'warning', text: 'لم تُضف خبراتك داخل المنظمة — هذا محور مهم للجنة.' });
  }

  // Clarity (25% weight)
  const clarityScore =
    textLength(profile['internal_experience'] as string, 80, 200) * 0.4 +
    textLength(profile['current_tasks'] as string, 60, 150) * 0.3 +
    textLength(profile['past_leadership_tasks'] as string, 60, 150) * 0.3;

  if ((profile['internal_experience'] as string || '').length < 80) {
    feedback.push({ type: 'info', text: 'وضّح خبراتك داخل المنظمة بأمثلة ملموسة وليس وصفاً عاماً.' });
  }

  // Verifiability (25% weight)
  const hasWitnesses = (profile['committee_participations'] as string || '').length > 20;
  const hasProjects = (profile['led_projects'] as string || '').length > 20;
  const hasSkillsTools = Array.isArray(profile['systems_used']) && (profile['systems_used'] as unknown[]).length > 0;
  const verifiabilityScore = (hasWitnesses ? 40 : 0) + (hasProjects ? 35 : 0) + (hasSkillsTools ? 25 : 0);

  if (!hasProjects) {
    feedback.push({ type: 'warning', text: 'أضف مشاريع قدتها أو شاركت فيها — تُعزز قابلية التحقق.' });
  }
  if (!hasSkillsTools) {
    feedback.push({ type: 'info', text: 'أضف الأنظمة والأدوات التي تستخدمها لإثبات النضج التقني.' });
  }

  // Leadership relevance (15% weight)
  const leadershipKeywords = ['قاد', 'فريق', 'مشروع', 'لجنة', 'مبادرة', 'تطوير', 'قرار', 'استراتيجي', 'تحسين'];
  const allText = [profile['internal_experience'], profile['past_leadership_tasks'], profile['current_tasks']].join(' ');
  const keywordCount = leadershipKeywords.filter(k => (allText as string).includes(k)).length;
  const leadershipScore = Math.min(100, keywordCount * 12);

  if (keywordCount < 3) {
    feedback.push({ type: 'info', text: 'ارتبط في الوصف بمفاهيم قيادية: قيادة فرق، اتخاذ قرار، مبادرات، مشاريع.' });
  }

  const overall = completenessScore * 0.35 + clarityScore * 0.25 + verifiabilityScore * 0.25 + leadershipScore * 0.15;

  if (overall >= 80) {
    feedback.unshift({ type: 'success', text: 'ملفك القيادي في مستوى جيد. راجع الملاحظات أدناه لمزيد من التحسين.' });
  }

  return {
    completeness: makeScore(completenessScore),
    clarity: makeScore(clarityScore),
    verifiability: makeScore(verifiabilityScore),
    leadership_relevance: makeScore(leadershipScore),
    overall: makeScore(overall),
    feedback,
  };
}

// ──────────────────────────────────────────────
// Initiative Analysis
// ──────────────────────────────────────────────
export function analyzeInitiative(ini: Record<string, unknown>): InitiativeAnalysisResult {
  const feedback: AnalysisFeedback[] = [];

  // Impact clarity
  const hasImpact = (ini['achieved_impact'] as string || '').length > 30;
  const hasMetrics = (ini['impact_metrics'] as string || '').length > 20;
  const impactScore = (hasImpact ? 50 : 10) + (hasMetrics ? 50 : 0);

  if (!hasImpact) feedback.push({ type: 'error', text: 'الأثر المحقق غير محدد — وضّح ما الذي تغيّر بسبب هذه المبادرة.' });
  if (!hasMetrics) feedback.push({ type: 'warning', text: 'أضف مؤشراً رقمياً للأثر: نسبة تحسين، وقت موفر، عدد مستفيدين.' });

  // Role clarity
  const roles = ['was_idea_owner', 'led_implementation', 'participated_implementation', 'coordinated_parties', 'developed_tool', 'tracked_impact'];
  const selectedRoles = roles.filter(r => ini[r] === true).length;
  const hasProblemDesc = (ini['problem_description'] as string || '').length > 40;
  const roleScore = Math.min(100, selectedRoles * 20 + (hasProblemDesc ? 20 : 0));

  if (selectedRoles === 0) feedback.push({ type: 'error', text: 'لم تحدد دورك في المبادرة — حدد ما إذا كنت قائداً، منفذاً، أو منسقاً.' });
  if (!hasProblemDesc) feedback.push({ type: 'warning', text: 'وصف المشكلة قبل المبادرة يعزز مصداقيتها.' });

  // Verifiability
  const hasEvidence = (ini['evidence'] as string || '').length > 20;
  const hasBeneficiaries = !!(ini['beneficiary_group'] || ini['beneficiary_count']);
  const verifyScore = (hasEvidence ? 60 : 10) + (hasBeneficiaries ? 40 : 0);

  if (!hasEvidence) feedback.push({ type: 'warning', text: 'أضف شواهد أو أسماء أشخاص يمكنهم تأكيد هذه المبادرة.' });

  // Innovation
  const innovationMap: Record<string, number> = { low: 20, medium: 60, high: 90, very_high: 100 };
  const innovScore = innovationMap[ini['innovation_level'] as string] ?? 40;
  const isSustainable = ini['is_sustainable'] === true;
  const isGeneralizable = ini['is_generalizable'] === true;
  const innovationScore = innovScore * 0.6 + (isSustainable ? 20 : 0) + (isGeneralizable ? 20 : 0);

  if (!ini['innovation_level']) feedback.push({ type: 'info', text: 'حدد مستوى الابتكار في المبادرة.' });

  const overall = impactScore * 0.35 + roleScore * 0.30 + verifyScore * 0.25 + innovationScore * 0.10;

  if (overall >= 80) feedback.unshift({ type: 'success', text: 'مبادرة قوية وواضحة.' });

  return {
    impact_clarity: makeScore(impactScore),
    role_clarity: makeScore(roleScore),
    verifiability: makeScore(verifyScore),
    innovation: makeScore(innovationScore),
    overall: makeScore(overall),
    feedback,
  };
}

// ──────────────────────────────────────────────
// KPI Analysis
// ──────────────────────────────────────────────
export function analyzeKpi(kpi: Record<string, unknown>): KpiAnalysisResult {
  const feedback: AnalysisFeedback[] = [];

  // Definition quality
  const hasName = (kpi['name'] as string || '').length > 5;
  const hasPurpose = (kpi['purpose'] as string || '').length > 30;
  const hasProblem = (kpi['problem_addressed'] as string || '').length > 20;
  const defScore = (hasName ? 20 : 0) + (hasPurpose ? 40 : 0) + (hasProblem ? 40 : 0);

  if (!hasPurpose) feedback.push({ type: 'error', text: 'حدد الغرض من المؤشر — ماذا يقيس ولماذا؟' });
  if (!hasProblem) feedback.push({ type: 'warning', text: 'اذكر المشكلة التي يعالجها هذا المؤشر.' });

  // Measurement quality
  const hasTarget = (kpi['target_value'] as string || '').length > 1;
  const hasActual = (kpi['actual_value'] as string || '').length > 1;
  const hasEvidence = (kpi['evidence'] as string || '').length > 20;
  const measScore = (hasTarget ? 35 : 0) + (hasActual ? 35 : 0) + (hasEvidence ? 30 : 0);

  if (!hasTarget) feedback.push({ type: 'error', text: 'أضف المستهدف — المؤشر بدون مستهدف يفقد معناه.' });
  if (!hasActual) feedback.push({ type: 'warning', text: 'أضف النتيجة الفعلية المحققة.' });
  if (!hasEvidence) feedback.push({ type: 'warning', text: 'أضف مصدر البيانات أو شاهداً على صحة المؤشر.' });

  // Decision impact
  const hasDecision = (kpi['used_in_decision'] as string || '').length > 30;
  const hasTeamImpact = (kpi['team_impact'] as string || '').length > 20;
  const isApproved = kpi['is_officially_approved'] === true;
  const decisionScore = (hasDecision ? 50 : 0) + (hasTeamImpact ? 30 : 0) + (isApproved ? 20 : 0);

  if (!hasDecision) feedback.push({ type: 'warning', text: 'كيف استخدمت هذا المؤشر في اتخاذ قرار؟ هذا جوهر قيمة المؤشر.' });
  if (!hasTeamImpact) feedback.push({ type: 'info', text: 'وضّح أثر هذا المؤشر على الفريق أو الإدارة.' });

  const overall = defScore * 0.30 + measScore * 0.40 + decisionScore * 0.30;

  if (overall >= 80) feedback.unshift({ type: 'success', text: 'مؤشر ناضج وواضح.' });

  return {
    definition_quality: makeScore(defScore),
    measurement_quality: makeScore(measScore),
    decision_impact: makeScore(decisionScore),
    overall: makeScore(overall),
    feedback,
  };
}

// ──────────────────────────────────────────────
// Consistency Analysis
// ──────────────────────────────────────────────
export function analyzeConsistency(params: {
  initiativeCount: number;
  kpiCount: number;
  initiativesWithEvidence: number;
  kpisWithTarget: number;
  assessmentCompleted: number;
  profileScore: number;
}): ConsistencyResult {
  const flags: AnalysisFeedback[] = [];
  const { initiativeCount, kpiCount, initiativesWithEvidence, kpisWithTarget, assessmentCompleted, profileScore } = params;

  // Consistency
  let consistencyScore = 60;
  if (initiativeCount >= 2) consistencyScore += 15;
  if (kpiCount >= 2) consistencyScore += 15;
  if (initiativesWithEvidence / Math.max(initiativeCount, 1) > 0.5) consistencyScore += 10;
  else flags.push({ type: 'warning', text: 'أكثر من نصف مبادراتك تفتقر إلى شواهد — هذا يضعف مصداقية الملف.' });

  // Verifiability
  let verifyScore = profileScore * 0.4;
  verifyScore += (kpisWithTarget / Math.max(kpiCount, 1)) * 60;
  if (assessmentCompleted < 4) {
    flags.push({ type: 'error', text: `أكملت ${assessmentCompleted} من 8 اختبارات فقط — يُنصح بإكمال 4 على الأقل قبل الإرسال.` });
  }

  if (initiativeCount === 0) flags.push({ type: 'error', text: 'لا توجد مبادرات مضافة. المبادرات محور أساسي في التقييم.' });
  if (kpiCount === 0) flags.push({ type: 'error', text: 'لا توجد مؤشرات أداء. المؤشرات تثبت نضجك البياني.' });

  if (consistencyScore >= 80 && flags.length === 0) {
    flags.unshift({ type: 'success', text: 'بيانات ملفك متسقة وقابلة للتحقق بشكل جيد.' });
  }

  return {
    consistency_score: makeScore(consistencyScore),
    verifiability_score: makeScore(verifyScore),
    flags,
  };
}

// ──────────────────────────────────────────────
// Nominee List Analysis
// ──────────────────────────────────────────────
export function analyzeNominees(nominees: Array<{
  relationship_type: string;
  knowledge_duration?: string;
  can_verify_initiatives?: boolean;
  can_verify_kpis?: boolean;
}>): NomineeListAnalysisResult {
  const feedback: AnalysisFeedback[] = [];

  const types = nominees.map(n => n.relationship_type);
  const unique = new Set(types).size;
  const hasManager = types.some(t => ['direct_manager', 'previous_manager'].includes(t));
  const hasPeer = types.some(t => t === 'peer');
  const hasSubordinate = types.some(t => ['subordinate', 'team_member'].includes(t));
  const hasStakeholder = types.some(t => ['stakeholder', 'project_partner', 'internal_beneficiary'].includes(t));

  const canVerifyIni = nominees.filter(n => n.can_verify_initiatives).length;
  const canVerifyKpi = nominees.filter(n => n.can_verify_kpis).length;

  // Diversity
  let diversityScore = 0;
  if (hasManager) diversityScore += 25;
  else feedback.push({ type: 'warning', text: 'أضف مديراً حالياً أو سابقاً ضمن المقيمين.' });
  if (hasPeer) diversityScore += 20;
  else feedback.push({ type: 'warning', text: 'أضف زملاء ضمن القائمة لتنوع وجهات النظر.' });
  if (hasSubordinate) diversityScore += 20;
  else feedback.push({ type: 'info', text: 'إضافة مرؤوسين أو أعضاء فريق يُعزز تنوع التقييم.' });
  if (hasStakeholder) diversityScore += 20;
  diversityScore += Math.min(15, unique * 3);

  // Coverage
  let coverageScore = 0;
  if (nominees.length >= 15) coverageScore += 40;
  else if (nominees.length >= 10) coverageScore += 20;
  else feedback.push({ type: 'error', text: `لديك ${nominees.length} من 15 مقيماً مطلوباً. أكمل القائمة.` });
  coverageScore += Math.min(30, canVerifyIni * 10);
  coverageScore += Math.min(30, canVerifyKpi * 10);

  if (canVerifyIni < 2) feedback.push({ type: 'warning', text: 'أضف مقيمين يمكنهم تأكيد مبادراتك.' });
  if (canVerifyKpi < 2) feedback.push({ type: 'warning', text: 'أضف مقيمين يمكنهم تأكيد مؤشرات أدائك.' });

  if (diversityScore >= 75 && coverageScore >= 70) {
    feedback.unshift({ type: 'success', text: 'قائمة مقيمين متوازنة ومتنوعة.' });
  }

  return {
    diversity_score: makeScore(diversityScore),
    coverage_score: makeScore(coverageScore),
    feedback,
  };
}

// ──────────────────────────────────────────────
// Assessment Pattern Analysis
// ──────────────────────────────────────────────
export function analyzeAssessmentPattern(results: Array<{
  assessment_code: string;
  score: number;
}>): {
  strengths: string[];
  gaps: string[];
  leadership_pattern: string;
  overall_score: number;
} {
  const scoreMap: Record<string, number> = {};
  for (const r of results) {
    scoreMap[r.assessment_code] = r.score;
  }

  const avg = results.length > 0
    ? results.reduce((s, r) => s + r.score, 0) / results.length
    : 0;

  const strengths: string[] = [];
  const gaps: string[] = [];

  const labels: Record<string, string> = {
    leadership_influence: 'القيادة والتأثير',
    strategic_thinking: 'التفكير الاستراتيجي',
    decision_making: 'اتخاذ القرار',
    crisis_management: 'إدارة الأزمات',
    emotional_intelligence: 'الذكاء العاطفي',
    team_management: 'إدارة الفريق',
    tech_ai_usage: 'التقنية والذكاء الاصطناعي',
    case_study: 'دراسة الحالة',
  };

  for (const [code, label] of Object.entries(labels)) {
    if (scoreMap[code] !== undefined) {
      if (scoreMap[code] >= 75) strengths.push(label);
      else if (scoreMap[code] < 55) gaps.push(label);
    }
  }

  let pattern = 'قائد متوازن';
  const strategic = scoreMap['strategic_thinking'] ?? 0;
  const operational = (scoreMap['decision_making'] ?? 0 + (scoreMap['crisis_management'] ?? 0)) / 2;
  const human = scoreMap['emotional_intelligence'] ?? 0;

  if (strategic > operational + 15 && strategic > human + 15) pattern = 'قائد استراتيجي';
  else if (human > strategic + 15 && human > operational + 10) pattern = 'قائد إنساني';
  else if (operational > strategic + 15) pattern = 'قائد تشغيلي';

  return { strengths, gaps, leadership_pattern: pattern, overall_score: Math.round(avg) };
}
