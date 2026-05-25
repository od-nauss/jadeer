'use client';

import { Star, TrendingUp, Award, Target, Users, Zap, BookOpen, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

// ─── أنواع البيانات ────────────────────────────────────────────

export interface LeadershipReadinessCard {
  totalScore: number;
  trustScore: number;
  readinessLevel: string;
  readinessLabel: string;
  leadershipType: string;
  leadershipTypeLabel: string;
  axisScores: Record<string, number>;
  strengths: string[];
  gaps: string[];
  eval360Score: number | null;
  eval360Count: number;
  aiSummary?: string;
}

export interface BalancedPerformanceCard {
  institutionalImpactScore: number;   // الأثر المؤسسي
  achievementQualityScore: number;    // جودة الإنجاز
  initiativesScore: number;           // المبادرات
  learningScore: number;              // التعلم والتطوير
  teamworkScore: number;              // العلاقات والعمل الجماعي
  operationalScore: number;           // الكفاءة التشغيلية
  goalsContributionScore: number;     // المساهمة في تحقيق الأهداف
  overallPerformanceScore: number;    // المتوسط الكلي
  initiativesCount: number;
  kpisCount: number;
  approvedKpisCount: number;
  assessmentAvg: number;
}

export interface FinalRecommendationCard {
  readinessScore: number;
  performanceScore: number;
  recommendationType: 'immediate_empowerment' | 'empowerment_with_development' | 'leadership_program' | 'guided_development' | 'foundation_program';
  recommendationLabel: string;
  recommendationColor: string;
  recommendationDesc: string;
  developmentPath: string[];
  governanceDecision?: string;
  governanceNote?: string;
}

interface Props {
  card1: LeadershipReadinessCard;
  card2: BalancedPerformanceCard;
  card3: FinalRecommendationCard;
  candidateName: string;
  candidateTitle?: string;
  viewMode?: 'candidate' | 'governance' | 'executive';
}

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة والتأثير',
  strategic: 'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز',
  innovation: 'الابتكار',
  team: 'رضا الفريق',
  technology: 'التقنية',
  integrity: 'النزاهة',
};

const AXIS_ICONS: Record<string, typeof Star> = {
  leadership: Star,
  strategic: Target,
  performance: TrendingUp,
  innovation: Zap,
  team: Users,
  technology: Zap,
  integrity: Shield,
};

const PERFORMANCE_DIMENSIONS = [
  { key: 'institutionalImpactScore', label: 'الأثر المؤسسي', icon: Award, color: 'text-gold-600' },
  { key: 'achievementQualityScore', label: 'جودة الإنجاز', icon: CheckCircle2, color: 'text-sage' },
  { key: 'initiativesScore', label: 'المبادرات والريادة', icon: Zap, color: 'text-steelblue' },
  { key: 'learningScore', label: 'التعلم والتطوير', icon: BookOpen, color: 'text-primary-600' },
  { key: 'teamworkScore', label: 'العلاقات والعمل الجماعي', icon: Users, color: 'text-primary-700' },
  { key: 'operationalScore', label: 'الكفاءة التشغيلية', icon: TrendingUp, color: 'text-amber-600' },
  { key: 'goalsContributionScore', label: 'المساهمة في أهداف المنظمة', icon: Target, color: 'text-wine' },
] as const;

// ─── ألوان الاقتراح النهائي ─────────────────────────────────────

const RECOMMENDATION_STYLES: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
  immediate_empowerment: {
    bg: 'bg-green-50', border: 'border-green-300',
    badge: 'bg-sage text-white', icon: '🏆',
  },
  empowerment_with_development: {
    bg: 'bg-blue-50', border: 'border-blue-300',
    badge: 'bg-steelblue text-white', icon: '🎯',
  },
  leadership_program: {
    bg: 'bg-primary-50', border: 'border-primary-300',
    badge: 'bg-primary-700 text-white', icon: '📈',
  },
  guided_development: {
    bg: 'bg-gold-50', border: 'border-gold-300',
    badge: 'bg-gold-600 text-white', icon: '🌱',
  },
  foundation_program: {
    bg: 'bg-amber-50', border: 'border-amber-300',
    badge: 'bg-amber-700 text-white', icon: '🔧',
  },
};

