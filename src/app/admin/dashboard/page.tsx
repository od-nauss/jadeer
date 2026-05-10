import { LayoutDashboard, Users, FileText, Activity, ScrollText, Database, Trophy, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';

export default async function AdminDashboard() {
  const supabase = createClient();

  // جمع المؤشرات
  const [usersCount, candidatesCount, completedProfiles, evaluators, evaluations, appeals, competitions, demoFlag] =
    await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).gte('completion_score', 80),
      supabase.from('approved_evaluators').select('id', { count: 'exact', head: true }),
      supabase.from('evaluations_360').select('id', { count: 'exact', head: true }),
      supabase.from('appeals').select('id', { count: 'exact', head: true }),
      supabase.from('competitions').select('id', { count: 'exact', head: true }),
      supabase.from('demo_data_flags').select('is_demo_active, total_demo_records').single(),
    ]);

  const recentLogs = await supabase
    .from('audit_logs')
    .select('id, operation_type, description, created_at, user_role, sensitivity')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div>
      <PageHeader
        title="لوحة النظام"
        description="نظرة شاملة على حالة منصة جدير: عدد المستخدمين، الملفات، التقييمات، والمسابقات. تستطيع من هنا الوصول السريع إلى كل أقسام الإدارة."
        example="إذا أردت رؤية حالة البيانات التجريبية، توجه إلى قسم 'إدارة البيانات التجريبية' من السايدبار."
        icon={LayoutDashboard}
      />

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="المستخدمون" value={usersCount.count || 0} icon={Users} variant="primary" />
        <StatCard label="المرشحون" value={candidatesCount.count || 0} icon={FileText} variant="gold" />
        <StatCard label="الملفات المكتملة" value={completedProfiles.count || 0} icon={Activity} variant="sage" />
        <StatCard label="المقيمون" value={evaluators.count || 0} icon={Users} variant="steelblue" />
        <StatCard label="التقييمات المكتملة" value={evaluations.count || 0} icon={Activity} variant="primary" />
        <StatCard label="التظلمات" value={appeals.count || 0} icon={Bell} variant="wine" />
        <StatCard label="المسابقات الوظيفية" value={competitions.count || 0} icon={Trophy} variant="gold" />
        <StatCard
          label="حالة البيانات التجريبية"
          value={demoFlag.data?.is_demo_active ? 'مفعّلة' : 'مُحذوفة'}
          icon={Database}
          variant={demoFlag.data?.is_demo_active ? 'gold' : 'sage'}
        />
      </div>

      {/* النشاطات الأخيرة */}
      <Card title="آخر النشاطات في سجل التدقيق" subtitle="آخر العمليات الحساسة">
        {recentLogs.data && recentLogs.data.length > 0 ? (
          <div className="space-y-2">
            {recentLogs.data.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg"
              >
                <div className={`h-2 w-2 rounded-full ${
                  log.sensitivity === 'critical' ? 'bg-wine' :
                  log.sensitivity === 'sensitive' ? 'bg-gold-500' : 'bg-sage'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary-700">
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
            لا توجد عمليات مسجلة بعد. ستظهر هنا أول عملية حساسة.
          </div>
        )}
      </Card>
    </div>
  );
}
