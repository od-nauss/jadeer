import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Link2, CheckCircle2, Clock, XCircle, AlertTriangle, Brain, RotateCcw, Copy } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { analyze360Results } from '@/lib/ai/analyzer360';
import { Governance360Actions } from './actions';

export const dynamic = 'force-dynamic';

const LINK_STATUS: Record<string, { label: string; variant: 'sage' | 'gold' | 'primary' | 'wine' | 'gray' }> = {
  ready:       { label: 'جاهز', variant: 'gold' },
  copied:      { label: 'تم النسخ', variant: 'primary' },
  opened:      { label: 'مفتوح', variant: 'primary' },
  submitted:   { label: 'أُرسل التقييم', variant: 'sage' },
  expired:     { label: 'منتهي', variant: 'gray' },
  cancelled:   { label: 'ملغي', variant: 'wine' },
  regenerated: { label: 'مُعاد', variant: 'gold' },
};

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

export default async function Governance360CandidatePage({ params }: { params: { candidateId: string } }) {
  const supabase = createServiceClient();

  const [{ data: profile }, { data: links }, { data: evaluations }] = await Promise.all([
    supabase.from('candidate_profiles').select('id, status, users(full_name, job_title, department)').eq('id', params.candidateId).maybeSingle(),
    supabase.from('evaluation_links')
      .select('*, approved_evaluators(full_name, email, relationship_type, committee_selected, added_by_committee)')
      .eq('candidate_profile_id', params.candidateId)
      .order('created_at'),
    supabase.from('evaluations_360')
      .select('id, approved_evaluator_id, scores_json, overall_score, trust_score, is_extreme, comments_summary, initiative_verifications_json, kpi_verifications_json, submitted_at')
      .eq('candidate_profile_id', params.candidateId),
  ]);

  if (!profile) notFound();
  const profileTyped = profile as any;
  const candidateUser = profileTyped.users;

  const linksList = links || [];
  const evalsList = evaluations || [];

  const submitted = linksList.filter(l => l.status === 'submitted').length;
  const total = linksList.length;
  const completionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  // تحليل النتائج الواردة
  const evalInputs = evalsList.map(ev => ({
    evaluator_id: ev.approved_evaluator_id,
    relationship_type: (linksList.find(l => l.approved_evaluator_id === ev.approved_evaluator_id) as any)?.approved_evaluators?.relationship_type || 'other',
    scores_json: (ev.scores_json || {}) as Record<string, { score: number; comment?: string }>,
    comments_summary: ev.comments_summary || '',
    initiative_verifications_json: (ev.initiative_verifications_json || {}) as Record<string, unknown>,
    kpi_verifications_json: (ev.kpi_verifications_json || {}) as Record<string, unknown>,
  }));

  const analysis360 = evalInputs.length >= 2 ? analyze360Results(evalInputs) : null;

  return (
    <div dir="rtl">
      {/* رأس */}
      <div className="mb-6">
        <Link href="/governance/360" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-3">
          <ArrowRight className="h-4 w-4" />العودة
        </Link>
        <h1 className="text-2xl font-bold text-primary-700">متابعة تقييم 360</h1>
        {candidateUser && <p className="text-darkgray mt-1">{candidateUser.full_name} · {candidateUser.job_title}</p>}
      </div>

      {/* إحصاءات سريعة */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { val: total, label: 'إجمالي الروابط', color: 'text-primary-700' },
          { val: submitted, label: 'تقييمات مكتملة', color: 'text-sage' },
          { val: linksList.filter(l => ['ready', 'copied', 'opened'].includes(l.status)).length, label: 'بانتظار الإرسال', color: 'text-gold-700' },
          { val: linksList.filter(l => l.status === 'expired').length, label: 'منتهية', color: 'text-wine' },
        ].map((s, i) => (
          <div key={i} className="institutional-card p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-darkgray mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* شريط الاكتمال */}
      <div className="mb-6 institutional-card p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-primary-700">اكتمال تقييم 360</span>
          <span className="text-2xl font-bold text-gold-700">{completionRate}٪</span>
        </div>
        <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${completionRate >= 70 ? 'bg-sage' : 'bg-gold-500'}`} style={{ width: `${completionRate}%` }} />
        </div>
        <div className="text-xs text-darkgray mt-1">{submitted} من {total} تقييمات مكتملة</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* قائمة الروابط */}
        <div>
          <h3 className="font-bold text-primary-700 mb-3">حالة روابط التقييم</h3>
          <div className="space-y-2">
            {linksList.map((link) => {
              const ev = link as any;
              const evaluator = ev.approved_evaluators;
              const si = LINK_STATUS[link.status] || LINK_STATUS.ready;
              return (
                <Card key={link.id} className="!p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {evaluator?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-700 text-sm truncate">{evaluator?.full_name}</span>
                        {evaluator?.committee_selected && <span className="text-xs text-primary-600 border border-primary-200 px-1 rounded">اللجنة</span>}
                      </div>
                      <div className="text-xs text-darkgray">{REL_LABELS[evaluator?.relationship_type] || evaluator?.relationship_type}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={si.variant}>{si.label}</Badge>
                      <Governance360Actions linkId={link.id} status={link.status} token={link.token} candidateId={params.candidateId} />
                    </div>
                  </div>
                  {link.submitted_at && (
                    <div className="text-xs text-darkgray mt-1.5 mr-12">
                      أُرسل: {new Date(link.submitted_at).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* التحليل الذكي */}
        <div>
          <h3 className="font-bold text-primary-700 mb-3">التحليل الذكي للنتائج</h3>
          {!analysis360 ? (
            <div className="institutional-card p-6 text-center text-darkgray text-sm">
              {evalsList.length === 0
                ? 'لم تصل تقييمات بعد. سيظهر التحليل فور اكتمال تقييمين على الأقل.'
                : 'يتطلب التحليل تقييمين على الأقل.'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* الدرجة الكلية */}
              <div className="institutional-card p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-700">{analysis360.overall_score}٪</div>
                    <div className="text-xs text-darkgray mt-1">درجة تقييم 360</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${analysis360.confidence_level.score >= 70 ? 'text-sage' : 'text-gold-700'}`}>
                      {analysis360.confidence_level.score}٪
                    </div>
                    <div className="text-xs text-darkgray mt-1">مستوى الثقة</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gold-100 text-center">
                  <span className="text-sm font-medium text-gold-700">{analysis360.detected_leadership_type}</span>
                </div>
              </div>

              {/* المؤشرات */}
              {[
                { label: 'رضا الفريق', score: analysis360.team_satisfaction_score },
                { label: 'الثقة المهنية', score: analysis360.professional_trust_score },
                { label: 'الاستعداد للقيادة', score: analysis360.leadership_readiness_score },
                { label: 'التوازن', score: analysis360.balance_score },
              ].map(({ label, score }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray">{label}</span>
                    <span className={`font-bold text-${score.color === 'sage' ? 'sage' : score.color === 'wine' ? 'wine' : 'gold-700'}`}>{score.score}٪</span>
                  </div>
                  <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${score.color === 'sage' ? 'bg-sage' : score.color === 'primary' ? 'bg-primary-600' : score.color === 'gold' ? 'bg-gold-500' : 'bg-wine'}`}
                      style={{ width: `${score.score}%` }} />
                  </div>
                </div>
              ))}

              {/* التحقق */}
              <div className="institutional-card p-4 grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-700">{analysis360.initiative_verification_rate}٪</div>
                  <div className="text-xs text-darkgray">تأكيد المبادرات</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-700">{analysis360.kpi_verification_rate}٪</div>
                  <div className="text-xs text-darkgray">تأكيد المؤشرات</div>
                </div>
              </div>

              {/* التقييمات المتطرفة */}
              {analysis360.extreme_count > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    تقييمات متطرفة ({analysis360.extreme_count})
                  </div>
                  {analysis360.extreme_flags.map((f, i) => (
                    <div key={i} className="text-xs text-amber-700 mb-1">{f}</div>
                  ))}
                </div>
              )}

              {/* الملخص للجنة */}
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-bold text-primary-700">ملخص ذكي للجنة</span>
                </div>
                <p className="text-sm text-primary-800 leading-relaxed">{analysis360.committee_summary}</p>
              </div>

              {/* الملاحظات */}
              <div className="space-y-1.5">
                {analysis360.feedback.map((f, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                    f.type === 'success' ? 'bg-green-50 text-sage' :
                    f.type === 'error' ? 'bg-rose-50 text-wine' :
                    f.type === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-steelblue'
                  }`}>
                    <span className="flex-shrink-0 mt-0.5">{f.type === 'success' ? '✓' : f.type === 'error' ? '✗' : '!'}</span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
