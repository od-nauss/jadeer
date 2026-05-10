import { Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';

export default async function Governance360Page() {
  const supabase = createClient();

  // تجميع تقدم 360 لكل مرشح
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, users(full_name, job_title)')
    .in('status', ['evaluation_in_progress', 'evaluation_complete']);

  return (
    <div>
      <PageHeader
        title="متابعة تقييم 360"
        description="نسبة اكتمال تقييم 360 لكل مرشح. تستطيع تمديد الروابط أو إغلاق التقييم كمراجعة مشروطة."
        icon={Eye}
      />

      {profiles && profiles.length > 0 ? (
        <div className="space-y-3">
          {profiles.map(async (p) => {
            type Row = { users: { full_name: string; job_title?: string } };
            const r = p as unknown as Row;

            // جلب نسبة الاكتمال الفعلية
            const sb = createClient();
            const { count: total } = await sb
              .from('approved_evaluators')
              .select('id', { count: 'exact', head: true })
              .eq('candidate_profile_id', p.id);
            const { count: completed } = await sb
              .from('evaluations_360')
              .select('id', { count: 'exact', head: true })
              .eq('candidate_profile_id', p.id);

            const percent = total ? Math.round(((completed || 0) / total) * 100) : 0;

            return (
              <Card key={p.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-primary-700">{r.users?.full_name}</div>
                    <div className="text-xs text-darkgray">{r.users?.job_title}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gold-700">{percent}%</div>
                    <div className="text-xs text-darkgray">
                      {completed || 0} من {total || 0}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-600"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Eye}
          title="لا توجد تقييمات 360 جارية"
          description="ستظهر هنا التقييمات النشطة فور اعتماد قوائم المقيمين."
        />
      )}
    </div>
  );
}
