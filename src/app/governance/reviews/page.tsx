import Link from 'next/link';
import { FileSearch, ArrowLeft, AlertTriangle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const STATUS_INFO: Record<string, { label: string; variant: 'gold' | 'primary' | 'sage' | 'wine' | 'steelblue' | 'gray' }> = {
  awaiting_evaluators: { label: 'بانتظار اعتماد المقيمين', variant: 'gold' },
  awaiting_360: { label: 'بانتظار 360', variant: 'steelblue' },
  under_governance_review: { label: 'بانتظار قرار اللجنة', variant: 'primary' },
  returned_for_completion: { label: 'معاد للاستكمال', variant: 'wine' },
  approved: { label: 'معتمد', variant: 'sage' },
};

export default async function GovernanceReviewsPage() {
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, completion_score, created_at, users(full_name, job_title, department)')
    .in('status', ['awaiting_evaluators', 'awaiting_360', 'under_governance_review', 'returned_for_completion', 'approved'])
    .order('created_at', { ascending: true });

  const countByStatus: Record<string, number> = {};
  (profiles || []).forEach(p => { countByStatus[p.status] = (countByStatus[p.status] || 0) + 1; });

  return (
    <div dir="rtl">
      <PageHeader
        title="مراجعة ملفات المرشحين"
        description="جميع الملفات التي تحتاج مراجعة أو اتخاذ إجراء. الترتيب حسب الأقدمية لضمان العدالة."
        example="انقر على ملف المرشح لفتح صفحة المراجعة الكاملة بتبويباتها."
        icon={<FileSearch className="h-5 w-5" />}
      />

      {/* إحصاء سريع */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(STATUS_INFO).map(([status, info]) => {
          const count = countByStatus[status] || 0;
          if (count === 0) return null;
          return (
            <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-50 border border-gold-200 text-sm text-gold-800">
              <span>{info.label}</span>
              <span className="font-bold bg-white rounded-full px-1.5 text-xs">{count}</span>
            </div>
          );
        })}
      </div>

      {profiles && profiles.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الإدارة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">اكتمال الملف</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">تاريخ الإدخال</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  type Row = { users: { full_name: string; job_title?: string; department?: string } };
                  const r = p as unknown as Row;
                  const si = STATUS_INFO[p.status] || { label: p.status, variant: 'gray' as const };
                  return (
                    <tr key={p.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-primary-800">{r.users?.full_name}</div>
                        <div className="text-xs text-darkgray">{r.users?.job_title}</div>
                      </td>
                      <td className="py-3 px-3 text-darkgray">{r.users?.department || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-gold-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${(p.completion_score || 0) >= 80 ? 'bg-sage' : (p.completion_score || 0) >= 50 ? 'bg-gold-500' : 'bg-wine'}`}
                              style={{ width: `${p.completion_score || 0}%` }} />
                          </div>
                          <span className="text-sm font-medium">{p.completion_score || 0}٪</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={si.variant}>{si.label}</Badge>
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray">
                        {new Date(p.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3 px-3">
                        <Link href={`/governance/reviews/${p.id}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
                          مراجعة <ArrowLeft className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<FileSearch className="h-10 w-10" />}
          title="لا توجد ملفات بانتظار المراجعة"
          description="ستظهر ملفات المرشحين هنا فور وصولها لمرحلة مراجعة اللجنة."
        />
      )}
    </div>
  );
}
