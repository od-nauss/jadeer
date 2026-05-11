import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function HRCandidatesPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('*, users(full_name, job_title, department, email)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المرشحون"
        description="جميع المرشحين في المنصة. يمكنك متابعة حالة كل مرشح واكتمال ملفه."
        icon={<Users className="h-5 w-5" />}
      />

      {profiles && profiles.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">المسمى</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الإدارة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الاكتمال</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  type Row = { users: { full_name: string; job_title?: string; department?: string } };
                  const r = p as unknown as Row;
                  return (
                    <tr key={p.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3 font-medium text-primary-800">{r.users?.full_name}</td>
                      <td className="py-3 px-3 text-darkgray">{r.users?.job_title || '—'}</td>
                      <td className="py-3 px-3 text-darkgray">{r.users?.department || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gold-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500"
                              style={{ width: `${p.completion_score || 0}%` }}
                            />
                          </div>
                          <span className="text-xs">{p.completion_score || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="primary">{p.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Users className="h-8 w-8" />} title="لا يوجد مرشحون" description="ستظهر المرشحين هنا فور تسجيلهم." />
      )}
    </div>
  );
}
