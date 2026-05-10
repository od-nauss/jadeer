import { Activity, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function CandidateKPIsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data: kpis } = await supabase
    .from('kpis')
    .select('*')
    .eq('candidate_profile_id', profile?.id || '')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="مؤشرات الأداء"
        description="ما المؤشرات التي استخدمتها لقياس عملك؟ نضج المؤشر يدل على نضج القائد. اذكر المؤشر، المستهدف، المحقق، ومصدر التحقق."
        example="مثلاً: مؤشر 'وقت معالجة الطلب' - مستهدف: 3 أيام - محقق: 2.4 يوم - المصدر: تقارير النظام الشهرية."
        icon={<Activity className="h-5 w-5" />}
      />

      <div className="mb-4">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold">
          <Plus className="h-4 w-4" />
          إضافة مؤشر
        </button>
      </div>

      {kpis && kpis.length > 0 ? (
        <div className="space-y-3">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-primary-700">{kpi.name}</h3>
                <Badge variant="primary">{kpi.maturity_level || 'تشغيلي'}</Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                {kpi.target && (
                  <div>
                    <span className="text-xs text-darkgray">المستهدف</span>
                    <div className="font-medium text-primary-700">{kpi.target}</div>
                  </div>
                )}
                {kpi.achieved && (
                  <div>
                    <span className="text-xs text-darkgray">المحقق</span>
                    <div className="font-medium text-primary-700">{kpi.achieved}</div>
                  </div>
                )}
                {kpi.verification_source && (
                  <div>
                    <span className="text-xs text-darkgray">مصدر التحقق</span>
                    <div className="font-medium text-primary-700">{kpi.verification_source}</div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Activity className="h-5 w-5" />} title="لا توجد مؤشرات" description="أضف أول مؤشر استخدمته في عملك." />
      )}
    </div>
  );
}
