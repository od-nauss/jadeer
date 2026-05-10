import { Map, ArrowLeftRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export default function OrganizationFitPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          خريطة <span className="text-gold-400">الملاءمة التنظيمية</span>
        </h1>
        <p className="text-xl text-gold-200">الفرق بين التصنيف والملاءمة</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-700/30 to-transparent border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gold-300 mb-3">التصنيف القيادي</h3>
          <p className="text-white/80 mb-4 leading-relaxed">
            يجيب عن سؤال: <strong className="text-white">ما نوع هذا القائد وما درجة جاهزيته؟</strong>
          </p>
          <div className="bg-white/5 rounded-lg p-4 text-sm text-white/70">
            <strong className="text-gold-300 block mb-2">مثال:</strong>
            قائد تشغيلي جاهز الآن بدرجة 87% ومستوى ثقة 91%
          </div>
        </div>

        <div className="bg-gradient-to-br from-gold-500/20 to-transparent border border-gold-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gold-300 mb-3">الملاءمة التنظيمية</h3>
          <p className="text-white/80 mb-4 leading-relaxed">
            تجيب عن سؤال: <strong className="text-white">أين يناسب وضع هذا المرشح داخل المنظمة؟</strong>
          </p>
          <div className="bg-white/5 rounded-lg p-4 text-sm text-white/70 space-y-1">
            <div>• ملاءمة إدارة العمليات: <strong className="text-sage">92%</strong></div>
            <div>• ملاءمة إدارة المشاريع: <strong className="text-gold-400">84%</strong></div>
            <div>• ملاءمة إدارة استراتيجية: <strong className="text-steelblue">68%</strong></div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gold-300 mb-6 flex items-center gap-3">
          <Map className="h-6 w-6" />
          مثال عملي
        </h2>

        <div className="bg-gradient-to-br from-primary-800/50 to-primary-900/50 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-white mb-3">المرشح: قائد تشغيلي جاهز الآن</h4>
          <div className="space-y-3">
            {[
              { unit: 'إدارة العمليات', score: 92, color: 'bg-sage', reason: 'قوة في المتابعة، رضا فريق مرتفع، مؤشرات أداء ناضجة' },
              { unit: 'إدارة المشاريع', score: 84, color: 'bg-gold-500', reason: 'خبرة في إدارة الفرق وضبط الجداول' },
              { unit: 'إدارة استراتيجية', score: 68, color: 'bg-steelblue', reason: 'قوة تشغيلية لكن يحتاج تطوير في التخطيط طويل المدى' },
              { unit: 'إدارة تقنية', score: 45, color: 'bg-darkgray', reason: 'لا تخصص تقني كافٍ' },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">{row.unit}</span>
                  <span className="text-gold-400 font-bold">{row.score}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${row.color}`} style={{ width: `${row.score}%` }} />
                </div>
                <p className="text-xs text-white/60 mb-3">{row.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gold-200">
          <ArrowLeftRight className="h-5 w-5" />
          <p className="leading-relaxed">
            <strong>المنصة لا تصدر قرار التعيين، لكنها توضح أفضل موضع للمرشح وفق البيانات.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
