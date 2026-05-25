import { Award, AlertCircle, BookOpen } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card } from '@/components/ui';
import { READINESS_LEVELS, leadershipTypeLabel } from '@/lib/utils';
import {
  ThreeCardsPanel,
  computeBalancedCard,
  computeRecommendationCard,
  type LeadershipReadinessCard,
} from '@/components/cards/ThreeCardsPanel';

export const dynamic = 'force-dynamic';

export default async function CandidateResultPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const svc = createServiceClient();

  const { data: profile } = await svc
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const profileId = profile?.id;

  const [
    { data: card },
    { data: initiatives },
    { data: kpis },
    { data: assessments },
    { data: evals },
    { data: decisions },
  ] = await Promise.all([
    svc.from('leadership_cards').select('*').eq('candidate_profile_id', profileId || '').maybeSingle(),
    svc.from('initiatives').select('ai_score, achieved_impact, is_sustainable').eq('candidate_profile_id', profileId || ''),
    svc.from('kpis').select('ai_score, target_value, actual_value, is_officially_approved, used_in_decision').eq('candidate_profile_id', profileId || ''),
    svc.from('assessment_results').select('score').eq('candidate_profile_id', profileId || ''),
    svc.from('evaluations_360').select('overall_score, scores_json').eq('candidate_profile_id', profileId || ''),
    svc.from('governance_decisions').select('decision_type, reason, committee_note').eq('candidate_profile_id', profileId || '').order('decided_at', { ascending: false }).limit(1),
  ]);

  // ─── حالة: لا توجد بطاقة بعد ──────────────────────────────────
  if (!card || !card.is_published) {
    return (
      <div>
        <PageHeader
          title="نتيجة التقييم والبطاقات الثلاث"
          description="ستظهر بطاقاتك هنا بعد اعتماد لجنة الحوكمة."
          icon={<Award className="h-5 w-5" />}
        />
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gold-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-700 mb-2">بطاقاتك ليست جاهزة بعد</h3>
            <p className="text-darkgray text-sm leading-loose max-w-md mx-auto">
              بعد إكمال جميع مراحل المسار وتقييم 360 درجة، تراجع لجنة الحوكمة ملفك
              وتُصدر ثلاث بطاقات مترابطة:
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 text-sm">
              {[
                { n: '1', label: 'بطاقة الجاهزية القيادية', color: 'border-primary-300 text-primary-700' },
                { n: '2', label: 'بطاقة الأداء المتوازن', color: 'border-gold-300 text-gold-700' },
                { n: '3', label: 'بطاقة التوصية النهائية', color: 'border-sage/40 text-sage' },
              ].map(({ n, label, color }) => (
                <div key={n} className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl ${color}`}>
                  <span className="font-bold">{n}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── بناء البطاقات الثلاث ──────────────────────────────────────

  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
  const axisScores = (card.axis_scores_json as Record<string, number> | null) || {};
  const strengths = (card.strengths_json as string[] | null) || [];
  const gaps = (card.gaps_json as string[] | null) || [];
  const totalScore = Number(card.total_score || card.readiness_score || 0);
  const trustScore = Number(card.trust_score || card.confidence_score || 0);

  // 360: متوسط الكلي + محور الفريق
  const eval360Scores = (evals || []).map(e => Number(e.overall_score || 0));
  const eval360Score = eval360Scores.length > 0
    ? Math.round(eval360Scores.reduce((a, b) => a + b, 0) / eval360Scores.length)
    : null;

  const teamScores = (evals || []).map(e => {
    const s = (e.scores_json as Record<string, { score: number }> | null) || {};
    return s['team']?.score ?? null;
  }).filter((v): v is number => v !== null);
  const eval360TeamScore = teamScores.length > 0
    ? Math.round(teamScores.reduce((a, b) => a + b, 0) / teamScores.length)
    : null;

  // البطاقة الأولى
  const card1: LeadershipReadinessCard = {
    totalScore: Math.round(totalScore),
    trustScore: Math.round(trustScore),
    readinessLevel: card.readiness_level || '',
    readinessLabel: level?.label_ar || card.readiness_level || '',
    leadershipType: card.leadership_type || '',
    leadershipTypeLabel: leadershipTypeLabel(card.leadership_type || ''),
    axisScores,
    strengths,
    gaps,
    eval360Score,
    eval360Count: (evals || []).length,
    aiSummary: card.ai_summary || undefined,
  };

  // البطاقة الثانية
  const card2 = computeBalancedCard(
    initiatives || [],
    kpis || [],
    assessments || [],
    eval360TeamScore,
  );

  // البطاقة الثالثة
  const latestDecision = decisions?.[0];
  const decisionLabels: Record<string, string> = {
    approved: 'اعتمدت اللجنة الترشيح',
    conditional_approval: 'اعتماد مشروط',
    returned_for_completion: 'طلبت اللجنة الاستكمال',
    deferred: 'تأجيل القرار',
    rejected: 'رفضت اللجنة الترشيح',
  };
  const card3 = computeRecommendationCard(
    Math.round(totalScore),
    card2.overallPerformanceScore,
    latestDecision ? (decisionLabels[latestDecision.decision_type] || latestDecision.decision_type) : undefined,
    latestDecision?.committee_note || undefined,
  );

  return (
    <div>
      <PageHeader
        title="نتيجة التقييم — البطاقات الثلاث"
        description="نتيجتك المعتمدة من لجنة الحوكمة مبنية على قراءة مركبة: الجاهزية القيادية والأثر المؤسسي معاً."
        icon={<Award className="h-5 w-5" />}
      />

      {/* شرح المنهجية */}
      <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-2xl flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-primary-800 leading-relaxed">
          تعتمد منصة جدير في قراءة الكفاءات على <strong>بطاقة الجاهزية القيادية</strong> التي تُقيس السلوك
          والتأثير وتقييم 360 درجة، وتُدعم بـ<strong>بطاقة الأداء المتوازن</strong> التي تربط كفاءتك بأثرك
          الفعلي في العمل ومساهمتك في تحقيق أهداف المنظمة. المحصلة:{' '}
          <strong>بطاقة توصية نهائية</strong> لا تُبنى على الانطباع بل على قراءة مزدوجة قابلة للقياس.
        </p>
      </div>

      <ThreeCardsPanel
        card1={card1}
        card2={card2}
        card3={card3}
        candidateName={user.full_name}
        candidateTitle={user.job_title || undefined}
        viewMode="candidate"
      />
    </div>
  );
}
