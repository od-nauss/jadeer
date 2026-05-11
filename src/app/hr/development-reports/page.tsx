import { FileText, BarChart3 } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default function HRDevelopmentReportsPage() {
  return (
    <div>
      <PageHeader
        title="تقارير التطوير"
        description="تقارير شاملة عن نشاطات التطوير في المنظمة: الفجوات الأكثر تكراراً، البرامج الأكثر طلباً، أثر التطوير."
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid md:grid-cols-2 gap-3">
        {[
          { title: 'تقرير الفجوات الأكثر تكراراً', desc: 'المهارات التي تظهر كنقطة ضعف لدى أغلب المرشحين' },
          { title: 'تقرير البرامج التطويرية', desc: 'البرامج الأكثر اقتراحاً من المنصة' },
          { title: 'تقرير حالة الخطط النشطة', desc: 'نسبة الإنجاز والالتزام بالمواعيد' },
          { title: 'تقرير التطوير حسب الإدارة', desc: 'توزيع احتياجات التطوير على الإدارات' },
          { title: 'تقرير أثر التطوير', desc: 'مقارنة بين تقييم قبل وبعد التطوير' },
          { title: 'تقرير الميزانية التدريبية', desc: 'توقعات احتياج البرامج بناءً على الفجوات' },
        ].map((r, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-gold-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-primary-700 text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-darkgray">{r.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
