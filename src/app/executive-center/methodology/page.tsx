const AXES = [
  { name: 'القيادة والتأثير', weight: 20, color: 'bg-gold-500' },
  { name: 'التفكير الاستراتيجي', weight: 15, color: 'bg-primary-400' },
  { name: 'الأداء والإنجاز', weight: 15, color: 'bg-sage' },
  { name: 'الابتكار والمبادرات', weight: 15, color: 'bg-steelblue' },
  { name: 'رضا الفريق وأصحاب العلاقة', weight: 15, color: 'bg-wine' },
  { name: 'استخدام التقنية والذكاء الاصطناعي', weight: 10, color: 'bg-umber' },
  { name: 'النزاهة والالتزام المؤسسي', weight: 10, color: 'bg-darkgray' },
];

const SOURCES = [
  'الملف القيادي (الخبرات والمهارات والأدوات)',
  'المبادرات والإنجازات (مع الشواهد والشهود)',
  'مؤشرات الأداء (التي استخدمها في عمله)',
  'الاختبارات الذكية الثمانية',
  'تقييم 360 من دائرة الثقة القيادية',
  'تحليل الذكاء الاصطناعي المساعد',
  'الشواهد المرفقة',
  'مراجعة لجنة الحوكمة',
  'خريطة الملاءمة التنظيمية',
];

export default function MethodologyPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          منهجية <span className="text-gold-400">التقييم</span>
        </h1>
        <p className="text-xl text-gold-200">سبعة محاور بأوزان مدروسة</p>
      </div>

      <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gold-300 mb-6">المحاور والأوزان</h2>
        <div className="space-y-4">
          {AXES.map((axis, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-medium text-white">{axis.name}</span>
                <span className="text-gold-400 font-bold">{axis.weight}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${axis.color} rounded-full`}
                  style={{ width: `${axis.weight * 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-white/60 mt-6 leading-relaxed">
          الأوزان قابلة للتعديل من إعدادات مدير النظام، ويمكن تخصيص أوزان مختلفة لكل وحدة تنظيمية
          حسب طبيعتها (تشغيلية، استراتيجية، تقنية...).
        </p>
      </div>

      <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gold-300 mb-6">مصادر التقييم</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {SOURCES.map((source, i) => (
            <div
              key={i}
              className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-3 flex items-center gap-2"
            >
              <span className="text-gold-400 font-bold">{i + 1}.</span>
              <span className="text-sm text-white/80">{source}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gold-500/10 to-transparent border-r-4 border-gold-400 rounded-2xl p-6">
        <p className="text-lg text-white/90 leading-loose">
          <strong className="text-gold-400">القاعدة الجوهرية:</strong> النتيجة لا تصدر من مصدر واحد،
          بل من مجموع مصادر متعددة تضبطها لجنة الحوكمة. هذا ما يحول التقييم من رأي شخصي إلى قرار
          مؤسسي موثق.
        </p>
      </div>
    </div>
  );
}
