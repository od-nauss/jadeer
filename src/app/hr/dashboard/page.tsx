import Link from 'next/link';
import { GraduationCap, Users, Trophy, Activity, Target, Bell, FileText, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function HRDashboard() {
  const supabase = createClient();
  const [candidates, completed, plans, competitions] = await Promise.all([
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).gte('completion_score', 80),
    supabase.from('development_plans').select('id', { count: 'exact', head: true }),
    supabase.from('competitions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  return (
    <div>
      <PageHeader
        title="لوحة الموارد البشرية"
        description="مركز عمل الموارد البشرية: متابعة المرشحين، إدارة المسابقات، خطط التطوير، تقارير الفجوات القيادية."
        example="ابدأ يومك بمتابعة المرشحين الذين توقفوا عن إكمال ملفاتهم، ثم خطط التطوير التي تحتاج مراجعة."
        icon={<GraduationCap className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="إجمالي المرشحين" value={candidates.count || 0} icon={<Users className="h-5 w-5" />} variant="primary" />
        <StatCard label="ملفات مكتملة" value={completed.count || 0} icon={<Activity className="h-5 w-5" />} variant="sage" />
        <StatCard label="خطط تطوير نشطة" value={plans.count || 0} icon={<Target className="h-5 w-5" />} variant="gold" />
        <StatCard label="مسابقات مفتوحة" value={competitions.count || 0} icon={<Trophy className="h-5 w-5" />} variant="steelblue" />
      </div>

      <Card title="أدوات سريعة">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/hr/candidates', label: 'إدارة المرشحين', icon: Users },
            { href: '/hr/completion-tracking', label: 'متابعة استكمال الملفات', icon: Activity },
            { href: '/hr/competitions', label: 'المسابقات الوظيفية', icon: Trophy },
            { href: '/hr/evaluation-tracks', label: 'مسارات التقييم', icon: FileText },
            { href: '/hr/development-plans', label: 'خطط التطوير', icon: Target },
            { href: '/hr/development-reports', label: 'تقارير التطوير', icon: FileText },
            { href: '/hr/notifications', label: 'الإشعارات', icon: Bell },
            { href: '/hr/notes', label: 'ملاحظات الموارد', icon: FileText },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 bg-white border border-gold-200 rounded-lg hover:bg-gold-50 hover:border-gold-400 transition"
            >
              <item.icon className="h-5 w-5 text-gold-700" />
              <span className="font-medium text-primary-700 flex-1 text-sm">{item.label}</span>
              <ArrowLeft className="h-4 w-4 text-gold-500" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
