import { FileText, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
const TRACK_LABELS: Record<string, string> = {
  individual: 'تقييم فردي',
  competition: 'مسابقة وظيفية',
  succession: 'تعاقب وظيفي',
  development: 'تطوير قيادي',
};

export default async function HREvaluationTracksPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, evaluation_track, users(full_name, job_title)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="مسارات التقييم"
        description="جميع المرشحين موزعين على مساراتهم: فردي، مسابقة، تعاقب، تطوير. كل مسار له معاييره."
        icon={<FileText className="h-5 w-5" />}
      />

      {profiles && profiles.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">المسار</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  type Row = { users: { full_name: string; job_title?: string } };
                  const r = p as unknown as Row;
                  return (
                    <tr key={p.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-primary-800">{r.users?.full_name}</div>
                        <div className="text-xs text-darkgray">{r.users?.job_title}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="primary">
                          {TRACK_LABELS[p.evaluation_track || 'individual'] || p.evaluation_track || 'فردي'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="gold">{p.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState icon={<FileText className="h-5 w-5" />} title="لا توجد ملفات" description="ستظهر المسارات هنا." />
      )}
    </div>
  );
}
