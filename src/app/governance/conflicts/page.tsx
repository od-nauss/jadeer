import { AlertTriangle } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default function GovernanceConflictsPage() {
  return (
    <div>
      <PageHeader
        title="مراجعة التحيز وتضارب المصالح"
        description="عرض الحالات المرشَّحة من المنصة لمراجعة التحيز أو احتمال تضارب المصالح."
        example="مثلاً: مقيم أعطى درجة شاذة جداً مقارنة بالباقي، أو علاقة قرابة محتملة بين المقيم والمرشح."
        icon={AlertTriangle}
      />

      <Card title="مؤشرات التحيز التلقائية" subtitle="ما يكشفه النظام تلقائياً">
        <ul className="space-y-2 text-sm text-darkgray leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span><strong className="text-primary-700">تقييم متطرف:</strong> درجة مقيم تختلف بأكثر من 30% عن متوسط بقية المقيمين</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span><strong className="text-primary-700">ضعف تنوع المقيمين:</strong> غلبة فئة واحدة (مثلاً كلهم زملاء)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span><strong className="text-primary-700">تضارب علاقة محتمل:</strong> اشتراك في وحدة صغيرة، أو علاقة عمل متشابكة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span><strong className="text-primary-700">سرعة غير معقولة:</strong> إكمال 14 سؤالاً في وقت قصير جداً</span>
          </li>
        </ul>
      </Card>

      <div className="mt-6 institutional-card p-5 bg-gold-50 border-r-4 border-gold-400">
        <p className="text-sm text-darkgray leading-relaxed">
          عند ظهور حالات مشبوهة، تظهر للجنة هنا لاتخاذ القرار: قبول التقييم، استبعاد التقييم، طلب
          تقييم بديل، أو تنبيه المرشح. كل قرار يُوثَّق.
        </p>
      </div>
    </div>
  );
}
