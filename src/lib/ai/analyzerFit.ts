// حساب درجة الملاءمة التنظيمية — محرك قواعد (قابل للاستبدال بـ LLM لاحقاً)

export interface FitInput {
  candidate: {
    readiness_level: string;
    leadership_type: string;
    total_score: number;
    trust_score: number;
    axis_scores: Record<string, number>;
    primary_strengths: string[];
    development_gaps: string[];
    governance_status: string; // 'approved' | 'under_review' | 'new' | etc.
    team_score: number; // axis_scores.team
    technology_score: number;
    kpi_count: number;
    initiative_count: number;
  };
  unit: {
    required_leadership_type: string;
    required_readiness_level: string;
    required_skills: string[];
    weights: Record<string, number>; // custom axis weights
    sensitivity_level: string;
    complexity_level: string;
    leadership_need_level: string;
    unit_type: string;
    employee_count: number;
    is_critical: boolean;
  };
}

export interface FitResult {
  fit_score: number;
  fit_level: 'high' | 'good' | 'conditional' | 'low' | 'not_suitable';
  confidence_score: number;
  fit_reason: string;
  strengths_match: string[];
  gaps: string[];
  risk_flags: string[];
  recommended_action: string;
  ai_summary: string;
  score_breakdown: Record<string, number>;
}

const LEADERSHIP_TYPE_COMPAT: Record<string, string[]> = {
  strategic: ['strategic', 'institutional_development', 'transformational'],
  operational: ['operational', 'high_performance_team', 'executive_admin'],
  transformational: ['transformational', 'strategic', 'innovation'],
  innovation: ['innovation', 'transformational', 'technical'],
  crisis: ['crisis', 'operational', 'high_performance_team'],
  high_performance_team: ['high_performance_team', 'operational', 'human'],
  institutional_development: ['institutional_development', 'strategic', 'transformational'],
  technical: ['technical', 'innovation', 'operational'],
  academic: ['academic', 'specialist_leadership', 'strategic'],
  executive_admin: ['executive_admin', 'operational', 'institutional_development'],
  human: ['human', 'high_performance_team', 'academic'],
  specialist_leadership: ['specialist_leadership', 'academic', 'technical'],
};

const READINESS_SCORE: Record<string, number> = {
  ready_now: 4, ready_within_year: 3, promising: 2, specialist: 2,
  not_suitable: 0, high_performance_low_satisfaction: 2, human_leader: 2,
};

const REQUIRED_READINESS_SCORE: Record<string, number> = {
  ready_now: 4, ready_within_year: 3, 'promising_with_development': 2,
  'specialist_needs_qualification': 1,
};

function scoreLeadershipMatch(candidateType: string, requiredType: string): number {
  if (!candidateType || !requiredType) return 10;
  if (candidateType === requiredType) return 25;
  const compatible = LEADERSHIP_TYPE_COMPAT[requiredType] || [];
  if (compatible.includes(candidateType)) return 17;
  return 5;
}

function scoreReadinessMatch(candidateLevel: string, requiredLevel: string): number {
  const cScore = READINESS_SCORE[candidateLevel] ?? 1;
  const rScore = REQUIRED_READINESS_SCORE[requiredLevel] ?? 3;
  if (cScore >= rScore) return 20;
  if (cScore === rScore - 1) return 13;
  if (cScore === rScore - 2) return 7;
  return 2;
}

function scoreWeightedAxes(axisScores: Record<string, number>, weights: Record<string, number>): number {
  const defaultWeights: Record<string, number> = {
    leadership: 20, strategic: 15, performance: 15,
    innovation: 15, team: 15, technology: 10, integrity: 10,
  };
  const w = Object.keys(weights).length > 0 ? weights : defaultWeights;
  const totalWeight = Object.values(w).reduce((s, v) => s + v, 0) || 100;
  let weighted = 0;
  for (const [axis, weight] of Object.entries(w)) {
    const score = axisScores[axis] ?? 50;
    weighted += (score / 100) * (weight / totalWeight);
  }
  return Math.round(weighted * 30); // max 30 points
}

function scoreSkillsMatch(gaps: string[], required_skills: string[]): number {
  if (!required_skills || required_skills.length === 0) return 10;
  const gapSet = new Set(gaps.map(g => g.toLowerCase()));
  const missing = required_skills.filter(s => gapSet.has(s.toLowerCase())).length;
  const matchRatio = 1 - (missing / required_skills.length);
  return Math.round(matchRatio * 15);
}

function scoreGovernance(status: string, trustScore: number): number {
  const base = status === 'approved' ? 7 : status === 'under_governance_review' ? 4 : 2;
  const trustBonus = trustScore >= 80 ? 3 : trustScore >= 60 ? 1 : 0;
  return Math.min(10, base + trustBonus);
}

