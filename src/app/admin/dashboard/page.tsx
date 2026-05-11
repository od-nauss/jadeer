import {
  LayoutDashboard, Users, FileText, Activity,
  Database, Trophy, Bell, Shield, TrendingUp,
  CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient();

  const results = await Promise.allSettled([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).gte('completion_score', 80),
    supabase.from('approved_evaluators').select('id', { count: 'exact', head: true }),
    supabase.from('evaluations_360').select('id', { count: 'exact', head: true }),
    supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('competitions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('demo_data_flags').select('is_demo_active').maybeSingle(),
    supabase.from('audit_logs')
      .select('id, operation_type, description, created_at, user_role, sensitivity')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }),
  ]);

  const getCount = (r: PromiseSettledResult<any>) =>
    r.status === 'fulfilled' ? (r.value?.count ?? 0) : 0;
  const getData = (r: PromiseSettledResult<any>) =>
    r.status === 'fulfilled' ? r.value?.data : null;

  const [usersR, candidatesR, completedR, evaluatorsR, evaluationsR, appealsR, competitionsR, demoR, logsR, cardsR] = results;

  const demoActive = getData(demoR)?.is_demo_active ?? false;
  const logs: any[] = getData(logsR) ?? [];

  const stats = [
    { label: 'إجمالي المستخدمين',    value: getCount(usersR),       icon: <Users className="h-5 w-5" />,        variant: 'primary' as const },
    { label: 'ملفات المرشحين',        value: getCount(candidatesR),  icon: <FileText className="h-5 w-5" />,      variant: 'gold' as const },
    { label: 'ملفات مكتملة +80%',     value: getCount(completedR),   icon: <CheckCircle2 className="h-5 w-5" />,  variant: 'sage' as const },
    { label: 'مقيمون معتمدون',        value: getCount(evaluatorsR),  icon: <Shield className="h-5 w-5" />,        variant: 'steelblue' as const },
    { label: 'تقييمات 360 مكتملة',    value: getCount(evaluationsR), icon: <Activity className="h-5 w-5" />,      variant: 'primary' as const },
    { label: 'تظلمات جديدة',          value: getCount(appealsR),     icon: <AlertTriangle className="h-5 w-5" />, variant: 'wine' as const },
    { label: 'مسابقات مفتوحة',        value: getCount(competitionsR), icon: <Trophy className="h-5 w-5" />,       variant: 'gold' as const },
    { label: 'بطاقات قيادية معتمدة',  value: getCount(cardsR),       icon: <TrendingUp className="h-5 w-5" />,   variant: 'sage' as const },
  ];

  return (
    <div>
      <PageHeader
        title="لوحة النظام"
        description="نظرة شاملة على صحة منصة جدير — المستخدمون، الملفات، التقييمات، والبطاقات القيادية."
        icon={<LayoutDashboard className="h-5 w-5" />}
      />

      {demoActive && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-800">
          <Database className="h-4 w-4 shrink-0" />
          <span>البيانات التجريبية مفعّلة — البيانات الظاهرة تشمل نماذج اختبارية.</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} variant={s.variant} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="آخر العمليات" subtitle="سجل التدقيق المباشر">
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg">
                  <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                    log.sensitivity === 'critical' ? 'bg-wine' :
                    log.sensitivity === 'sensitive' ? 'bg-gold-500' : 'bg-sage'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary-700 truncate">
                      {log.description || log.operation_type}
                    </div>
                    <div className="text-xs text-darkgray flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {log.user_role || 'النظام'} · {new Date(log.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-darkgray text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gold-300" />
              لا توجد عمليات مسجلة بعد.
            </div>
          )}
        </Card>

        <Card title="الروابط السريعة" subtitle="الوصول المباشر لأهم الأقسام">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'إدارة المستخدمين',  href: '/admin/users',        icon: '👥' },
              { label: 'الهيكل التنظيمي',   href: '/admin/organization', icon: '🏢' },
              { label: 'الأوزان والمحاور',   href: '/admin/weights',      icon: '⚖️' },
              { label: 'سجل التدقيق',       href: '/admin/audit-logs',   icon: '📋' },
              { label: 'البيانات التجريبية', href: '/admin/demo-data',    icon: '🧪' },
              { label: 'إعدادات المنصة',    href: '/admin/settings',     icon: '⚙️' },
            ].map((link) => (
              <a key={link.href} href={link.href}
                className="flex items-center gap-2 p-3 rounded-xl border border-gold-200 hover:bg-gold-50 hover:border-gold-300 transition-all text-sm text-primary-700 font-medium">
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