// ─── المكوّن الرئيسي ────────────────────────────────────────────

export function ThreeCardsPanel({ card1, card2, card3, candidateName, candidateTitle, viewMode = 'candidate' }: Props) {
  const recStyle = RECOMMENDATION_STYLES[card3.recommendationType] || RECOMMENDATION_STYLES.guided_development;
  const axisOrder = ['leadership', 'strategic', 'performance', 'innovation', 'team', 'technology', 'integrity'];

  return (
    <div className="space-y-6" dir="rtl">

      {/* ─── ترويسة البطاقات ──────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {candidateName?.charAt(0) || '؟'}
        </div>
        <div>
          <h2 className="font-bold text-primary-700 text-lg">{candidateName}</h2>
          {candidateTitle && <p className="text-xs text-darkgray">{candidateTitle}</p>}
        </div>
        <div className="mr-auto flex items-center gap-2 text-xs text-darkgray">
          <span className="px-2 py-0.5 bg-primary-50 border border-primary-100 rounded-lg text-primary-700 font-medium">
            نظام البطاقات الثلاث
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          البطاقة الأولى: الجاهزية القيادية
         ══════════════════════════════════════════════════════════ */}
      <div className="border-2 border-primary-200 rounded-2xl overflow-hidden shadow-sm">
        {/* رأس البطاقة */}
        <div className="bg-gradient-to-l from-primary-700 to-primary-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-primary-900" />
            </div>
            <div>
              <div className="text-xs text-gold-300 font-medium">البطاقة الأولى</div>
              <div className="font-bold text-white text-base">بطاقة الجاهزية القيادية</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-gold-400">{card1.totalScore}٪</div>
            <div className="text-xs text-gold-300">درجة الجاهزية</div>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="bg-white p-5">
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            {/* مستوى الجاهزية */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
              <div className="text-xs text-darkgray mb-1">مستوى الجاهزية</div>
              <div className="font-bold text-primary-700 text-sm">{card1.readinessLabel}</div>
            </div>
            {/* نمط الكفاءة */}
            <div className="bg-gold-50 border border-gold-100 rounded-xl p-4 text-center">
              <div className="text-xs text-darkgray mb-1">نمط الكفاءة</div>
              <div className="font-bold text-gold-700 text-sm">{card1.leadershipTypeLabel}</div>
            </div>
            {/* مستوى الثقة */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <div className="text-xs text-darkgray mb-1">مستوى الثقة</div>
              <div className="font-bold text-steelblue text-sm">{card1.trustScore}٪</div>
            </div>
          </div>

          {/* المحاور السبعة */}
          <div className="mb-5">
            <div className="text-sm font-bold text-primary-700 mb-3">المحاور السبعة للجاهزية</div>
            <div className="grid md:grid-cols-2 gap-2">
              {axisOrder.filter(k => card1.axisScores[k] !== undefined).map(k => {
                const score = card1.axisScores[k];
                const color = score >= 80 ? 'bg-sage' : score >= 65 ? 'bg-primary-600' : score >= 50 ? 'bg-gold-500' : 'bg-rose-400';
                const textColor = score >= 80 ? 'text-sage' : score >= 65 ? 'text-primary-700' : 'text-gold-700';
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-darkgray">{AXIS_LABELS[k] || k}</span>
                      <span className={`font-bold ${textColor}`}>{score}٪</span>
                    </div>
                    <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* تقييم 360 + نقاط القوة والفجوات */}
          <div className="grid md:grid-cols-3 gap-4">
            {card1.eval360Count > 0 && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <div className="text-xs font-bold text-primary-700 mb-2">تقييم 360 درجة</div>
                <div className="text-2xl font-bold text-primary-700">{card1.eval360Score ?? '—'}٪</div>
                <div className="text-xs text-darkgray mt-1">من {card1.eval360Count} مقيّم</div>
              </div>
            )}

            {card1.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="text-xs font-bold text-sage mb-2">نقاط القوة</div>
                <ul className="space-y-1">
                  {card1.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-darkgray flex items-start gap-1">
                      <span className="text-sage mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {card1.gaps.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="text-xs font-bold text-amber-700 mb-2">فرص التطوير</div>
                <ul className="space-y-1">
                  {card1.gaps.slice(0, 3).map((g, i) => (
                    <li key={i} className="text-xs text-darkgray flex items-start gap-1">
                      <span className="text-amber-600 mt-0.5">◎</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          البطاقة الثانية: الأداء المتوازن
         ══════════════════════════════════════════════════════════ */}
      <div className="border-2 border-gold-300 rounded-2xl overflow-hidden shadow-sm">
        {/* رأس البطاقة */}
        <div className="bg-gradient-to-l from-gold-600 to-gold-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-gold-200 font-medium">البطاقة الثانية</div>
              <div className="font-bold text-white text-base">بطاقة الأداء المتوازن</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-white">{card2.overallPerformanceScore}٪</div>
            <div className="text-xs text-gold-200">الأثر المؤسسي الكلي</div>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="bg-white p-5">
          <div className="grid md:grid-cols-2 gap-3 mb-5">
            {PERFORMANCE_DIMENSIONS.map(({ key, label, icon: Icon, color }) => {
              const score = card2[key as keyof BalancedPerformanceCard] as number;
              const barColor = score >= 80 ? 'bg-sage' : score >= 60 ? 'bg-gold-500' : 'bg-rose-300';
              const bg = score >= 80 ? 'bg-green-50 border-green-100' : score >= 60 ? 'bg-gold-50 border-gold-100' : 'bg-rose-50 border-rose-100';
              return (
                <div key={key} className={`${bg} border rounded-xl p-3`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${color} flex-shrink-0`} />
                      <span className="text-xs font-medium text-primary-700">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${score >= 80 ? 'text-sage' : score >= 60 ? 'text-gold-700' : 'text-wine'}`}>
                      {score}٪
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* إحصاءات الإدخال */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gold-100">
            <div className="text-center">
              <div className="text-xl font-bold text-gold-700">{card2.initiativesCount}</div>
              <div className="text-xs text-darkgray">مبادرة موثقة</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary-700">{card2.kpisCount}</div>
              <div className="text-xs text-darkgray">مؤشر أداء</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-sage">{card2.approvedKpisCount}</div>
              <div className="text-xs text-darkgray">مؤشر معتمد رسمياً</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          البطاقة الثالثة: التوصية النهائية
         ══════════════════════════════════════════════════════════ */}
      <div className={`border-2 ${recStyle.border} ${recStyle.bg} rounded-2xl overflow-hidden shadow-sm`}>
        {/* رأس البطاقة */}
        <div className="bg-gradient-to-l from-primary-800 to-primary-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-gold-300" />
            </div>
            <div>
              <div className="text-xs text-gold-300 font-medium">البطاقة الثالثة</div>
              <div className="font-bold text-white text-base">بطاقة التوصية النهائية</div>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${recStyle.badge}`}>
            {recStyle.icon} {card3.recommendationLabel}
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-5">
          {/* المقارنة البيانية */}
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-xl p-4 border border-primary-100">
              <div className="text-xs text-darkgray mb-2 font-medium">درجة الجاهزية القيادية</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-primary-700">{card3.readinessScore}٪</div>
                <div className="flex-1 pb-1.5">
                  <div className="h-3 bg-primary-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${card3.readinessScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gold-200">
              <div className="text-xs text-darkgray mb-2 font-medium">درجة الأثر المؤسسي</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-gold-700">{card3.performanceScore}٪</div>
                <div className="flex-1 pb-1.5">
                  <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full" style={{ width: `${card3.performanceScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* صياغة التوصية */}
          <div className="bg-white border border-primary-100 rounded-xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-primary-700 mb-1">التوصية المؤسسية</div>
                <p className="text-sm text-darkgray leading-relaxed">{card3.recommendationDesc}</p>
              </div>
            </div>
          </div>

          {/* مسار التطوير المقترح */}
          {card3.developmentPath.length > 0 && (
            <div className="bg-white border border-gold-100 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-primary-700 mb-2">مسار التطوير المقترح</div>
              <div className="flex flex-wrap gap-2">
                {card3.developmentPath.map((step, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-primary-50 border border-primary-100 text-primary-700 px-2.5 py-1 rounded-lg">
                    <span className="font-bold text-gold-600">{i + 1}.</span> {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* قرار لجنة الحوكمة (للحوكمة والتنفيذي فقط) */}
          {viewMode !== 'candidate' && card3.governanceDecision && (
            <div className="bg-white border border-sage/30 rounded-xl p-4">
              <div className="text-xs font-bold text-sage mb-1">قرار لجنة الحوكمة</div>
              <p className="text-xs text-darkgray">{card3.governanceDecision}</p>
              {card3.governanceNote && (
                <p className="text-xs text-steelblue mt-1 border-t border-blue-50 pt-1">{card3.governanceNote}</p>
              )}
            </div>
          )}

          {/* التوضيح المنهجي */}
          <div className="mt-4 pt-4 border-t border-primary-100">
            <p className="text-xs text-darkgray/70 leading-relaxed text-center italic">
              لا تُبنى هذه التوصية على الانطباع أو الترشيح الفردي — بل على قراءة مركبة تجمع بين
              <strong className="text-primary-600"> الجاهزية القيادية </strong> و
              <strong className="text-gold-600"> الأثر المؤسسي القابل للقياس</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── دالة مساعدة: حساب بيانات البطاقة الثانية من البيانات الخام ──

export function computeBalancedCard(
  initiatives: Array<{ ai_score?: number | null; achieved_impact?: string | null; is_sustainable?: boolean | null }>,
  kpis: Array<{ ai_score?: number | null; target_value?: string | null; actual_value?: string | null; is_officially_approved?: boolean | null; used_in_decision?: string | null }>,
  assessments: Array<{ score?: number | null }>,
  eval360TeamScore: number | null,
): BalancedPerformanceCard {
  // 1. الأثر المؤسسي — من المبادرات
  const initiativeScores = initiatives.map(i => Number(i.ai_score || 50));
  const institutionalImpactScore = initiativeScores.length > 0
    ? Math.min(100, Math.round(initiativeScores.reduce((a, b) => a + b, 0) / initiativeScores.length + (initiatives.filter(i => i.is_sustainable).length * 3)))
    : 0;

  // 2. جودة الإنجاز — من المؤشرات (نسبة تحقيق الهدف)
  const achievementRates = kpis
    .filter(k => k.target_value && k.actual_value)
    .map(k => {
      const target = parseFloat(k.target_value || '0');
      const actual = parseFloat(k.actual_value || '0');
      return target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
    });
  const achievementQualityScore = achievementRates.length > 0
    ? Math.round(achievementRates.reduce((a, b) => a + b, 0) / achievementRates.length)
    : 0;

  // 3. المبادرات — كمية ونوعية
  const initiativesScore = Math.min(100, initiatives.length >= 4 ? 85 + (initiatives.length - 4) * 3 : initiatives.length * 20);

  // 4. التعلم والتطوير — من الاختبارات
  const assessmentScores = assessments.map(a => Number(a.score || 0));
  const learningScore = assessmentScores.length > 0
    ? Math.round(assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length)
    : 0;

  // 5. العلاقات والعمل الجماعي — من 360 محور الفريق
  const teamworkScore = eval360TeamScore ?? (learningScore > 0 ? Math.round(learningScore * 0.9) : 0);

  // 6. الكفاءة التشغيلية — مؤشرات معتمدة رسمياً
  const approvedKpis = kpis.filter(k => k.is_officially_approved);
  const operationalScore = kpis.length > 0
    ? Math.round((approvedKpis.length / kpis.length) * 100 * 0.4 + (achievementQualityScore * 0.6))
    : 0;

  // 7. المساهمة في تحقيق الأهداف
  const usedInDecision = kpis.filter(k => k.used_in_decision && k.used_in_decision.length > 0);
  const goalsContributionScore = kpis.length > 0
    ? Math.round(Math.min(100, (usedInDecision.length / kpis.length) * 100 * 0.5 + achievementQualityScore * 0.5))
    : 0;

  // الكلي المرجّح
  const scores = [institutionalImpactScore, achievementQualityScore, initiativesScore, learningScore, teamworkScore, operationalScore, goalsContributionScore];
  const weights = [20, 18, 16, 12, 14, 10, 10];
  const overallPerformanceScore = Math.round(
    scores.reduce((sum, s, i) => sum + s * (weights[i] / 100), 0)
  );

  return {
    institutionalImpactScore,
    achievementQualityScore,
    initiativesScore,
    learningScore,
    teamworkScore,
    operationalScore,
    goalsContributionScore,
    overallPerformanceScore,
    initiativesCount: initiatives.length,
    kpisCount: kpis.length,
    approvedKpisCount: approvedKpis.length,
    assessmentAvg: assessmentScores.length > 0 ? Math.round(assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length) : 0,
  };
}

// ─── دالة مساعدة: إنشاء بطاقة التوصية النهائية ──────────────────

export function computeRecommendationCard(
  readinessScore: number,
  performanceScore: number,
  governanceDecision?: string,
  governanceNote?: string,
): FinalRecommendationCard {
  let recommendationType: FinalRecommendationCard['recommendationType'];
  let recommendationLabel: string;
  let recommendationDesc: string;
  let developmentPath: string[];

  const r = readinessScore;
  const p = performanceScore;

  if (r >= 80 && p >= 75) {
    recommendationType = 'immediate_empowerment';
    recommendationLabel = 'مرشح للتمكين القيادي الفوري';
    recommendationDesc = `يجمع هذا المرشح بين جاهزية قيادية عالية (${r}٪) وأثر مؤسسي موثق (${p}٪). يُوصى بتمكينه قيادياً في أقرب فرصة متاحة وفق احتياجات المنظمة وملاءمته التنظيمية.`;
    developmentPath = ['تكليف قيادي فوري', 'إرشاد من قائد أعلى', 'متابعة الأثر بعد 3 أشهر'];
  } else if (r >= 75 && p >= 55) {
    recommendationType = 'empowerment_with_development';
    recommendationLabel = 'تمكين مع خطة تطوير';
    recommendationDesc = `يمتلك المرشح جاهزية قيادية جيدة (${r}٪) لكن أثره المؤسسي يحتاج تعزيزاً (${p}٪). يُوصى بتمكينه مع خطة تطوير مصاحبة لتحسين الأثر التشغيلي.`;
    developmentPath = ['تكليف قيادي تدريجي', 'برنامج تطوير الأداء', 'قياس الأثر دورياً'];
  } else if (r >= 60 && p >= 70) {
    recommendationType = 'leadership_program';
    recommendationLabel = 'برنامج إعداد قيادي';
    recommendationDesc = `يملك المرشح أثراً مؤسسياً ملموساً (${p}٪) لكن جاهزيته القيادية تحتاج تطويراً (${r}٪). يُوصى بإلحاقه ببرنامج إعداد قيادي مكثف مع الاستفادة من رصيده الأدائي.`;
    developmentPath = ['برنامج قيادة متخصص', 'تكليف تطبيقي محدود', 'إعادة تقييم بعد 6 أشهر'];
  } else if (r >= 50 || p >= 50) {
    recommendationType = 'guided_development';
    recommendationLabel = 'مسار تطوير موجّه';
    recommendationDesc = `المرشح في مرحلة بناء تتطلب استثماراً موجهاً. جاهزيته القيادية (${r}٪) وأثره المؤسسي (${p}٪) يشيران إلى إمكانات واعدة تحتاج مساراً تطوير منظماً.`;
    developmentPath = ['خطة تطوير فردية شاملة', 'إرشاد مهني مستمر', 'مشاريع تطبيقية متدرجة', 'إعادة تقييم بعد سنة'];
  } else {
    recommendationType = 'foundation_program';
    recommendationLabel = 'برنامج تأسيس وتأهيل';
    recommendationDesc = `يحتاج المرشح إلى برنامج تأسيسي شامل قبل الدخول في مسار الإعداد القيادي. يُوصى بالبدء ببناء الأساس المهني وتعزيز المبادرات الموثقة.`;
    developmentPath = ['برنامج تأسيس مهني', 'بناء رصيد مبادرات', 'تعزيز المؤشرات الرسمية', 'إعادة التقييم بعد سنة'];
  }

  return {
    readinessScore,
    performanceScore,
    recommendationType,
    recommendationLabel,
    recommendationColor: '',
    recommendationDesc,
    developmentPath,
    governanceDecision,
    governanceNote,
  };
}
