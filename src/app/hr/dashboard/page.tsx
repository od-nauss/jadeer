import Link from 'next/link';
import { GraduationCap, Users, Activity, Target, Bell, FileText, ArrowLeft, Trophy, Brain, AlertTriangle, Route, TrendingUp, Star } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function HRDashboard() {
  const supabase = createServiceClient();
  const currentUser = await getCurrentUser();

  const [
    { count: totalCandidates },
    { count: newFiles },
    { count: inProgress },
    { count: completed },
    { count: returned },
    { count: approvedCandidates },
    { count: activePlans },
    { count: delayedPlans },
    { count: openCompetitions },
    { count: readyYear },
    { count: promising },
  ] = await Promise.all([
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).gte('completion_score', 80),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('status', 'returned_for_completion'),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('development_plans').select('id', { count: 'exact', head: true }).in('overall_status', ['approved', 'in_progress']),
    supabase.from('development_plans').select('id', { count: 'exact', head: true }).eq('overall_status', 'delayed'),
    supabase.from('competitions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'ready_within_year').eq('is_published', true),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'promising').eq('is_published', true),
  ]);

  // التحليل الذكي
  const { data: incompleteFiles } = await supabase
    .from('candidate_profiles')
    .select('id')
    .lt('completion_score', 60)
    .in('status', ['new', 'in_progress']);
  const { data: stalePlans } = await supabase
    .from('development_plans')
    .select('id')
    .eq('overall_status', 'proposed');

  const aiAlerts: Array<{ type: 'warning' | 'info' | 'error'; text: string; href: string }> = [];
  if ((incompleteFiles?.length || 0) > 3) aiAlerts.push({ type: 'error', text: `${incompleteFiles?.length} ملف اكتماله أقل من 60٪ — يحتاج متابعة.`, href: '/hr/completion-tracking' });
  if ((readyYear || 0) > 0) aiAlerts.push({ type: 'info', text: `${readyYear} مرشح جاهز خلال سنة — يحتاج خطة تطوير مركزة.`, href: '/hr/development-plans' });
  if ((promising || 0) > 0) aiAlerts.push({ type: 'info', text: `${promising} مرشح واعد — تحقق من خطط التطوير.`, href: '/hr/development-plans' });
  if ((stalePlans?.length || 0) > 0) aiAlerts.push({ type: 'warning', text: `${stalePlans?.length} خطة تطوير مقترحة لم تُراجع بعد.`, href: '/hr/development-plans' });
  if ((delayedPlans || 0) > 0) aiAlerts.push({ type: 'error', text: `${delayedPlans} خطة تطوير متأخرة — يحتاج إجراء.`, href: '/hr/development-plans' });
  if ((returned || 0) > 0) aiAlerts.push({ type: 'warning', text: `${returned} ملف معاد للاستكمال — تواصل مع المرشح.`, href: '/hr/completion-tracking' });

  const stats = [
    { label: 'إجمالي المتقدمين', value: totalCandidates || 0, icon: <Users className="h-5 w-5" />, variant: 'primary' as const },
    { label: 'ملفات جديدة', value: newFiles || 0, icon: <FileText className="h-5 w-5" />, variant: 'gold' as const },
    { label: 'قيد الاستكمال', value: inProgress || 0, icon: <Activity className="h-5 w-5" />, variant: 'gold' as const },
    { label: 'ملفات مكتملة +80%', value: completed || 0, icon: <Activity className="h-5 w-5" />, variant: 'sage' as const },
    { label: 'معتمدون من اللجنة', value: approvedCandidates || 0, icon: <GraduationCap className="h-5 w-5" />, variant: 'sage' as const },
    { label: 'خطط تطوير نشطة', value: activePlans || 0, icon: <Target className="h-5 w-5" />, variant: 'primary' as const },
    { label: 'خطط متأخرة', value: delayedPlans || 0, icon: <AlertTriangle className="h-5 w-5" />, variant: 'wine' as const },
    { label: 'مسابقات مفتوحة', value: openCompetitions || 0, icon: <Trophy className="h-5 w-5" />, variant: 'gold' as const },
  ];

  const isAlreadyCandidate = currentUser?.roles.includes('candidate');

  return (
    <div dir="rtl">
      {/* Candidacy request banner — shown when not already a candidate */}
      {!isAlreadyCandidate && (
        <Link
          href="/portal/request-candidacy"
          className="flex items-center justify-between gap-4 mb-5 p-4 bg-gold-50 border border-gold-200 rounded-xl hover:bg-gold-100 transition group"
        >
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-gold-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-primary-700">هل تودّ التقدم كمرشح قيادي؟</div>
              <div className="text-xs text-darkgray mt-0.5">يمكنك الاحتفاظ بدورك الحالي وإضافة دور المرشح القيادي</div>
            </div>
          </div>
          <ArrowLeft className="h-4 w-4 text-gold-600 group-hover:translate-x-[-3px] transition-transform" />
        </Link>
      )}

      <PageHeader
        title="لوحة الموارد البشرية"
        description="مركز متابعة المرشحين، خطط التطوير، المسابقات الوظيفية، ومسارات التقييم. تحويل نتائج جدير لخطط تطوير قابلة للمتابعة."
        example="ابدأ يومك بمتابعة الملفات غير المكتملة، ثم مراجعة خطط التطوير المقترحة، ثم إشعارات المسابقات."
        icon={<GraduationCap className="h-5 w-5" />}
      />

      {/* التنبيهات الذكية */}
      {aiAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-primary-700 mb-2">
            <Brain className="h-4 w-4 text-gold-600" />تنبيهات تشغيلية ذكية
          </div>
          {aiAlerts.map((alert, i) => (
            <Link key={i} href={alert.href}
              className={`flex items-start gap-3 p-3 rounded-xl border text-sm hover:opacity-80 transition ${
                alert.type === 'error' ? 'bg-rose-50 border-rose-200 text-wine' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-blue-50 border-blue-200 text-steelblue'
              }`}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{alert.text}</span>
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* المؤشرات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} variant={s.variant} />
        ))}
      </div>

      {/* الأدوات السريعة */}
      <Card title="أدوات سريعة">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { href: '/hr/candidates', label: 'قائمة المتقدمين', icon: '👥' },
            { href: '/hr/completion-tracking', label: 'متابعة اكتمال الملفات', icon: '📊' },
            { href: '/hr/competitions', label: 'المسابقات الوظيفية', icon: '🏆' },
            { href: '/hr/competitions/create', label: 'إنشاء مسابقة جديدة', icon: '➕' },
            { href: '/hr/development-plans', label: 'خطط التطوير', icon: '🎯' },
            { href: '/hr/evaluation-tracks', label: 'مسارات التقييم', icon: '📋' },
            { href: '/hr/leadership-needs', label: 'تحليل احتياجات القيادة', icon: '🔍' },
            { href: '/hr/notes', label: 'ملاحظات الموارد البشرية', icon: '📝' },
            { href: '/hr/development-reports', label: 'تقارير التطوير', icon: '📈' },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 p-3 rounded-xl border border-gold-200 hover:bg-gold-50 hover:border-gold-300 transition-all text-sm text-primary-700 font-medium">
              <span className="text-lg">{icon}</span>{label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
