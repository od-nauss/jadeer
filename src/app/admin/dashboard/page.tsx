import { LayoutDashboard, Users, FileText, Activity, Database, Trophy, Bell, ScrollText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient();

  // جمع المؤشرات مع معالجة الأخطاء
  const results = await Promise.allSettled([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).gte('completion_score', 80),
    supabase.from('approved_evaluators').select('id', { count: 'exact', head: true }),
    supabase.from('evaluations_360').select('id', { count: 'exact', head: true }),
    supabase.from('appeals').select('id', { count: 'exact', head: true }),
    supabase.from('competitions').select('id', { count: 'exact', head: true }),
    supabase.from('demo_data_flags').select('is_demo_active').maybeSingle(),
    supabase.from('audit_logs').select('id, operation_type, description, created_at, user_role, sensitivity').order('created_at', { ascending: false }).limit(10),
  ]);

  const getCount = (r: PromiseSettledResult<any>) =>
    r.status === 'fulfilled' ? (r.value?.count ?? 0) : 0;

  const getData = (r: PromiseSettledResult<any>) =>
    r.status === 'fulfilled' ? r.value?.data : null;

  const [usersR, candidatesR, completedR, evaluatorsR, evaluationsR, appealsR, competitionsR, demoR, logsR] = results;

  const demoActive = getData(demoR)?.is_demo_active ?? false;
  const logs: any[] = getData(logsR) ?? [];

  return (
    <div>
      <PageHeader
        title="لوحة النظام"
        description="نظرة شاملة على حالة منصة جدير — المستخدمون، الملفات، التقييمات، والمسابقات."
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="المستخدمون"           value={getCount(usersR)}       icon={Users}       variant="primary" />
        <StatCard label="المرشحون"             value={getCount(candidatesR)}  icon={FileText}    variant="gold" />
        <StatCard label="الملفات المكتملة"     value={getCount(completedR)}   icon={Activity}    variant="sage" />
        <StatCard label="المقيمون"             value={getCount(evaluatorsR)}  icon={Users}       variant="steelblue" />
        <StatCard label="التقييمات المكتملة"   value={getCount(evaluationsR)} icon={Activity}    variant="primary" />
        <StatCard label="التظلمات"             value={getCount(appealsR)}     icon={Bell}        variant="wine" />
        <StatCard label="المسابقات الوظيفية"   value={getCount(competitionsR)} icon={Trophy}     variant="gold" />
        <StatCard
          label="البيانات التجريبية"
          value={demoActive ? 'مفعّلة' : 'غير مفعّلة'}
          icon={Database}
          variant={demoActive ? 'gold' : 'sage'}
        />
      </div>

      <Card title="آخر النشاطات" subtitle="آخر العمليات في سجل التدقيق">
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id}
                className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg">
                <div className={`h-2 w-2 rounded-full shrink-0 ${
                  log.sensitivity === 'critical' ? 'bg-wine' :
                  log.sensitivity === 'sensitive' ? 'bg-gold-500' : 'bg-sage'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary-700 truncate">
                    {log.description || log.operation_type}
                  </div>
                  <div className="text-xs text-darkgray">
                    {log.user_role || 'النظام'} · {new Date(log.created_at).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-darkgray text-sm">
            لا توجد عمليات مسجلة بعد.
          </div>
        )}
      </Card>
    </div>
  );
}