export function computeFitScore(input: FitInput): FitResult {
  const { candidate, unit } = input;

  // حساب النقاط
  const leadershipScore = scoreLeadershipMatch(candidate.leadership_type, unit.required_leadership_type);
  const readinessScore = scoreReadinessMatch(candidate.readiness_level, unit.required_readiness_level);
  const axisScore = scoreWeightedAxes(candidate.axis_scores, unit.weights || {});
  const skillsScore = scoreSkillsMatch(candidate.development_gaps, unit.required_skills);
  const governanceScore = scoreGovernance(candidate.governance_status, candidate.trust_score);

  const rawScore = leadershipScore + readinessScore + axisScore + skillsScore + governanceScore;
  const fit_score = Math.min(100, Math.round(rawScore));

  // مستوى الملاءمة
  const fit_level: FitResult['fit_level'] =
    fit_score >= 85 ? 'high' :
    fit_score >= 70 ? 'good' :
    fit_score >= 55 ? 'conditional' :
    fit_score >= 35 ? 'low' : 'not_suitable';

  // درجة الثقة
  const confidence_score = Math.round(
    (candidate.trust_score * 0.4) +
    (candidate.governance_status === 'approved' ? 30 : 15) +
    (candidate.total_score * 0.3)
  );

  // نقاط القوة المتوافقة
  const strengths_match: string[] = [];
  const unit_type = unit.unit_type || '';
  if ((candidate.axis_scores.performance || 0) >= 70 && ['operational','division','department'].includes(unit_type)) {
    strengths_match.push('أداء تشغيلي قوي يناسب طبيعة الوحدة');
  }
  if ((candidate.axis_scores.strategic || 0) >= 70 && unit_type === 'sector') {
    strengths_match.push('تفكير استراتيجي يناسب القطاع');
  }
  if ((candidate.axis_scores.team || 0) >= 70) {
    strengths_match.push(`رضا الفريق مرتفع (${candidate.axis_scores.team || 0}%)`);
  }
  if ((candidate.axis_scores.technology || 0) >= 70 && unit.required_leadership_type === 'technical') {
    strengths_match.push('كفاءة تقنية تناسب الوحدة التقنية');
  }
  if (candidate.initiative_count >= 3) {
    strengths_match.push(`${candidate.initiative_count} مبادرة موثقة تعكس قيادة فاعلة`);
  }
  if (candidate.primary_strengths.length > 0) {
    strengths_match.push(...candidate.primary_strengths.slice(0, 2));
  }

  // الفجوات
  const gaps: string[] = [...candidate.development_gaps.slice(0, 3)];
  if ((candidate.axis_scores.strategic || 0) < 55) gaps.push('ضعف في التخطيط الاستراتيجي');
  if ((candidate.axis_scores.team || 0) < 55) gaps.push('رضا الفريق منخفض — خطر إداري');
  if (candidate.trust_score < 60) gaps.push('مستوى ثقة منخفض — يحتاج مزيداً من التحقق');

  // مؤشرات الخطر
  const risk_flags: string[] = [];
  if (unit.is_critical && candidate.readiness_level !== 'ready_now') {
    risk_flags.push('الوحدة حرجة والمرشح غير جاهز فورياً');
  }
  if ((candidate.axis_scores.team || 0) < 50) {
    risk_flags.push('رضا الفريق منخفض جداً — مخاطر إدارية');
  }
  if (candidate.governance_status !== 'approved') {
    risk_flags.push('لم تعتمد لجنة الحوكمة بطاقة المرشح بعد');
  }
  if (unit.complexity_level === 'high' && candidate.readiness_level === 'promising') {
    risk_flags.push('الوحدة عالية التعقيد والمرشح لا يزال في مرحلة النمو');
  }

  // الإجراء المقترح
  const recommended_action =
    fit_score >= 85 ? 'تكليف قيادي مباشر مع مراجعة دورية' :
    fit_score >= 70 ? 'تكليف بعد استكمال خطة تطوير قصيرة (3–6 أشهر)' :
    fit_score >= 55 ? 'تطوير مكثف قبل التكليف (6–12 شهراً)' :
    fit_score >= 35 ? 'إعادة تقييم بعد برنامج تطوير شامل' :
    'غير مناسب حالياً — يُقترح مسار قيادي مختلف';

  // الملخص الذكي
  const fitLevelAr = { high: 'عالية', good: 'جيدة', conditional: 'مشروطة', low: 'منخفضة', not_suitable: 'غير مناسب حالياً' };
  const ai_summary = [
    `درجة الملاءمة ${fit_score}% (${fitLevelAr[fit_level]}).`,
    strengths_match.length > 0 ? `نقاط القوة: ${strengths_match.slice(0, 2).join('، ')}.` : '',
    gaps.length > 0 ? `أبرز الفجوات: ${gaps.slice(0, 2).join('، ')}.` : '',
    risk_flags.length > 0 ? `مخاطر: ${risk_flags[0]}.` : '',
    recommended_action,
  ].filter(Boolean).join(' ');

  return {
    fit_score,
    fit_level,
    confidence_score: Math.min(100, confidence_score),
    fit_reason: `${fitLevelAr[fit_level]} — ${strengths_match[0] || 'بناءً على بيانات التقييم'}`,
    strengths_match,
    gaps,
    risk_flags,
    recommended_action,
    ai_summary,
    score_breakdown: { leadershipScore, readinessScore, axisScore, skillsScore, governanceScore },
  };
}

export const FIT_LEVEL_AR: Record<string, string> = {
  high: 'ملاءمة عالية',
  good: 'ملاءمة جيدة',
  conditional: 'ملاءمة مشروطة',
  low: 'ملاءمة منخفضة',
  not_suitable: 'غير مناسب حالياً',
};

export const FIT_LEVEL_COLOR: Record<string, string> = {
  high: 'text-sage bg-sage/10 border-sage/30',
  good: 'text-primary-700 bg-primary-50 border-primary-200',
  conditional: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-gold-700 bg-gold-50 border-gold-200',
  not_suitable: 'text-wine bg-rose-50 border-rose-200',
};
