import { ScrollText, CheckCircle2, RotateCcw, XCircle, Clock, Shield } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DECISION_DISPLAY: Record<string, { label: string; icon: string; variant: 'sage' | 'gold' | 'wine' | 'steelblue' | 'primary' | 'gray' }> = {
  approved:              { label: 'اعتماد',          icon: '✓', variant: 'sage' },
  conditional_approval:  { label: 'اعتماد مشروط',   icon: '◑', variant: 'steelblue' },
  returned_for_completion:{ label: 'إعادة للاستكمال',icon: '↩', variant: 'gold' },
  deferred:              { label: 'تأجيل',            icon: '⏳', variant: 'primary' },
  rejected:              { label: 'رفض',              icon: '✗', variant: 'wine' },
  // Legacy
  approve:               { label: 'اعتماد',          icon: '✓', variant: 'sage' },
  return_for_completion: { label: 'إعادة',            icon: '↩', variant: 'gold' },
  reject_classification: { label: 'رفض',              icon: '✗', variant: 'wine' },
};

export default async function GovernanceAuditPage() {
  const svc = createServiceClient();

  const { data: decisions } = await svc
    .from('governance_decisions')
    .select(`
      id, decision_type, reason, committee_note,
      new_classification, new_status, decided_at,
      candidate_profile_id,
      candidate_profiles(
        id,
        users(full_name, job_title, department)
      )
    `)
    .order('decided_at', { ascending: false })
    .limit(200);

  // إحصاءات
  const total = decisions?.length || 0;
  const approved = decisions?.filter(d => ['approved', 'approve', 'conditional_approval'].includes(d.decision_type)).length || 0;
  const returned = decisions?.filter(d => ['returned_for_completion', 'return_for_completion'].includes(d.decision_type)).length || 0;
  const rejected = decisions?.filter(d => ['rejected', 'reject_classification'].includes(d.decision_type)).length || 0;

  return (
    <div dir="rtl">
      <PageHeader
        title="سجل الحوكمة"
        description="سجل كامل وغير قابل للحذف لجميع قرارات لجنة الحوكمة. يُستخدم للمساءلة والمراجعة المؤسسية."
        icon={<ScrollText className="h-5 w-5" />}
      />

      {/* إحصاءات */}
      {total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'إجمالي القرارات', val: total,    color: 'text-primary-700', bg: 'bg-primary-50 border-primary-100' },
            { label: 'اعتمادات',         val: approved, color: 'text-sage',        bg: 'bg-green-50 border-green-100' },
            { label: 'إعادة للاستكمال', val: returned, color: 'text-gold-700',    bg: 'bg-gold-50 border-gold-100' },
            { label: 'رفض',              val: rejected, color: 'text-wine',        bg: 'bg-rose-50 border-rose-100' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`${bg} border rounded-xl p-4 text-center`}>
              <div className={`text-3xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-darkgray mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {!decisions || decisions.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-10 w-10" />}
          title="لا توجد قرارات في السجل بعد"
          description="ستُسجَّل هنا تلقائياً كل قرارات اللجنة فور اتخاذها من صفحة مراجعة الملفات أو اعتماد النتائج."
        />
      ) : (
        <div className="space-y-3">
          {(decisions as any[]).map((d, index) => {
            const di = DECISION_DISPLAY[d.decision_type] || { label: d.decision_type, icon: '•', variant: 'gray' as const };
            const candidate = d.candidate_profiles?.users;
            const profileId = d.candidate_profile_id;
            const isRecent = index < 3;

            return (
              <div key={d.id} className={`p-4 border rounded-xl transition ${
                isRecent ? 'border-primary-200 bg-primary-50/30' : 'border-gold-100 bg-white'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* أيقونة القرار */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                      di.variant === 'sage' ? 'bg-green-100 text-sage' :
                      di.variant === 'wine' ? 'bg-rose-100 text-wine' :
                      di.variant === 'gold' ? 'bg-gold-100 text-gold-700' :
                      di.variant === 'steelblue' ? 'bg-blue-100 text-steelblue' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {di.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* معلومات المرشح */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-bold text-primary-700">{candidate?.full_name || '—'}</span>
                        {candidate?.job_title && <span className="text-xs text-darkgray">{candidate.job_title}</span>}
                        {candidate?.department && <span className="text-xs text-darkgray">· {candidate.department}</span>}
                      </div>

                      {/* نوع القرار والتصنيف */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant={di.variant}>{di.label}</Badge>
                        {d.new_classification && (
                          <span className="text-xs bg-primary-50 text-primary-600 border border-primary-100 px-2 py-0.5 rounded-lg">
                            {d.new_classification}
                          </span>
                        )}
                        {isRecent && (
                          <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-lg">حديث</span>
                        )}
                      </div>

                      {/* نص المسوّغات */}
                      <p className="text-sm text-darkgray leading-relaxed line-clamp-2">{d.reason}</p>

                      {/* الملاحظات / الشروط */}
                      {d.committee_note && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-steelblue">
                          <span className="font-bold">ملاحظة: </span>{d.committee_note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-left space-y-2">
                    <div className="text-xs text-darkgray whitespace-nowrap">
                      {d.decided_at
                        ? new Date(d.decided_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </div>
                    {profileId && (
                      <Link
                        href={`/governance/reviews/${profileId}`}
                        className="block text-center text-xs text-primary-700 border border-primary-200 px-2 py-1 rounded-lg hover:bg-primary-50 transition whitespace-nowrap"
                      >
                        فتح الملف
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* تذييل المساءلة */}
      {total > 0 && (
        <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-xl text-xs text-darkgray flex items-start gap-2">
          <Shield className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />
          <span>هذا السجل محمي وغير قابل للتعديل أو الحذف من الواجهة. كل قرار مُوثَّق بالتوقيت والجهة المصدرة للضمان المؤسسي والمساءلة.</span>
        </div>
      )}
    </div>
  );
}
