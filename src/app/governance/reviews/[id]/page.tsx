import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, User, Briefcase, Activity, ClipboardCheck, Users, Brain, AlertTriangle, Award, ScrollText, Shield } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { Card, Badge } from '@/components/ui';
import { computeGovernanceScore } from '@/lib/ai/analyzerGovernance';
import { analyze360Results } from '@/lib/ai/analyzer360';
import { GovernanceDecisionPanel } from '@/components/governance/GovernanceDecisionPanel';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد', in_progress: 'قيد الاستكمال', awaiting_evaluators: 'بانتظار اعتماد المقيمين',
  awaiting_360: 'بانتظار تقييم 360', under_governance_review: 'قيد مراجعة اللجنة',
  approved: 'معتمد', returned_for_completion: 'معاد للاستكمال',
};

const TABS = [
  { id: 'summary', label: 'ملخص الملف', icon: User },
  { id: 'profile', label: 'الملف القيادي', icon: User },
  { id: 'initiatives', label: 'المبادرات', icon: Briefcase },
  { id: 'kpis', label: 'المؤشرات', icon: Activity },
  { id: 'assessments', label: 'الاختبارات', icon: ClipboardCheck },
  { id: 'evaluation360', label: 'تقييم 360', icon: Users },
  { id: 'ai_analysis', label: 'التحليل الذكي', icon: Brain },
  { id: 'risks', label: 'المخاطر', icon: AlertTriangle },
  { id: 'decision', label: 'قرار اللجنة', icon: Shield },
];

