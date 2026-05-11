import Link from 'next/link';
import { ShieldCheck, FileSearch, Users, Link2, Bell, Award, AlertTriangle, ArrowLeft, ScrollText, Eye, Brain, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function GovernanceDashboard() {
  const supabase = createClient();

  const [
    { count: pendingReviews },
    { count: pendingEvaluators },
    { count: openLinks },
    { count: completedEvals },
    { count: pendingAppeals },
    { count: decisions },
    { count: approvedCards },
    { count: returnedFiles },
    { data: recentDecisions },
    { data: extremeEvals },
    { data: appeals },
  ] = await Promise.all([
    supabase.from('governance_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('evaluator_nominees').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('evaluation_links').select('id', { count: 'exact', head: true }).eq('status', 'ready'),
    supabase.from('evaluations_360').select('id', { count: 'exact', head: true }),
    supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('governance_decisions').select('id', { count: 'exact', head: true }),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('status', 'returned_for_completion'),
    supabase.from('governance_decisions').select('*, candidate_profiles(users(full_name))').order('decided_at', { ascending: false }).limit(5),
    supabase.from('evaluations_360').select('id, approved_evaluator_id, overall_score, candidate_profile_id').eq('is_extreme', true).limit(5),
    supabase.from('appeals').select('id, appeal_type, created_at, candidate_profiles(users(full_name))').eq('status', 'new').limit(3),
  ]);

  // ملفات انتظار 360
  const { count: waiting360 } = await supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('status', 'awaiting_360');
  // ملفات جاهزة للمراجعة النهائية
  const { count: readyForReview } = await supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).in('status', ['under_governance_review', 'awaiting_evaluators']);

  const stats = [
    { label: 'ملفات بانتظار مراجعة', value: readyForReview || 0, icon: <FileSearch className="h-5 w-5" />, variant: 'gold' as const, href: '/governance/reviews' },
    { label: 'مقيمون بانتظار الاعتماد', value: pendingEvaluators || 0, icon: <Users className="h-5 w-5" />, variant: 'primary' as const, href: '/governance/evaluators' },
    { label: 'ملفات بانتظار 360', value: waiting360 || 0, icon: <Eye className="h-5 w-5" />, variant: 'steelblue' as const, href: '/governance/360' },
    { label: 'تقييمات 360 مكتملة', value: completedEvals || 0, icon: <Award className="h-5 w-5" />, variant: 'sage' as const, href: '/governance/360' },
    { label: 'تظلمات جديدة', value: pendingAppeals || 0, icon: <AlertTriangle className="h-5 w-5" />, variant: 'wine' as const, href: '/governance/appeals' },
    { label: 'بطاقات معتمدة', value: approvedCards || 0, icon: <Award className="h-5 w-5" />, variant: 'sage' as const, href: '/governance/results' },
    { label: 'ملفات معادة للاستكمال', value: returnedFiles || 0, icon: <AlertTriangle className="h-5 w-5" />, variant: 'wine' as const, href: '/governance/reviews' },
    { label: 'قرارات صادرة', value: decisions || 0, icon: <ScrollText className="h-5 w-5" />, variant: 'primary' as const, href: '/governance/decisions' },
  ];

  const aiAlerts: Array<{ type: 'warning' | 'info' | 'error'; text: string; href: string }> = [];
  if ((pendingAppeals || 0) > 0) aiAlerts.push({ type: 'error', text: `${pendingAppeals} تظلم جديد يحتاج مراجعة عاجلة.`, href: '/governance/appeals' });
  if ((extremeEvals?.length || 0) > 0) aiAlerts.push({ type: 'warning', text: `رُصد ${extremeEvals?.length} تقييم متطرف في دائرة 360 — يستحق مراجعة.`, href: '/governance/360' });
  if ((returnedFiles || 0) > 0) aiAlerts.push({ type: 'info', text: `${returnedFiles} ملف معاد للاستكمال — انتظار رد المرشح.`, href: '/governance/reviews' });
  if ((readyForReview || 0) >= 3) aiAlerts.push({ type: 'warning', text: `${readyForReview} ملف ينتظر مراجعة اللجنة.`, href: '/governance/reviews' });
  if ((waiting360 || 0) > 0) aiAlerts.push({ type: 'info', text: `${waiting360} مرشح بانتظار اكتمال تقييم 360.`, href: '/governance/360' });

  return (
    <div dir="rtl">
      <PageHeader
        title="لوحة لجنة الحوكمة"
        description="مركز عمل اللجنة. من هنا تراجع الملفات، تعتمد المقيمين، تصدر القرارات، وتعالج التظلمات. كل قرار يُسجَّل."
        example="ابدأ يومك بمراجعة 'الملفات بانتظار المراجعة'، ثم 'اعتماد المقيمين'، ثم 'التظلمات الجديدة'."
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      {/* تنبيهات الذكاء الاصطناعي */}
      {aiAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-primary-700 mb-2">
            <Brain className="h-4 w-4 text-gold-600" />
            تنبيهات الذكاء الاصطناعي
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
          <Link key={s.label} href={s.href} className="block hover:scale-[1.02] transition-transform">
            <StatCard label={s.label} value={s.value} icon={s.icon} variant={s.variant} />
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* أحدث القرارات */}
        <Card title="أحدث قرارات اللجنة">
          {recentDecisions && recentDecisions.length > 0 ? (
            <div className="space-y-2">
              {recentDecisions.map((d: any) => (
                <div key={d.id} className="p-3 bg-gold-50 border border-gold-100 rounded-lg text-sm">
                  <div className="font-medium text-primary-700">{d.candidate_profiles?.users?.full_name}</div>
                  <div className="text-xs text-darkgray mt-0.5">{d.decision_type} · {new Date(d.decided_at).toLocaleDateString('ar-SA')}</div>
                  {d.reason && <div className="text-xs text-darkgray mt-0.5 line-clamp-1">{d.reason}</div>}
                </div>
              ))}
              <Link href="/governance/decisions" className="text-xs text-primary-700 hover:underline flex items-center gap-1 mt-2">
                عرض كل القرارات <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 text-darkgray text-sm">لا توجد قرارات بعد.</div>
          )}
        </Card>

        {/* الوصول السريع */}
        <Card title="الوصول السريع">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'مراجعة الملفات', href: '/governance/reviews', icon: '📋' },
              { label: 'اعتماد المقيمين', href: '/governance/evaluators', icon: '✅' },
              { label: 'روابط التقييم', href: '/governance/evaluation-links', icon: '🔗' },
              { label: 'متابعة 360', href: '/governance/360', icon: '👥' },
              { label: 'نتائج واعتماد', href: '/governance/results', icon: '🏆' },
              { label: 'التظلمات', href: '/governance/appeals', icon: '📣' },
              { label: 'قرارات اللجنة', href: '/governance/decisions', icon: '📊' },
              { label: 'سجل الحوكمة', href: '/governance/audit', icon: '📜' },
            ].map(({ label, href, icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 p-3 rounded-xl border border-gold-200 hover:bg-gold-50 hover:border-gold-300 transition-all text-sm text-primary-700 font-medium">
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
