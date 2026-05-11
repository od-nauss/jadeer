import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { ClipboardCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

const DECISION_LABELS: Record<string, { label: string; variant: 'sage' | 'gold' | 'wine' | 'primary' | 'gray' }> = {
  approve: { label: 'اعتماد', variant: 'sage' },
  return_for_completion: { label: 'إعادة للاستكمال', variant: 'gold' },
  request_additional_evidence: { label: 'طلب شواهد', variant: 'primary' },
  reject_classification: { label: 'رفض التصنيف', variant: 'wine' },
  close_temporarily: { label: 'إغلاق مؤقت', variant: 'gray' },
};

export default async function GovernanceDecisionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: decisions } = await supabase
    .from('governance_decisions')
    .select('*, candidate_profiles(users(full_name, job_title, department)), users(full_name)')
    .order('decided_at', { ascending: false })
    .limit(100);

  return (
    <div dir="rtl">
      <PageHeader
        title="سجل قرارات اللجنة"
        description="جميع القرارات الصادرة عن لجنة الحوكمة مرتبة من الأحدث للأقدم."
        icon={<ClipboardCheck className="h-5 w-5" />}
      />

      {(!decisions || decisions.length === 0) ? (
        <EmptyState icon={<ClipboardCheck className="h-10 w-10" />} title="لا توجد قرارات بعد" description="ستظهر قرارات اللجنة هنا فور اتخاذها." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">القرار</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">السبب</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">بواسطة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d: any) => {
                  const candidate = d.candidate_profiles?.users;
                  const decider = d.users;
                  const di = DECISION_LABELS[d.decision_type] || { label: d.decision_type, variant: 'gray' as const };
                  return (
                    <tr key={d.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-primary-800">{candidate?.full_name}</div>
                        <div className="text-xs text-darkgray">{candidate?.job_title}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={di.variant}>{di.label}</Badge>
                        {d.new_classification && <div className="text-xs text-darkgray mt-0.5">{d.new_classification}</div>}
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="text-xs text-darkgray line-clamp-2">{d.reason}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray">{decider?.full_name || '—'}</td>
                      <td className="py-3 px-3 text-xs text-darkgray">
                        {new Date(d.decided_at).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
