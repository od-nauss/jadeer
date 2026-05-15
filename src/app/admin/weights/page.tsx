import { Sliders } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui';
import { WeightsClient } from './WeightsClient';

export const dynamic = 'force-dynamic';

const DEFAULT_WEIGHTS = [
  { axis: 'leadership',  name_ar: 'القيادة والتأثير المؤسسي',         weight: 20 },
  { axis: 'strategic',   name_ar: 'التفكير الاستراتيجي',              weight: 15 },
  { axis: 'performance', name_ar: 'الأداء والإنجاز',                  weight: 15 },
  { axis: 'innovation',  name_ar: 'الابتكار والمبادرات',              weight: 15 },
  { axis: 'team',        name_ar: 'رضا الفريق وأصحاب العلاقة',       weight: 15 },
  { axis: 'tech_ai',     name_ar: 'استخدام التقنية والذكاء الاصطناعي', weight: 10 },
  { axis: 'integrity',   name_ar: 'النزاهة والالتزام المؤسسي',        weight: 10 },
];

export default async function AdminWeightsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from('system_settings')
    .select('*')
    .eq('key', 'evaluation_weights')
    .maybeSingle();

  type WeightsValue = { axis: string; weight: number; name_ar: string }[];
  const weights: WeightsValue = (settings?.value as WeightsValue) || DEFAULT_WEIGHTS;

  return (
    <div dir="rtl">
      <PageHeader
        title="أوزان التقييم"
        description="تعديل أوزان محاور التقييم السبعة. مجموع الأوزان يجب أن يساوي 100% دائماً. كل تعديل يُسجَّل في سجل التدقيق."
        icon={<Sliders className="h-5 w-5" />}
      />
      <WeightsClient initialWeights={weights} />
    </div>
  );
}
