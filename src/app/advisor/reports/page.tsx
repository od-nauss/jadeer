import { ScrollText } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default function AdvisorReportsPage() {
  return (
    <div>
      <PageHeader
        title="التقارير"
        description="تقارير قيادية مختصرة جاهزة للاطلاع. يمكنك تحميل أي تقرير PDF."
        icon={ScrollText}
      />

      <div className="grid md:grid-cols-2 gap-3">
        {[
          'تقرير الجاهزية القيادية الشامل',
          'تقرير الكفاءات الجاهزة الآن',
          'تقرير القيادات المخفية',
          'تقرير توزيع التصنيفات',
          'تقرير الفجوات القيادية في الوحدات',
          'تقرير خريطة التعاقب الوظيفي',
        ].map((title, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-gold-700" />
              </div>
              <h3 className="font-bold text-primary-700">{title}</h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
