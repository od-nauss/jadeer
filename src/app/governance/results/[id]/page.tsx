import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Award, Star, Target, CheckCircle2, TrendingUp, Brain } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { READINESS_LEVELS, leadershipTypeLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز', innovation: 'الابتكار والمبادرات',
  team: 'رضا الفريق', technology: 'استخدام التقنية', integrity: 'النزاهة',
};

export default async function GovernanceResultDetailPage({ params }: { params: { id: string } }) {
  const svc = createServiceClient();

  // id can be either card id or profile id
  const [cardByCard, cardByProfile] = await Promise.all([
    svc.from('leadership_cards')
      .select('*, candidate_profiles!inner(id, status, users!inner(full_name, job_title, department))')
      .eq('id', params.id)
      .maybeSingle(),
    svc.from('leadership_cards')
      .select('*, candidate_profiles!inner(id, status, users!inner(full_name, job_title, department))')
      .eq('candidate_profile_id', params.id)
      .maybeSingle(),
  ]);

  const card = cardByCard.data || cardByProfile.data;
  if (!card) notFound();

  type CardTyped = { candidate_profiles: { id: string; status: string; users: { full_name: string; job_title?: string; department?: string } } };
  const cTyped = card as unknown as CardTyped;
  const user = cTyped.candidate_profiles?.users;
  const profileId = cTyped.candidate_profiles?.id;
  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];

  const strengths: string[]               = (card.strengths_json   as string[] | null) || [];
  const gaps: string[]                    = (card.gaps_json        as string[] | null) || [];
  const axisScores: Record<string, number>= (card.axis_scores_json as Record<string, number> | null) || {};
  const totalScore = Number(card.total_score || card.readiness_score || 0);
  const trustScore = Number(card.trust_score || card.confidence_score || 0);

  // Fetch evaluations and decision
  const [{ data: evals }, { data: decision }, { data: fitScores }] = await Promise.all([
    svc.from('evaluations_360').select('overall_score, trust_score').eq('candidate_profile_id', profileId).limit(20),
    svc.from('governance_decisions').select('*').eq('candidate_profile_id', profileId).order('decided_at', {ascending:false}).maybeSingle(),
    svc.from('position_fit_scores').select('fit_score, fit_level, organization_units(name)').eq('candidate_profile_id', profileId).order('fit_score',{ascending:false}).limit(4),
  ]);

  const avg360 = evals && evals.length > 0
    ? Math.round(evals.reduce((s, e) => s + Number(e.overall_score || 0), 0) / evals.length)
    : null;

  const axisOrder = ['leadership','strategic','performance','innovation','team','technology','integrity'];
  const orderedAxes = axisOrder
    .filter(k => axisScores[k] !== undefined)
    .map(k => ({ key: k, label: AXIS_LABELS[k] || k, score: Number(axisScores[k]) }));

  return (
    <div dir="rtl">
      <Link href="/governance/results" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowRight className="h-4 w-4" />العودة للنتائج
      </Link>

      {/* رأس */}
      <div className="bg-gradient-to-l from-primary-700 to-primary-900 text-white rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gold-500 flex items-center justify-center text-primary-900 font-bold text-xl">
              {user?.full_name?.charAt(0) || '؟'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.full_name}</h1>
              <p className="text-gold-200">{user?.job_title} {user?.department && `· ${user.department}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">{totalScore.toFixed(0)}</div>
              <div className="text-xs text-gold-200">درجة الجاهزية</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-300">{trustScore.toFixed(0)}%</div>
              <div className="text-xs text-gold-200">مستوى الثقة</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gold-500/30">
          {level && <span className={`px-3 py-1 rounded-lg text-sm font-bold ${level.bg} ${level.color}`}>{level.label_ar}</span>}
          <span className="px-3 py-1 rounded-lg bg-gold-500/20 border border-gold-400/40 text-gold-100 text-sm">{leadershipTypeLabel(card.leadership_type)}</span>
          <Badge variant={card.is_published ? 'sage' : 'gold'}>{card.is_published ? 'معتمدة للقيادة' : 'قيد المراجعة'}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* AI Summary */}
          {(card as any).ai_summary && (
            <Card title="ملخص الذكاء الاصطناعي">
              <div className="flex items-start gap-3 p-4 bg-primary-50 border-r-4 border-primary-500 rounded-xl">
                <Brain className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-darkgray leading-loose">{(card as any).ai_summary}</p>
              </div>
            </Card>
          )}

          {/* المحاور */}
          <Card title="درجات المحاور السبعة">
            {orderedAxes.length > 0 ? (
              <div className="space-y-3">
                {orderedAxes.map(({ key, label, score }) => {
                  const color = score >= 85 ? 'bg-sage' : score >= 70 ? 'bg-primary-600' : score >= 55 ? 'bg-gold-500' : 'bg-rose-400';
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="font-medium text-primary-700">{label}</span>
                        <span className={`font-bold ${score >= 85 ? 'text-sage' : score >= 70 ? 'text-primary-700' : 'text-gold-700'}`}>{score.toFixed(0)}/100</span>
                      </div>
                      <div className="h-4 bg-gold-100 rounded-full overflow-hidden relative">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                        {score >= 60 && <span className="absolute inset-y-0 right-2 flex items-center text-[10px] text-white font-bold">{score.toFixed(0)}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-darkgray">لم يتم تحديد الدرجات بعد.</p>}
          </Card>

          {/* نقاط القوة والفجوات */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="نقاط القوة">
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />
                      <span className="text-darkgray">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-darkgray">—</p>}
            </Card>
            <Card title="مجالات التطوير">
              {gaps.length > 0 ? (
                <ul className="space-y-2">
                  {gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-darkgray">{g}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-darkgray">—</p>}
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          {/* تقييم 360 */}
          <Card title="تقييم 360°">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-darkgray">عدد المقيّمين</span><span className="font-bold text-primary-700">{evals?.length || 0}</span></div>
              {avg360 && <div className="flex justify-between"><span className="text-darkgray">المتوسط</span><span className="font-bold text-primary-700">{avg360}%</span></div>}
            </div>
          </Card>

          {/* الملاءمة */}
          {fitScores && fitScores.length > 0 && (
            <Card title="الملاءمة التنظيمية">
              <div className="space-y-2">
                {fitScores.map((fs: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-darkgray">{fs.organization_units?.name}</span>
                      <span className="font-bold text-primary-700">{Number(fs.fit_score).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gold-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${Number(fs.fit_score) >= 80 ? 'bg-sage' : 'bg-primary-600'}`} style={{ width: `${fs.fit_score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* قرار اللجنة */}
          <Card title="قرار اللجنة">
            {decision ? (
              <div className="space-y-3 text-sm">
                <div>
                  <Badge variant={decision.decision_type === 'approved' ? 'sage' : decision.decision_type === 'returned' ? 'wine' : 'gold'}>
                    {decision.decision_type === 'approved' ? '✓ معتمد' : decision.decision_type === 'returned' ? '↩ معاد' : decision.decision_type}
                  </Badge>
                </div>
                <p className="text-darkgray leading-relaxed">{decision.reason}</p>
                {decision.decided_at && (
                  <div className="text-xs text-darkgray">{new Date(decision.decided_at).toLocaleDateString('ar-SA')}</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-darkgray">لا يوجد قرار مسجل بعد.</div>
            )}
          </Card>

          {/* مصادر التحقق */}
          <Card title="مصادر التحقق المكتملة">
            <ul className="space-y-2 text-sm">
              {['الملف القيادي', 'المبادرات والإنجازات', 'مؤشرات الأداء', 'الاختبارات الذكية', 'تقييم 360°', 'اعتماد لجنة الحوكمة'].map(src => (
                <li key={src} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0" />
                  <span className="text-darkgray">{src}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
