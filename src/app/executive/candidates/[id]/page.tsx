import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Award, User, Briefcase, Activity, Users, Brain, Shield, Target, ScrollText } from 'lucide-react';
import { createServiceClient } from "@/lib/supabase/server";;
import { getCurrentUser } from '@/lib/auth/current-user';
import { Card, Badge } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز', innovation: 'الابتكار والمبادرات',
  team: 'رضا الفريق وأصحاب العلاقة', technology: 'استخدام التقنية',
  integrity: 'النزاهة والالتزام',
};
const AXIS_WEIGHTS: Record<string, number> = {
  leadership: 20, strategic: 15, performance: 15,
  innovation: 15, team: 15, technology: 10, integrity: 10,
};
const LEADERSHIP_TYPE_LABELS: Record<string, string> = {
  strategic: 'قائد استراتيجي', operational: 'قائد تشغيلي', technical: 'قائد تقني',
  human_leader: 'قائد إنساني', hidden: 'قيادة مخفية محتملة', emerging: 'قائد صاعد',
};

const TABS = [
  { id: 'summary', label: 'الملخص التنفيذي', icon: User },
  { id: 'readiness', label: 'درجة الجاهزية', icon: Award },
  { id: 'initiatives', label: 'المبادرات', icon: Briefcase },
  { id: 'kpis', label: 'المؤشرات', icon: Activity },
  { id: 'evaluation360', label: 'تقييم 360', icon: Users },
  { id: 'ai_analysis', label: 'التحليل الذكي', icon: Brain },
  { id: 'fit', label: 'الملاءمة التنظيمية', icon: Shield },
  { id: 'governance', label: 'قرار اللجنة', icon: ScrollText },
  { id: 'development', label: 'خطة التطوير', icon: Target },
];

export default async function ExecutiveCandidateCardPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createServiceClient();
  const activeTab = searchParams.tab || 'summary';

  const [
    { data: card },
    { data: initiatives },
    { data: kpis },
    { data: evalLinks },
    { data: evaluations },
    { data: decisions },
    { data: devPlan },
    { data: fitScores },
  ] = await Promise.all([
    supabase.from('leadership_cards').select('*, candidate_profiles(id, completion_score, years_of_experience, users(full_name, job_title, department, employee_number, email))').eq('id', params.id).maybeSingle(),
    supabase.from('initiatives').select('name, initiative_type, achieved_impact, ai_score').eq('candidate_profile_id', '').limit(1), // placeholder
    supabase.from('kpis').select('name, kpi_type, target_value, actual_value, ai_score').eq('candidate_profile_id', '').limit(1),
    supabase.from('evaluation_links').select('status').eq('candidate_profile_id', '').limit(1),
    supabase.from('evaluations_360').select('overall_score, trust_score, scores_json').eq('candidate_profile_id', '').limit(1),
    supabase.from('governance_decisions').select('decision_type, reason, decided_at').eq('candidate_profile_id', '').order('decided_at', { ascending: false }).limit(3),
    supabase.from('development_plans').select('readiness_level, overall_status, ai_recommendations_json').eq('candidate_profile_id', '').maybeSingle(),
    supabase.from('position_fit_scores').select('*, organization_units(name, unit_type)').eq('candidate_profile_id', '').order('fit_score', { ascending: false }).limit(5),
  ]);

  if (!card) notFound();

  // أعد الاستعلامات بالـ profile id
  const profileId = (card as any).candidate_profiles?.id || '';
  const [
    { data: inisReal }, { data: kpisReal }, { data: evalsReal },
    { data: decisionsReal }, { data: devPlanReal }, { data: fitReal }, { data: evalLinksReal },
  ] = await Promise.all([
    supabase.from('initiatives').select('name, initiative_type, achieved_impact, impact_metrics, ai_score, evidence').eq('candidate_profile_id', profileId).order('created_at').limit(5),
    supabase.from('kpis').select('name, kpi_type, target_value, actual_value, ai_score').eq('candidate_profile_id', profileId).limit(5),
    supabase.from('evaluations_360').select('overall_score, trust_score, scores_json').eq('candidate_profile_id', profileId),
    supabase.from('governance_decisions').select('decision_type, reason, decided_at').eq('candidate_profile_id', profileId).order('decided_at', { ascending: false }).limit(3),
    supabase.from('development_plans').select('readiness_level, overall_status, ai_recommendations_json').eq('candidate_profile_id', profileId).maybeSingle(),
    supabase.from('position_fit_scores').select('fit_score, fit_reason, ai_summary, organization_units(name, unit_type)').eq('candidate_profile_id', profileId).order('fit_score', { ascending: false }).limit(5),
    supabase.from('evaluation_links').select('status').eq('candidate_profile_id', profileId),
  ]);

  // تسجيل اطلاع الرئيس
  await supabase.from('audit_logs').insert({
    user_id: user.id, user_role: user.primaryRole,
    operation_type: 'executive_viewed_card',
    description: `اطلاع على البطاقة القيادية`,
    affected_entity_type: 'leadership_cards', affected_entity_id: params.id, sensitivity: 'sensitive',
  });

  const cardTyped = card as any;
  const candidateUser = cardTyped.candidate_profiles?.users;
  const profile = cardTyped.candidate_profiles;
  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
  const strengths = (card.strengths_json as string[] | null) || [];
  const gaps = (card.gaps_json as string[] | null) || [];
  const axisScores = (card.axis_scores_json as Record<string, number> | null) || {};
  const specialTags = (card.special_tags as string[] | null) || [];

  // إحصاء 360
  const totalLinks = evalLinksReal?.length || 0;
  const completedEvals = evalLinksReal?.filter((l: any) => l.status === 'submitted').length || 0;

  // متوسط 360
  const evalList = evalsReal || [];
  const avg360 = evalList.length > 0
    ? Math.round(evalList.reduce((s: number, e: any) => s + Number(e.overall_score || 0), 0) / evalList.length)
    : null;
  const avgTeam360 = evalList.length > 0 ? Math.round(evalList.reduce((s: number, e: any) => {
    const scores = e.scores_json as Record<string, { score: number }>;
    const teamVals = ['team_satisfaction', 'team_development', 'communication'].map(k => scores?.[k]?.score).filter(Boolean) as number[];
    return s + (teamVals.length > 0 ? teamVals.reduce((a, b) => a + b, 0) / teamVals.length : 3);
  }, 0) / evalList.length) : null;

  const tabUrl = (tab: string) => `/executive/candidates/${params.id}?tab=${tab}`;

  return (
    <div dir="rtl">
      {/* رأس */}
      <div className="mb-5">
        <Link href="/executive/candidates" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-3">
          <ArrowRight className="h-4 w-4" />قائمة المرشحين
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary-700">{candidateUser?.full_name}</h1>
            <p className="text-darkgray mt-0.5">{candidateUser?.job_title} · {candidateUser?.department}</p>
            {specialTags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {specialTags.map(t => <span key={t} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">{t}</span>)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="institutional-card px-5 py-3 text-center">
              <div className="text-3xl font-bold text-gold-700">{Number(card.total_score || 0).toFixed(0)}٪</div>
              <div className="text-xs text-darkgray mt-0.5">الدرجة</div>
            </div>
            <div className="institutional-card px-5 py-3 text-center">
              <div className="text-3xl font-bold text-steelblue">{Number(card.trust_score || 0).toFixed(0)}٪</div>
              <div className="text-xs text-darkgray mt-0.5">الثقة</div>
            </div>
            {level && <div className={`px-4 py-2 rounded-xl text-sm font-bold ${level.bg} ${level.color}`}>{level.label_ar}</div>}
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 border-b border-gold-200">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link key={tab.id} href={tabUrl(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-primary-700 text-white' : 'text-darkgray hover:text-primary-700 hover:bg-gold-50'
              }`}>
              <Icon className="h-4 w-4" />{tab.label}
            </Link>
          );
        })}
      </div>

      {/* الملخص التنفيذي */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="بيانات المرشح">
              <div className="space-y-2 text-sm">
                {[
                  { label: 'الاسم', val: candidateUser?.full_name },
                  { label: 'المسمى', val: candidateUser?.job_title },
                  { label: 'الإدارة', val: candidateUser?.department },
                  { label: 'رقم الموظف', val: candidateUser?.employee_number || '—' },
                  { label: 'سنوات الخبرة', val: profile?.years_of_experience ? `${profile.years_of_experience} سنة` : '—' },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between border-b border-gold-50 pb-1.5">
                    <span className="text-darkgray">{label}</span>
                    <span className="font-medium text-primary-700">{val || '—'}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="التصنيف والنتيجة">
              <div className="space-y-3">
                <div><div className="text-xs text-darkgray">مستوى الجاهزية</div><div className="text-lg font-bold text-primary-700">{level?.label_ar || card.readiness_level}</div></div>
                <div><div className="text-xs text-darkgray">نوع القيادة</div><div className="text-lg font-bold text-gold-700">{LEADERSHIP_TYPE_LABELS[card.leadership_type] || card.leadership_type}</div></div>
                <div><div className="text-xs text-darkgray">تاريخ الاعتماد</div><div className="text-sm text-primary-700">{card.approved_at ? new Date(card.approved_at).toLocaleDateString('ar-SA') : '—'}</div></div>
              </div>
            </Card>
          </div>
          {card.governance_summary && (
            <Card title="ملاحظة لجنة الحوكمة" className="bg-primary-50 border-primary-200">
              <p className="text-sm text-primary-800 leading-relaxed">{card.governance_summary}</p>
            </Card>
          )}
          {card.ai_summary && (
            <Card title="الملخص الذكي" className="bg-gold-50 border-gold-300">
              <p className="text-sm text-primary-800 leading-relaxed">{card.ai_summary}</p>
            </Card>
          )}
        </div>
      )}

      {/* درجة الجاهزية — المحاور */}
      {activeTab === 'readiness' && (
        <div className="space-y-4">
          <div className="institutional-card p-5 text-center mb-4">
            <div className="text-5xl font-bold text-gold-700 mb-1">{Number(card.total_score || 0).toFixed(0)}٪</div>
            <div className="text-sm text-darkgray">درجة الجاهزية الكلية المرجّحة</div>
            <div className="mt-3 flex justify-center gap-4 text-sm">
              <div className="text-center"><div className="text-xl font-bold text-steelblue">{Number(card.trust_score || 0).toFixed(0)}٪</div><div className="text-xs text-darkgray">مستوى الثقة</div></div>
            </div>
          </div>

          {Object.keys(AXIS_LABELS).length > 0 && (
            <Card title="نتائج المحاور السبعة">
              <div className="space-y-3">
                {Object.entries(AXIS_LABELS).map(([axis, label]) => {
                  const score = axisScores[axis] ?? axisScores[axis.toLowerCase()] ?? 0;
                  const weight = AXIS_WEIGHTS[axis] || 10;
                  return (
                    <div key={axis}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-darkgray">{label} <span className="text-xs text-gold-600">({weight}٪)</span></span>
                        <span className="font-bold text-primary-700">{score}٪</span>
                      </div>
                      <div className="h-2.5 bg-gold-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${score >= 80 ? 'bg-sage' : score >= 65 ? 'bg-primary-600' : score >= 50 ? 'bg-gold-500' : 'bg-wine'}`}
                          style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="نقاط القوة">
              {strengths.length > 0 ? <ul className="space-y-1">{strengths.map((s, i) => <li key={i} className="text-sm text-sage flex items-center gap-2">✓ {s}</li>)}</ul> : <div className="text-sm text-darkgray">—</div>}
            </Card>
            <Card title="فجوات التطوير">
              {gaps.length > 0 ? <ul className="space-y-1">{gaps.map((g, i) => <li key={i} className="text-sm text-wine flex items-center gap-2">! {g}</li>)}</ul> : <div className="text-sm text-darkgray">—</div>}
            </Card>
          </div>
        </div>
      )}

      {/* المبادرات */}
      {activeTab === 'initiatives' && (
        <div className="space-y-3">
          {(!inisReal || inisReal.length === 0) ? (
            <div className="text-center py-8 text-darkgray text-sm">لا توجد مبادرات مسجلة.</div>
          ) : inisReal.map((ini: any) => (
            <Card key={ini.name}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-primary-700">{ini.name}</div>
                  {ini.initiative_type && <div className="text-xs text-darkgray mt-0.5">{ini.initiative_type}</div>}
                  {ini.achieved_impact && <p className="text-sm text-primary-800 mt-2 leading-relaxed">{ini.achieved_impact}</p>}
                  {ini.impact_metrics && <div className="text-xs text-gold-700 mt-1">📊 {ini.impact_metrics}</div>}
                </div>
                {ini.ai_score !== null && ini.ai_score !== undefined && (
                  <div className={`text-lg font-bold px-3 py-1 rounded-xl flex-shrink-0 ${ini.ai_score >= 75 ? 'bg-sage/10 text-sage' : 'bg-gold-50 text-gold-700'}`}>
                    {Math.round(ini.ai_score)}٪
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* المؤشرات */}
      {activeTab === 'kpis' && (
        <div className="space-y-3">
          {(!kpisReal || kpisReal.length === 0) ? (
            <div className="text-center py-8 text-darkgray text-sm">لا توجد مؤشرات مسجلة.</div>
          ) : kpisReal.map((kpi: any) => (
            <Card key={kpi.name}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-bold text-primary-700">{kpi.name}</div>
                  {kpi.kpi_type && <div className="text-xs text-darkgray mt-0.5">{kpi.kpi_type}</div>}
                  <div className="flex gap-4 mt-2 text-sm">
                    {kpi.target_value && <div><span className="text-xs text-darkgray">الهدف: </span><span className="font-medium">{kpi.target_value}</span></div>}
                    {kpi.actual_value && <div><span className="text-xs text-darkgray">المحقق: </span><span className="font-bold text-sage">{kpi.actual_value}</span></div>}
                  </div>
                </div>
                {kpi.ai_score !== null && kpi.ai_score !== undefined && (
                  <div className={`text-lg font-bold px-3 py-1 rounded-xl flex-shrink-0 ${kpi.ai_score >= 75 ? 'bg-sage/10 text-sage' : 'bg-gold-50 text-gold-700'}`}>
                    {Math.round(kpi.ai_score)}٪
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* تقييم 360 */}
      {activeTab === 'evaluation360' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'المقيمون', val: totalLinks },
              { label: 'تقييمات مكتملة', val: completedEvals },
              { label: 'اكتمال', val: `${totalLinks > 0 ? Math.round((completedEvals / totalLinks) * 100) : 0}٪` },
            ].map(({ label, val }) => (
              <div key={label} className="institutional-card p-4 text-center">
                <div className="text-2xl font-bold text-primary-700">{val}</div>
                <div className="text-xs text-darkgray mt-1">{label}</div>
              </div>
            ))}
          </div>
          {avg360 !== null && (
            <div className="grid grid-cols-2 gap-4">
              <div className="institutional-card p-5 text-center">
                <div className="text-3xl font-bold text-primary-700">{avg360}٪</div>
                <div className="text-sm text-darkgray mt-1">متوسط تقييم 360</div>
              </div>
              {avgTeam360 !== null && (
                <div className="institutional-card p-5 text-center">
                  <div className={`text-3xl font-bold ${avgTeam360 >= 70 ? 'text-sage' : avgTeam360 >= 55 ? 'text-gold-700' : 'text-wine'}`}>
                    {Math.round((avgTeam360 - 1) / 4 * 100)}٪
                  </div>
                  <div className="text-sm text-darkgray mt-1">رضا الفريق</div>
                </div>
              )}
            </div>
          )}
          {evalList.length === 0 && <div className="text-center py-6 text-darkgray text-sm">لم تكتمل تقييمات 360 بعد.</div>}
        </div>
      )}

      {/* التحليل الذكي */}
      {activeTab === 'ai_analysis' && (
        <div className="space-y-4">
          {card.ai_summary ? (
            <Card title="الملخص الذكي" className="bg-primary-50 border-primary-200">
              <p className="text-base text-primary-800 leading-relaxed">{card.ai_summary}</p>
            </Card>
          ) : <div className="text-center py-8 text-darkgray">لا يوجد تحليل ذكي بعد.</div>}
          {strengths.length > 0 && (
            <Card title="أقوى مؤشر داعم">
              <div className="text-sm text-sage">{strengths[0]}</div>
            </Card>
          )}
          {gaps.length > 0 && (
            <Card title="أكبر مخاطرة">
              <div className="text-sm text-wine">{gaps[0]}</div>
            </Card>
          )}
        </div>
      )}

      {/* الملاءمة التنظيمية */}
      {activeTab === 'fit' && (
        <div className="space-y-3">
          {(!fitReal || fitReal.length === 0) ? (
            <div className="text-center py-8 text-darkgray text-sm">لا توجد بيانات ملاءمة محسوبة بعد.</div>
          ) : fitReal.map((fit: any, i: number) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-bold text-primary-700">{fit.organization_units?.name}</div>
                  <div className="text-xs text-darkgray mb-2">{fit.organization_units?.unit_type}</div>
                  {fit.fit_reason && <p className="text-sm text-primary-800 leading-relaxed">{fit.fit_reason}</p>}
                  {fit.ai_summary && <p className="text-xs text-darkgray mt-1">{fit.ai_summary}</p>}
                </div>
                <div className={`text-2xl font-bold flex-shrink-0 px-4 py-2 rounded-xl ${Number(fit.fit_score) >= 80 ? 'bg-sage/10 text-sage' : Number(fit.fit_score) >= 60 ? 'bg-gold-50 text-gold-700' : 'bg-rose-50 text-wine'}`}>
                  {Number(fit.fit_score).toFixed(0)}٪
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* قرار لجنة الحوكمة */}
      {activeTab === 'governance' && (
        <div className="space-y-4">
          {card.governance_summary && (
            <Card title="ملخص قرار اللجنة" className="bg-primary-50 border-primary-200">
              <p className="text-sm text-primary-800 leading-relaxed">{card.governance_summary}</p>
              {card.approved_at && <div className="text-xs text-darkgray mt-2">تاريخ الاعتماد: {new Date(card.approved_at).toLocaleDateString('ar-SA')}</div>}
            </Card>
          )}
          {decisionsReal && decisionsReal.length > 0 && (
            <Card title="سجل مختصر لقرارات اللجنة">
              {decisionsReal.map((d: any, i: number) => (
                <div key={i} className="p-3 border-b border-gold-100 text-sm last:border-0">
                  <div className="font-medium text-primary-700">{d.decision_type}</div>
                  <div className="text-xs text-darkgray mt-0.5">{d.reason?.substring(0, 100)}</div>
                  <div className="text-xs text-darkgray">{new Date(d.decided_at).toLocaleDateString('ar-SA')}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* خطة التطوير */}
      {activeTab === 'development' && (
        <div>
          {!devPlanReal ? (
            <div className="text-center py-8 text-darkgray text-sm">لا توجد خطة تطوير بعد.</div>
          ) : (
            <Card title="خطة التطوير">
              <div className="text-sm text-primary-700 font-medium mb-2">مستوى الجاهزية: {devPlanReal.readiness_level}</div>
              <div className="text-sm text-darkgray mb-3">الحالة: {devPlanReal.overall_status}</div>
              {devPlanReal.ai_recommendations_json && (
                <div className="p-3 bg-gold-50 rounded-xl text-sm text-primary-800">
                  {typeof devPlanReal.ai_recommendations_json === 'object' && (devPlanReal.ai_recommendations_json as any).recommendation}
                </div>
              )}
              {gaps.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-darkgray mb-1">مجالات التطوير المقترحة:</div>
                  <ul className="space-y-1">{gaps.map((g, i) => <li key={i} className="text-sm text-primary-700 flex items-center gap-2">• {g}</li>)}</ul>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