export default async function GovernanceReviewDetailPage({
  params, searchParams
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createServiceClient();
  const activeTab = searchParams.tab || 'summary';

  const [{ data: profile }, { data: initiatives }, { data: kpis }, { data: assessments }, { data: evalLinks }, { data: evaluations }, { data: decisions }] = await Promise.all([
    supabase.from('candidate_profiles').select('*, users(full_name, job_title, department, employee_number, email, years_of_experience)').eq('id', params.id).maybeSingle(),
    supabase.from('initiatives').select('*').eq('candidate_profile_id', params.id).order('created_at'),
    supabase.from('kpis').select('*').eq('candidate_profile_id', params.id).order('created_at'),
    supabase.from('assessment_results').select('*, assessments(title, code)').eq('candidate_profile_id', params.id),
    supabase.from('evaluation_links').select('*, approved_evaluators(full_name, relationship_type, committee_selected)').eq('candidate_profile_id', params.id),
    supabase.from('evaluations_360').select('*').eq('candidate_profile_id', params.id),
    supabase.from('governance_decisions').select('*').eq('candidate_profile_id', params.id).order('decided_at', { ascending: false }),
  ]);

  if (!profile) notFound();
  const profileTyped = profile as any;
  const candidateUser = profileTyped.users;

  // حساب تحليل 360
  const evalInputs = evaluations?.map(ev => ({
    evaluator_id: ev.approved_evaluator_id,
    relationship_type: evalLinks?.find(l => l.approved_evaluator_id === ev.approved_evaluator_id)?.approved_evaluators?.relationship_type || 'other',
    scores_json: (ev.scores_json || {}) as Record<string, { score: number; comment?: string }>,
    comments_summary: ev.comments_summary || '',
    initiative_verifications_json: ev.initiative_verifications_json as Record<string, unknown> || {},
    kpi_verifications_json: ev.kpi_verifications_json as Record<string, unknown> || {},
  })) || [];

  const analysis360 = evalInputs.length >= 1 ? analyze360Results(evalInputs) : null;

  // حساب التصنيف الكلي
  const scoreInput = {
    profile: {
      completion_score: profile.completion_score || 0,
      years_of_experience: profile.years_of_experience,
      internal_experience: profile.internal_experience,
      led_projects: profile.led_projects,
      committee_participations: profile.committee_participations,
    },
    initiatives: (initiatives || []).map(i => ({
      ai_score: (i as any).ai_score || 0,
      achieved_impact: i.achieved_impact,
      impact_metrics: i.impact_metrics,
      evidence: i.evidence,
      is_sustainable: i.is_sustainable,
    })),
    kpis: (kpis || []).map(k => ({
      ai_score: (k as any).ai_score || 0,
      target_value: k.target_value,
      actual_value: k.actual_value,
      used_in_decision: k.used_in_decision,
      is_officially_approved: k.is_officially_approved,
    })),
    assessmentResults: (assessments || []).map(a => ({
      assessment_code: (a as any).assessments?.code || '',
      score: (a as any).score || 0,
      thinking_pattern: a.thinking_pattern || '',
    })),
    evaluation360: analysis360 ? {
      overall_score: analysis360.overall_score,
      team_satisfaction_score: analysis360.team_satisfaction_score.score,
      confidence_level: analysis360.confidence_level.score,
      extreme_count: analysis360.extreme_count,
      evaluators_count: evalInputs.length,
      initiative_verification_rate: analysis360.initiative_verification_rate,
      kpi_verification_rate: analysis360.kpi_verification_rate,
    } : null,
  };
  const govAnalysis = computeGovernanceScore(scoreInput);

  const completedAssessments = assessments?.filter(a => (a as any).status === 'completed') || [];
  const completedEvals = evaluations?.length || 0;
  const totalLinks = evalLinks?.length || 0;

  const tabUrl = (tab: string) => `/governance/reviews/${params.id}?tab=${tab}`;

  return (
    <div dir="rtl">
      {/* رأس */}
      <div className="mb-5">
        <Link href="/governance/reviews" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-3">
          <ArrowRight className="h-4 w-4" />قائمة الملفات
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-700">{candidateUser?.full_name}</h1>
            <p className="text-darkgray mt-0.5">{candidateUser?.job_title} · {candidateUser?.department}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="institutional-card px-4 py-2 text-center">
              <div className="text-2xl font-bold text-gold-700">{govAnalysis.total_score}٪</div>
              <div className="text-xs text-darkgray">الدرجة</div>
            </div>
            <div className="institutional-card px-4 py-2 text-center">
              <div className="text-2xl font-bold text-primary-700">{govAnalysis.trust_score}٪</div>
              <div className="text-xs text-darkgray">الثقة</div>
            </div>
            <Badge variant={
              profile.status === 'approved' ? 'sage' :
              profile.status === 'returned_for_completion' ? 'wine' : 'gold'
            }>{STATUS_LABELS[profile.status] || profile.status}</Badge>
          </div>
        </div>
      </div>

      {/* تنبيهات ذكية */}
      {(govAnalysis.risk_flags.length > 0 || govAnalysis.special_flags.length > 0) && (
        <div className="mb-5 space-y-2">
          {[...govAnalysis.special_flags.map(f => ({ type: 'warning', text: f })), ...govAnalysis.risk_flags.map(f => ({ type: 'error', text: f }))].map((flag, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${flag.type === 'error' ? 'bg-rose-50 border border-rose-200 text-wine' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {flag.text}
            </div>
          ))}
        </div>
      )}

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
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* محتوى التبويب */}
      {activeTab === 'summary' && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card title="معلومات المرشح">
            <div className="space-y-2 text-sm">
              {[
                { label: 'الاسم', val: candidateUser?.full_name },
                { label: 'المسمى', val: candidateUser?.job_title },
                { label: 'الإدارة', val: candidateUser?.department },
                { label: 'رقم الموظف', val: candidateUser?.employee_number },
                { label: 'سنوات الخبرة', val: profile.years_of_experience ? `${profile.years_of_experience} سنة` : '—' },
                { label: 'اكتمال الملف', val: `${profile.completion_score || 0}٪` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between border-b border-gold-50 pb-1.5">
                  <span className="text-darkgray">{label}</span>
                  <span className="font-medium text-primary-700">{val || '—'}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="إحصاءات الملف">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'مبادرات', val: initiatives?.length || 0 },
                { label: 'مؤشرات', val: kpis?.length || 0 },
                { label: 'اختبارات مكتملة', val: completedAssessments.length },
                { label: 'تقييمات 360', val: completedEvals },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gold-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary-700">{val}</div>
                  <div className="text-xs text-darkgray mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="التصنيف المقترح" className="md:col-span-2">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-darkgray mb-1">مستوى الجاهزية</div>
                <div className="text-lg font-bold text-primary-700">{govAnalysis.readiness_label}</div>
              </div>
              <div>
                <div className="text-xs text-darkgray mb-1">نوع القيادة</div>
                <div className="text-lg font-bold text-gold-700">{govAnalysis.leadership_type_label}</div>
              </div>
              <div>
                <div className="text-xs text-darkgray mb-1">الدرجة الكلية</div>
                <div className="text-2xl font-bold text-primary-700">{govAnalysis.total_score}٪</div>
              </div>
              <div>
                <div className="text-xs text-darkgray mb-1">مستوى الثقة</div>
                <div className="text-2xl font-bold text-steelblue">{govAnalysis.trust_score}٪</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-primary-50 rounded-xl text-sm text-primary-800">{govAnalysis.ai_summary}</div>
          </Card>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <Card title="البيانات الأساسية والخبرات">
            <div className="grid md:grid-cols-2 gap-5 text-sm">
              {[
                { label: 'المؤهل العلمي', val: profile.qualification },
                { label: 'التخصص', val: profile.specialization },
                { label: 'الجهة التعليمية', val: profile.educational_institution },
                { label: 'الشهادات المهنية', val: profile.professional_certifications },
              ].filter(f => f.val).map(({ label, val }) => (
                <div key={label}><div className="text-xs text-darkgray mb-1">{label}</div><div className="text-primary-700">{val}</div></div>
              ))}
            </div>
          </Card>
          {[
            { key: 'internal_experience', label: 'الخبرة داخل المنظمة' },
            { key: 'current_tasks', label: 'المهام الحالية' },
            { key: 'past_leadership_tasks', label: 'المهام القيادية السابقة' },
            { key: 'led_projects', label: 'المشاريع التي قادها' },
            { key: 'committee_participations', label: 'اللجان التي شارك فيها' },
          ].filter(f => (profile as any)[f.key]).map(({ key, label }) => (
            <Card key={key} title={label}>
              <p className="text-sm text-primary-800 leading-relaxed whitespace-pre-wrap">{(profile as any)[key]}</p>
            </Card>
          ))}
          {/* التحليل الذكي للملف */}
          <Card title="تحليل الذكاء الاصطناعي للملف" className="bg-primary-50 border-primary-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'اكتمال الملف', val: profile.completion_score || 0 },
                { label: 'قابلية التحقق', val: govAnalysis.trust_score },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white rounded-lg p-3">
                  <div className="text-xs text-darkgray mb-1">{label}</div>
                  <div className="text-xl font-bold text-primary-700">{val}٪</div>
                  <div className="h-1.5 bg-gold-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'initiatives' && (
        <div className="space-y-3">
          {(!initiatives || initiatives.length === 0) ? (
            <div className="text-center py-8 text-darkgray">لا توجد مبادرات.</div>
          ) : initiatives.map((ini) => {
            const aiScore = (ini as any).ai_score;
            const aiFeedback = (ini as any).ai_feedback;
            return (
              <Card key={ini.id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-primary-700">{ini.name}</h3>
                  {aiScore !== null && aiScore !== undefined && (
                    <div className={`text-lg font-bold px-3 py-1 rounded-xl ${aiScore >= 75 ? 'bg-sage/10 text-sage' : aiScore >= 55 ? 'bg-gold-50 text-gold-700' : 'bg-rose-50 text-wine'}`}>
                      {Math.round(aiScore)}٪
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {ini.problem_description && <div><div className="text-xs text-darkgray mb-1">المشكلة</div><p className="text-primary-800">{ini.problem_description}</p></div>}
                  {ini.achieved_impact && <div><div className="text-xs text-darkgray mb-1">الأثر المحقق</div><p className="text-primary-800">{ini.achieved_impact}</p></div>}
                  {ini.impact_metrics && <div><div className="text-xs text-darkgray mb-1">مؤشر الأثر</div><p className="text-primary-800">{ini.impact_metrics}</p></div>}
                  {ini.evidence && <div><div className="text-xs text-darkgray mb-1">الشواهد</div><p className="text-primary-800">{ini.evidence}</p></div>}
                </div>
                {aiFeedback && aiFeedback.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {aiFeedback.slice(0, 2).map((f: any, i: number) => (
                      <div key={i} className={`text-xs p-2 rounded-lg ${f.type === 'success' ? 'bg-green-50 text-sage' : f.type === 'error' ? 'bg-rose-50 text-wine' : 'bg-amber-50 text-amber-800'}`}>
                        {f.text}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="space-y-3">
          {(!kpis || kpis.length === 0) ? (
            <div className="text-center py-8 text-darkgray">لا توجد مؤشرات.</div>
          ) : kpis.map((kpi) => {
            const aiScore = (kpi as any).ai_score;
            return (
              <Card key={kpi.id}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-primary-700">{kpi.name}</h3>
                  {aiScore !== null && aiScore !== undefined && (
                    <div className={`text-lg font-bold px-3 py-1 rounded-xl ${aiScore >= 75 ? 'bg-sage/10 text-sage' : 'bg-gold-50 text-gold-700'}`}>{Math.round(aiScore)}٪</div>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  {kpi.target_value && <div><div className="text-xs text-darkgray">المستهدف</div><div className="font-medium text-primary-700">{kpi.target_value}</div></div>}
                  {kpi.actual_value && <div><div className="text-xs text-darkgray">المحقق</div><div className="font-bold text-sage">{kpi.actual_value}</div></div>}
                  {kpi.evidence && <div><div className="text-xs text-darkgray">المصدر</div><div className="text-primary-700">{kpi.evidence}</div></div>}
                </div>
                {kpi.used_in_decision && <p className="text-xs text-darkgray mt-2">القرار: {kpi.used_in_decision}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="space-y-3">
          {completedAssessments.length === 0 ? (
            <div className="text-center py-8 text-darkgray">لم تكتمل أي اختبارات.</div>
          ) : completedAssessments.map((ar) => {
            const a = ar as any;
            return (
              <Card key={a.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary-700">{a.assessments?.title}</div>
                    <div className="text-xs text-darkgray mt-0.5">{a.thinking_pattern && `نمط: ${a.thinking_pattern}`}</div>
                  </div>
                  <div className={`text-2xl font-bold ${a.score >= 75 ? 'text-sage' : a.score >= 55 ? 'text-gold-700' : 'text-wine'}`}>
                    {Number(a.score).toFixed(0)}٪
                  </div>
                </div>
              </Card>
            );
          })}
          {/* النمط العام */}
          {govAnalysis.axis_scores.technology > 0 && (
            <Card title="تحليل الاختبارات" className="bg-primary-50 border-primary-200">
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                {[
                  { label: 'القيادة', val: govAnalysis.axis_scores.leadership },
                  { label: 'الاستراتيجي', val: govAnalysis.axis_scores.strategic },
                  { label: 'التقنية', val: govAnalysis.axis_scores.technology },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white rounded-lg p-3">
                    <div className="text-xl font-bold text-primary-700">{val}٪</div>
                    <div className="text-xs text-darkgray mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'evaluation360' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'المقيمون المعتمدون', val: totalLinks },
              { label: 'التقييمات المكتملة', val: completedEvals },
              { label: 'نسبة الاكتمال', val: `${totalLinks > 0 ? Math.round((completedEvals / totalLinks) * 100) : 0}٪` },
            ].map(({ label, val }) => (
              <div key={label} className="institutional-card p-4 text-center">
                <div className="text-2xl font-bold text-primary-700">{val}</div>
                <div className="text-xs text-darkgray mt-1">{label}</div>
              </div>
            ))}
          </div>
          {analysis360 ? (
            <div className="space-y-4">
              <Card title="نتائج تقييم 360">
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div><div className="text-3xl font-bold text-primary-700">{analysis360.overall_score}٪</div><div className="text-xs text-darkgray">الدرجة الكلية</div></div>
                  <div><div className="text-3xl font-bold text-steelblue">{analysis360.confidence_level.score}٪</div><div className="text-xs text-darkgray">مستوى الثقة</div></div>
                </div>
                {Object.entries(analysis360.axis_averages).map(([axis, score]) => (
                  <div key={axis} className="mb-2">
                    <div className="flex justify-between text-xs mb-0.5"><span className="text-darkgray">{axis}</span><span className="font-medium">{score}٪</span></div>
                    <div className="h-1.5 bg-gold-100 rounded-full overflow-hidden"><div className="h-full bg-primary-600 rounded-full" style={{ width: `${score}%` }} /></div>
                  </div>
                ))}
              </Card>
              <Card title="الملخص الذكي للجنة" className="bg-primary-50 border-primary-200">
                <p className="text-sm text-primary-800 leading-relaxed">{analysis360.committee_summary}</p>
                <div className="text-sm font-bold text-gold-700 mt-2">{analysis360.detected_leadership_type}</div>
              </Card>
              {analysis360.extreme_count > 0 && (
                <Card title="تقييمات متطرفة" className="bg-amber-50 border-amber-200">
                  {analysis360.extreme_flags.map((f, i) => <div key={i} className="text-sm text-amber-800 mb-1">• {f}</div>)}
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-darkgray">لم تصل تقييمات كافية للتحليل.</div>
          )}
        </div>
      )}

      {activeTab === 'ai_analysis' && (
        <div className="space-y-4">
          <Card title="التحليل الذكي الشامل" className="bg-primary-50 border-primary-200">
            <p className="text-base text-primary-800 leading-relaxed mb-4">{govAnalysis.ai_summary}</p>
            <div className="border-t border-primary-200 pt-4">
              <div className="font-semibold text-primary-700 mb-2">توصية النظام:</div>
              <p className="text-sm text-primary-800">{govAnalysis.governance_recommendation}</p>
            </div>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="نقاط القوة">
              {govAnalysis.primary_strengths.length > 0
                ? <ul className="space-y-1">{govAnalysis.primary_strengths.map(s => <li key={s} className="text-sm text-sage flex items-center gap-2">✓ {s}</li>)}</ul>
                : <div className="text-sm text-darkgray">لا توجد نقاط قوة بارزة.</div>}
            </Card>
            <Card title="فجوات التطوير">
              {govAnalysis.development_gaps.length > 0
                ? <ul className="space-y-1">{govAnalysis.development_gaps.map(g => <li key={g} className="text-sm text-wine flex items-center gap-2">! {g}</li>)}</ul>
                : <div className="text-sm text-darkgray">لا توجد فجوات بارزة.</div>}
            </Card>
          </div>
          <Card title="درجات المحاور السبعة">
            <div className="space-y-2">
              {Object.entries(govAnalysis.axis_scores).map(([axis, score]) => {
                const labels: Record<string, string> = {
                  leadership: 'القيادة', strategic: 'الاستراتيجي',
                  performance: 'الأداء', innovation: 'الابتكار',
                  team: 'الفريق', technology: 'التقنية', integrity: 'النزاهة',
                };
                const weights: Record<string, number> = {
                  leadership: 20, strategic: 15, performance: 15,
                  innovation: 15, team: 15, technology: 10, integrity: 10,
                };
                return (
                  <div key={axis}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-darkgray">{labels[axis]} ({weights[axis]}٪)</span>
                      <span className="font-bold text-primary-700">{score}٪</span>
                    </div>
                    <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${score >= 75 ? 'bg-sage' : score >= 55 ? 'bg-primary-600' : 'bg-wine'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gold-200 flex justify-between">
              <span className="font-bold text-primary-700">الدرجة الكلية المرجحة</span>
              <span className="text-xl font-bold text-gold-700">{govAnalysis.total_score}٪</span>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-4">
          {govAnalysis.risk_flags.length === 0 && govAnalysis.confidence_issues.length === 0 ? (
            <div className="institutional-card p-6 text-center text-sage">✓ لم يُرصد تحيز أو مخاطر واضحة في هذا الملف.</div>
          ) : (
            <>
              {govAnalysis.risk_flags.map((f, i) => (
                <div key={i} className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-wine flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-wine">{f}</span>
                </div>
              ))}
              {govAnalysis.confidence_issues.map((f, i) => (
                <div key={i} className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-amber-800">{f}</span>
                </div>
              ))}
            </>
          )}
          {govAnalysis.special_flags.length > 0 && (
            <Card title="التصنيفات الخاصة">
              {govAnalysis.special_flags.map((f, i) => (
                <div key={i} className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700 mb-2">{f}</div>
              ))}
            </Card>
          )}
          {/* سجل قرارات سابقة */}
          {decisions && decisions.length > 0 && (
            <Card title="سجل قرارات اللجنة السابقة">
              {decisions.map((d: any) => (
                <div key={d.id} className="p-3 border-b border-gold-100 text-sm">
                  <div className="font-medium text-primary-700">{d.decision_type}</div>
                  <div className="text-darkgray text-xs mt-0.5">{d.reason}</div>
                  <div className="text-xs text-darkgray mt-0.5">{new Date(d.decided_at).toLocaleDateString('ar-SA')}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'decision' && (
        <GovernanceDecisionPanel
          candidateId={params.id}
          currentStatus={profile.status}
          aiScore={govAnalysis.total_score}
          aiLevel={govAnalysis.readiness_label}
          aiLeadershipType={govAnalysis.leadership_type_label}
          aiStrengths={govAnalysis.primary_strengths}
          aiGaps={govAnalysis.development_gaps}
        />
      )}
    </div>
  );
}
