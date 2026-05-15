import { FileText, BarChart3, PieChart, TrendingUp, Users, Eye } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, StatCard } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function ExecutiveReportsPage() {
  const supabase = createServiceClient();
  const { data: cards } = await supabase
    .from('leadership_cards')
    .select('readiness_level, leadership_type, total_score, trust_score');

  const allCards = cards || [];

  // إحصائيات مجمعة
  const distribution = {
    ready_now: 0,
    ready_within_year: 0,
    promising: 0,
    specialist: 0,
    not_suitable: 0,
    high_performance_low_satisfaction: 0,
    human_leader: 0,
  };
  for (const c of allCards) {
    const key = c.readiness_level as keyof typeof distribution;
    if (key in distribution) distribution[key]++;
  }

  const avgScore = allCards.length
    ? Math.round(allCards.reduce((sum, c) => sum + Number(c.total_score), 0) / allCards.length)
    : 0;
  const avgTrust = allCards.length
    ? Math.round(allCards.reduce((sum, c) => sum + Number(c.trust_score), 0) / allCards.length)
    : 0;
  const hiddenLeaders = allCards.filter((c) => c.leadership_type === 'hidden').length;

  const reports = [
    { title: 'تقرير الجاهزية القيادية الشامل', icon: FileText, desc: 'كافة المرشحين بتصنيفهم وملاءمتهم' },
    { title: 'تقرير الكفاءات الجاهزة الآن', icon: TrendingUp, desc: 'المرشحون 85%+ المعتمدون للتكليف' },
    { title: 'تقرير القيادات المخفية', icon: Eye, desc: 'الكفاءات التي لم تكن ظاهرة في القيادة' },
    { title: 'تقرير الفجوات القيادية', icon: BarChart3, desc: 'وحدات تنظيمية بدون بدائل قيادية' },
    { title: 'تقرير توزيع التصنيفات', icon: PieChart, desc: 'النسب والإحصائيات' },
    { title: 'تقرير الصف الثاني والثالث', icon: Users, desc: 'خريطة التعاقب الوظيفي' },
  ];

  return (
    <div>
      <PageHeader
        title="التقارير القيادية"
        description="تقارير تنفيذية مختصرة جاهزة للعرض على مجلس الإدارة. كل تقرير قابل للتصدير PDF."
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="إجمالي البطاقات" value={allCards.length} icon={<Users className="h-5 w-5" />} variant="primary" />
        <StatCard label="متوسط الجاهزية" value={`${avgScore}%`} icon={<TrendingUp className="h-5 w-5" />} variant="gold" />
        <StatCard label="متوسط الثقة" value={`${avgTrust}%`} icon={<BarChart3 className="h-5 w-5" />} variant="sage" />
        <StatCard label="قيادات مخفية" value={hiddenLeaders} icon={<Eye className="h-5 w-5" />} variant="primary" />
      </div>

      <Card title="توزيع التصنيفات" subtitle="نسبة كل تصنيف من إجمالي البطاقات المعتمدة">
        <div className="space-y-3">
          {Object.entries(distribution).map(([key, count]) => {
            const percent = allCards.length ? Math.round((count / allCards.length) * 100) : 0;
            const labels: Record<string, string> = {
              ready_now: 'جاهز الآن',
              ready_within_year: 'جاهز خلال سنة',
              promising: 'واعد',
              specialist: 'متخصص يحتاج تجربة قيادية',
              not_suitable: 'لا يناسب القيادة المباشرة حالياً',
              high_performance_low_satisfaction: 'إنجاز عالٍ / رضا منخفض',
              human_leader: 'قائد إنساني',
            };
            const colors: Record<string, string> = {
              ready_now: 'bg-sage',
              ready_within_year: 'bg-gold-500',
              promising: 'bg-steelblue',
              specialist: 'bg-primary-500',
              not_suitable: 'bg-wine',
              high_performance_low_satisfaction: 'bg-umber',
              human_leader: 'bg-purple-500',
            };
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-darkgray">{labels[key]}</span>
                  <span className="font-bold text-primary-700">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="h-2.5 bg-gold-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[key]}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-primary-700 mb-3">تقارير قابلة للتصدير</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map((r, i) => (
            <Card key={i}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <r.icon className="h-5 w-5 text-gold-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-primary-700 text-sm mb-1">{r.title}</h4>
                  <p className="text-xs text-darkgray">{r.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
