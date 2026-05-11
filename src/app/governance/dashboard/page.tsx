import Link from 'next/link';
import { ShieldCheck, FileSearch, Users, Link2, Bell, Award, AlertTriangle, ArrowLeft, ScrollText, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function GovernanceDashboard() {
  const supabase = createClient();
  const [pendingReviews, pendingEvaluators, openLinks, completedEvaluations, pendingAppeals, decisions] = await Promise.all([
    supabase.from('governance_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('evaluator_nominees').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('evaluation_links').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('evaluations_360').select('id', { count: 'exact', head: true }),
    supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('governance_decisions').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <div>
      <PageHeader
        title="لوحة لجنة الحوكمة"
        description="مركز عمل اللجنة. من هنا تراجع الملفات، تعتمد المقيمين، تصدر القرارات، تعالج التظلمات. كل قرار يُسجَّل."
        example="ابدأ يومك بمراجعة 'الملفات بانتظار المراجعة'، ثم 'اعتماد المقيمين'، ثم 'التظلمات المفتوحة'."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard label="ملفات بانتظار المراجعة" value={pendingReviews.count || 0} icon={<FileSearch className="h-5 w-5" />} variant="gold" />
        <StatCard label="مقيمون بانتظار الاعتماد" value={pendingEvaluators.count || 0} icon={<Users className="h-5 w-5" />} variant="primary" />
        <StatCard label="روابط 360 نشطة" value={openLinks.count || 0} icon={<Link2 className="h-5 w-5" />} variant="steelblue" />
        <StatCard label="تقييمات مكتملة" value={completedEvaluations.count || 0} icon={<Award className="h-5 w-5" />} variant="sage" />
        <StatCard label="تظلمات مفتوحة" value={pendingAppeals.count || 0} icon={<AlertTriangle className="h-5 w-5" />} variant="wine" />
        <StatCard label="قرارات صادرة" value={decisions.count || 0} icon={<ScrollText className="h-5 w-5" />} variant="primary" />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {[
          { href: '/governance/reviews', label: 'الملفات بانتظار المراجعة', icon: FileSearch, urgent: pendingReviews.count || 0 },
          { href: '/governance/evaluators', label: 'اعتماد المقيمين', icon: Users, urgent: pendingEvaluators.count || 0 },
          { href: '/governance/360', label: 'متابعة تقييم 360', icon: Eye, urgent: 0 },
          { href: '/governance/results', label: 'اعتماد النتائج النهائية', icon: Award, urgent: 0 },
          { href: '/governance/appeals', label: 'التظلمات', icon: Bell, urgent: pendingAppeals.count || 0 },
          { href: '/governance/conflicts', label: 'مراجعة التحيز وتضارب المصالح', icon: AlertTriangle, urgent: 0 },
          { href: '/governance/audit', label: 'سجل قرارات اللجنة', icon: ScrollText, urgent: 0 },
          { href: '/governance/evaluation-links', label: 'روابط تقييم 360', icon: Link2, urgent: 0 },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-4 bg-white border border-gold-200 rounded-lg hover:bg-gold-50 hover:border-gold-400 transition"
          >
            <div className="h-11 w-11 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
              <item.icon className="h-5 w-5 text-gold-700" />
            </div>
            <span className="font-medium text-primary-700 flex-1">{item.label}</span>
            {item.urgent > 0 && (
              <span className="bg-wine text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.urgent}
              </span>
            )}
            <ArrowLeft className="h-4 w-4 text-gold-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
