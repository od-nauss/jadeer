import Link from 'next/link';
import { LayoutDashboard, TrendingUp, Award, AlertTriangle, Eye, Bell, ArrowLeft, Users, FileText, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export default async function ExecutiveDashboard() {
  const supabase = createClient();

  // المؤشرات الرئيسية
  const [readyNow, withinYear, promising, hidden, lowSatisfaction, totalCandidates] = await Promise.all([
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'ready_now'),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'ready_within_year'),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'promising'),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('leadership_type', 'hidden'),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'high_performance_low_satisfaction'),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
  ]);

  // أبرز المرشحين الجاهزين
  const { data: topCandidates } = await supabase
    .from('leadership_cards')
    .select('id, total_score, trust_score, readiness_level, leadership_type, candidate_profiles(user_id, users(full_name, job_title, department))')
    .order('total_score', { ascending: false })
    .limit(6);

  // الإشعارات الحرجة الأخيرة
  const { data: alerts } = await supabase
    .from('notifications')
    .select('id, title, body, priority, created_at')
    .eq('target_role', 'president')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div>
      <PageHeader
        title="لوحة القيادة العليا"
        description="نظرة شاملة على جاهزية الكفاءات في المنظمة. هذه اللوحة تساعدك على رؤية الكفاءات الجاهزة، الواعدة، والمخفية بنظرة واحدة."
        example="انقر على 'بطاقات المرشحين' لرؤية البطاقات الكاملة المعتمدة من لجنة الحوكمة."
        icon={LayoutDashboard}
      />

      {/* المؤشرات */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard label="جاهز الآن" value={readyNow.count || 0} icon={Award} variant="sage" />
        <StatCard label="جاهز خلال سنة" value={withinYear.count || 0} icon={TrendingUp} variant="gold" />
        <StatCard label="واعد" value={promising.count || 0} icon={TrendingUp} variant="steelblue" />
        <StatCard label="قيادة مخفية" value={hidden.count || 0} icon={Eye} variant="primary" />
        <StatCard label="إنجاز عالٍ / رضا منخفض" value={lowSatisfaction.count || 0} icon={AlertTriangle} variant="wine" />
        <StatCard label="إجمالي المرشحين" value={totalCandidates.count || 0} icon={Users} variant="primary" />
      </div>

      {/* أبرز المرشحين */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <Card title="أبرز المرشحين الجاهزين" subtitle="أعلى الدرجات بحسب اعتماد لجنة الحوكمة">
            {topCandidates && topCandidates.length > 0 ? (
              <div className="space-y-2">
                {topCandidates.map((card) => {
                  type CardWithUser = {
                    candidate_profiles: {
                      user_id: string;
                      users: { full_name: string; job_title?: string; department?: string };
                    };
                  };
                  const cwu = card as unknown as CardWithUser;
                  const user = cwu.candidate_profiles?.users;
                  if (!user) return null;
                  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
                  return (
                    <Link
                      key={card.id}
                      href={`/executive/cards/${card.id}`}
                      className="flex items-center gap-3 p-3 bg-gold-50 hover:bg-gold-100 border border-gold-200 rounded-lg transition"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold">
                        {user.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary-700 truncate">{user.full_name}</div>
                        <div className="text-xs text-darkgray truncate">
                          {user.job_title} {user.department && `· ${user.department}`}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-gold-700">{Number(card.total_score).toFixed(0)}%</div>
                        <div className={`text-xs px-2 py-0.5 rounded inline-block ${level?.bg || 'bg-gray-100'} ${level?.color || 'text-gray-700'}`}>
                          {level?.label_ar || card.readiness_level}
                        </div>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-gold-600 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-darkgray text-sm">
                لا توجد بطاقات قيادية معتمدة بعد. ستظهر البطاقات هنا فور اعتماد لجنة الحوكمة.
              </div>
            )}
            <Link
              href="/executive/cards"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-800 font-medium"
            >
              عرض جميع البطاقات <ArrowLeft className="h-3 w-3" />
            </Link>
          </Card>
        </div>

        <Card title="إشعارات قيادية" subtitle="أحدث ما يحتاج نظركم">
          {alerts && alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="p-3 border-r-4 border-gold-400 bg-gold-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Bell className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary-700">{a.title}</div>
                      {a.body && <div className="text-xs text-darkgray mt-0.5">{a.body}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-darkgray text-sm">لا توجد إشعارات حالياً.</div>
          )}
        </Card>
      </div>

      {/* اختصارات */}
      <Card title="وصول سريع">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { href: '/executive/candidates', label: 'المرشحون', icon: Users },
            { href: '/executive/reports', label: 'التقارير القيادية', icon: FileText },
            { href: '/executive/competitions', label: 'المسابقات الوظيفية', icon: Trophy },
            { href: '/executive/recommendations', label: 'توصيات النظام', icon: TrendingUp },
            { href: '/organization/map', label: 'خريطة الكفاءات', icon: Eye },
            { href: '/organization/succession', label: 'خريطة التعاقب', icon: Users },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 bg-white border border-gold-200 rounded-lg hover:bg-gold-50 hover:border-gold-400 transition"
            >
              <div className="h-9 w-9 rounded-lg bg-gold-100 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-gold-700" />
              </div>
              <span className="font-medium text-primary-700 text-sm flex-1">{item.label}</span>
              <ArrowLeft className="h-4 w-4 text-gold-500" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
