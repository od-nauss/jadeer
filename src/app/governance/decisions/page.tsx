import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

const DECISION_INFO: Record<string, { label: string; variant: 'sage' | 'gold' | 'wine' | 'primary' | 'steelblue' | 'gray'; icon: string }> = {
  approved:              { label: 'اعتماد الترشيح',    variant: 'sage',       icon: '✓' },
  conditional_approval:  { label: 'اعتماد مشروط',      variant: 'steelblue',  icon: '◑' },
  returned_for_completion:{ label: 'إعادة للاستكمال',  variant: 'gold',       icon: '↩' },
  deferred:              { label: 'تأجيل القرار',       variant: 'primary',    icon: '⏳' },
  rejected:              { label: 'رفض الترشيح',        variant: 'wine',       icon: '✗' },
  // Legacy values
  approve:               { label: 'اعتماد',             variant: 'sage',       icon: '✓' },
  return_for_completion: { label: 'إعادة للاستكمال',   variant: 'gold',       icon: '↩' },
  request_additional_evidence: { label: 'طلب شواهد',   variant: 'primary',    icon: '?' },
  reject_classification: { label: 'رفض التصنيف',        variant: 'wine',       icon: '✗' },
};

export default async function GovernanceDecisionsPage() {
  const svc = createServiceClient();

  const { data: decisions } = await svc
    .from('governance_decisions')
    .select(`
      id, decision_type, reason, committee_note, decided_at,
      new_classification, new_status,
      candidate_profile_id,
      candidate_profiles(
        id, status,
        users(full_name, job_title, department)
      )
    `)
    .order('decided_at', { ascending: false })
    .limit(100);

  // إحصاءات
  const stats = {
    total: decisions?.length || 0,
    approved: decisions?.filter(d => d.decision_type === 'approved' || d.decision_type === 'approve').length || 0,
    conditional: decisions?.filter(d => d.decision_type === 'conditional_approval').length || 0,
    returned: decisions?.filter(d => ['returned_for_completion', 'return_for_completion'].includes(d.decision_type)).length || 0,
    rejected: decisions?.filter(d => d.decision_type === 'rejected' || d.decision_type === 'reject_classification').length || 0,
  };

  return (
    <div dir="rtl">
      <PageHeader
        title="سجل قرارات اللجنة"
        description="جميع القرارات الصادرة عن لجنة الحوكمة مرتبة من الأحدث للأقدم. كل قرار موثق مع أسبابه ودرجة المرشح."
        icon={<ClipboardCheck className="h-5 w-5" />}
      />

      {/* إحصاءات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي القرارات', val: stats.total, color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'اعتمادات', val: stats.approved + stats.conditional, color: 'text-sage', bg: 'bg-green-50' },
          { label: 'إعادة للاستكمال', val: stats.returned, color: 'text-gold-700', bg: 'bg-gold-50' },
          { label: 'رفض', val: stats.rejected, color: 'text-wine', bg: 'bg-rose-50' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${color}`}>{val}</div>
            <div className="text-xs text-darkgray mt-1">{label}</div>
          </div>
        ))}
      </div>

      {(!decisions || decisions.length === 0) ? (
        <EmptyState
          icon={<ClipboardCheck className="h-10 w-10" />}
          title="لا توجد قرارات بعد"
          description="ستظهر هنا قرارات لجنة الحوكمة فور اتخاذها من صفحة مراجعة ملفات المرشحين."
        />
      ) : (
        <div className="space-y-3">
          {(decisions as any[]).map((d) => {
            const candidate = d.candidate_profiles?.users;
            const di = DECISION_INFO[d.decision_type] || { label: d.decision_type, variant: 'gray' as const, icon: '•' };

            const profileId = d.candidate_profile_id;
            return (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
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
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-primary-700">{candidate?.full_name || '—'}</span>
                        <span className="text-xs text-darkgray">{candidate?.job_title}</span>
                        {candidate?.department && <span className="text-xs text-darkgray">· {candidate.department}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant={di.variant}>{di.label}</Badge>
                        {d.new_classification && (
                          <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">
                            {d.new_classification}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-darkgray leading-relaxed line-clamp-2">{d.reason}</p>
                      {d.committee_note && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-steelblue">
                          {d.committee_note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-left">
                    <div className="text-xs text-darkgray mb-2">
                      {d.decided_at ? new Date(d.decided_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </div>
                    {profileId && (
                      <Link
                        href={`/governance/reviews/${profileId}`}
                        className="flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900 border border-primary-200 px-2 py-1 rounded-lg hover:bg-primary-50 transition"
                      >
                        الملف <ArrowLeft className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
