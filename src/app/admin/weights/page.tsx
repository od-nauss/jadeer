import { Sliders, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function AdminWeightsPage() {
  const supabase = createClient();

  // محاولة جلب الأوزان من الإعدادات
  const { data: settings } = await supabase
    .from('system_settings')
    .select('*')
    .eq('key', 'evaluation_weights')
    .maybeSingle();

  type WeightsValue = { axis: string; weight: number; name_ar: string }[];
  const weights: WeightsValue = (settings?.value as WeightsValue) || [
    { axis: 'leadership', name_ar: 'القيادة والتأثير', weight: 20 },
    { axis: 'strategic', name_ar: 'التفكير الاستراتيجي', weight: 15 },
    { axis: 'performance', name_ar: 'الأداء والإنجاز', weight: 15 },
    { axis: 'innovation', name_ar: 'الابتكار والمبادرات', weight: 15 },
    { axis: 'team', name_ar: 'رضا الفريق وأصحاب العلاقة', weight: 15 },
    { axis: 'tech_ai', name_ar: 'استخدام التقنية والذكاء الاصطناعي', weight: 10 },
    { axis: 'integrity', name_ar: 'النزاهة والالتزام المؤسسي', weight: 10 },
  ];

  const total = weights.reduce((sum, w) => sum + w.weight, 0);

  return (
    <div>
      <PageHeader
        title="أوزان التقييم"
        description="محاور التقييم السبعة بأوزانها الافتراضية. مجموع الأوزان يجب أن يساوي 100% دائماً."
        example="يمكنك تعديل الأوزان لكل وحدة تنظيمية على حدة. فمثلاً وحدة تشغيلية يمكن أن ترفع وزن 'الأداء والإنجاز' وتقلل 'التفكير الاستراتيجي'."
        icon={Sliders}
      />

      <Card>
        <div className="space-y-4">
          {weights.map((w) => (
            <div key={w.axis}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="font-medium text-primary-800">{w.name_ar}</span>
                  <span className="text-xs text-darkgray mr-2" dir="ltr">({w.axis})</span>
                </div>
                <span className="text-lg font-bold text-gold-700">{w.weight}%</span>
              </div>
              <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                  style={{ width: `${w.weight * 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gold-200 flex items-center justify-between">
          <div className="text-sm text-darkgray">المجموع الكلي</div>
          <div className="text-2xl font-bold text-primary-700">
            {total}%
            {total === 100 ? (
              <Badge variant="sage" className="mr-2">صحيح</Badge>
            ) : (
              <Badge variant="wine" className="mr-2">يجب أن يساوي 100%</Badge>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 institutional-card p-5 bg-gold-50 border-r-4 border-gold-400 flex items-start gap-3">
        <Info className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-darkgray leading-relaxed">
          <strong className="text-primary-700">ملاحظة:</strong> أي تعديل على الأوزان يحتاج إلى موافقة
          لجنة الحوكمة قبل التفعيل، ويُسجَّل في سجل التدقيق مع سبب التعديل واسم المعتمد. الأوزان
          الحالية هي الأوزان الافتراضية المؤسسية المعتمدة في الإطلاق الأول.
        </div>
      </div>
    </div>
  );
}
