export const dynamic = 'force-dynamic';

const STEPS = [
  { num: '01', title: 'الموظف يتقدم', desc: 'إنشاء حساب جديد ودخول مسار الجاهزية القيادية' },
  { num: '02', title: 'الملف القيادي', desc: 'بيانات أساسية، مؤهلات، خبرات، مهارات، أدوات وأنظمة' },
  { num: '03', title: 'توثيق المبادرات', desc: 'مع الشواهد ودور المرشح الفعلي والأثر المحقق' },
  { num: '04', title: 'مؤشرات الأداء', desc: 'المؤشرات التي استخدمها في عمله ومدى أثرها' },
  { num: '05', title: 'الاختبارات الذكية', desc: 'ثمانية اختبارات: قيادة، استراتيجي، قرار، أزمات، عاطفي، فريق، تقنية، حالة' },
  { num: '06', title: 'ترشيح 15 مقيماً', desc: 'دائرة الثقة القيادية: مدير، زملاء، مرؤوسون، أصحاب علاقة' },
  { num: '07', title: 'مراجعة لجنة الحوكمة', desc: 'اعتماد 7-10 مقيمين، 60% على الأقل من اختيار اللجنة' },
  { num: '08', title: 'إصدار روابط التقييم', desc: 'رابط فردي آمن لكل مقيم، يستخدم مرة واحدة فقط' },
  { num: '09', title: 'اكتمال دائرة الثقة', desc: 'استلام التقييمات وحفظها مرتبطة بالمرشح' },
  { num: '10', title: 'التحليل الذكي', desc: 'تحليل الاتساق، التحيز، مستوى الثقة، الجاهزية الأولية' },
  { num: '11', title: 'مراجعة اللجنة النهائية', desc: 'اعتماد التصنيف مع توثيق سبب القرار' },
  { num: '12', title: 'البطاقة القيادية', desc: 'درجة الجاهزية، نوع القيادة، نقاط القوة، الفجوات، التوصية' },
  { num: '13', title: 'عرض النتيجة للقيادة', desc: 'في لوحة الرئيس مع خريطة الملاءمة والتعاقب' },
  { num: '14', title: 'خطة التطوير الفردية', desc: 'يولّدها النظام، تراجعها الموارد البشرية، يتابعها المرشح' },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          كيف <span className="text-gold-400">تعمل</span> المنصة
        </h1>
        <p className="text-xl text-gold-200">رحلة المرشح من التقديم إلى البطاقة القيادية</p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="group flex items-center gap-4 bg-white/5 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-400/60 rounded-xl p-5 transition-all"
          >
            <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-primary-900 font-bold text-xl">
              {step.num}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-white/70">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/30 rounded-2xl p-6 text-center">
        <p className="text-lg text-gold-200">
          المسار كله موثق في سجل التدقيق، ولا يتم الانتقال من مرحلة إلى أخرى دون استكمال شروطها.
        </p>
      </div>
    </div>
  );
}
