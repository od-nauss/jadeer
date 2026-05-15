import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PHASES = [
  {
    phase: 'أولاً',
    title: 'بناء الملف القيادي',
    color: 'bg-primary-600',
    steps: [
      { n: '01', label: 'التقديم والتسجيل', sub: 'دخول مسار الجاهزية القيادية الرسمي' },
      { n: '02', label: 'الملف القيادي', sub: 'مؤهلات، خبرات، مهارات، أدوات وأنظمة' },
      { n: '03', label: 'توثيق المبادرات', sub: 'الشواهد، الدور الفعلي، والأثر المحقق' },
      { n: '04', label: 'مؤشرات الأداء', sub: 'KPIs الموثقة مع الأثر الرقمي المدعوم' },
    ],
  },
  {
    phase: 'ثانياً',
    title: 'التقييم المتعدد المصادر',
    color: 'bg-gold-600',
    steps: [
      { n: '05', label: 'الاختبارات الذكية التكيّفية', sub: '٨ اختبارات: قيادة، استراتيجي، قرار، أزمات، عاطفي، فريق، تقنية، حالة' },
      { n: '06', label: 'ترشيح دائرة الثقة', sub: '١٥ مقترحاً من مستويات متعددة' },
      { n: '07', label: 'اعتماد لجنة الحوكمة', sub: '٧–١٠ مقيّمين، ٦٠٪ على الأقل من اختيار اللجنة' },
      { n: '08', label: 'إرسال روابط مؤمَّنة', sub: 'رابط فردي لكل مقيم، يستخدم مرة واحدة فقط' },
    ],
  },
  {
    phase: 'ثالثاً',
    title: 'التحليل الذكي والحوكمة',
    color: 'bg-steelblue',
    steps: [
      { n: '09', label: 'استيفاء تقييمات 360°', sub: 'استلام وحفظ تقييمات جميع المقيّمين' },
      { n: '10', label: 'التحليل الذكي الشامل', sub: 'أنماط القيادة، الاتساق، التحيز، مستوى الثقة' },
      { n: '11', label: 'مراجعة لجنة الحوكمة', sub: 'التحقق من سلامة الإجراء وإصدار الاعتماد' },
    ],
  },
  {
    phase: 'رابعاً',
    title: 'المخرجات القيادية',
    color: 'bg-sage',
    steps: [
      { n: '12', label: 'البطاقة القيادية', sub: 'درجة الجاهزية، نوع القيادة، الملاءمة، الثقة' },
      { n: '13', label: 'عرض النتائج للقيادة', sub: 'لوحة الرئيس مع خريطة الملاءمة والتعاقب' },
      { n: '14', label: 'خطة التطوير الفردية', sub: 'مبنية على الفجوات، تتابعها الموارد البشرية' },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          منهجية منظومة متكاملة
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          رحلة التقييم القيادي <span className="text-gold-400">من الأول إلى الأخير</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          ١٤ مرحلة منهجية متكاملة — كل مرحلة تبني على سابقتها لتُنتج
          <strong className="text-gold-300"> أدق ملف تحليلي قيادي ممكن.</strong>
        </p>
      </section>

      {/* ─── المراحل الأربع ─── */}
      <section className="space-y-8">
        {PHASES.map((phase, pi) => (
          <div key={pi} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* رأس المرحلة */}
            <div className={`${phase.color} px-6 py-4 flex items-center gap-4`}>
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                {pi + 1}
              </div>
              <div>
                <div className="text-white/70 text-xs">{phase.phase}</div>
                <div className="font-bold text-white">{phase.title}</div>
              </div>
            </div>
            {/* خطوات المرحلة */}
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              {phase.steps.map((step, si) => (
                <div key={si}
                  className="flex items-center gap-4 bg-white/5 hover:bg-gold-500/5 border border-white/10 hover:border-gold-400/20 rounded-xl p-4 transition-all group">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gold-500/20 flex items-center justify-center font-bold text-gold-300 text-sm">
                    {step.n}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm group-hover:text-gold-300 transition">{step.label}</div>
                    <div className="text-xs text-white/50 mt-0.5 leading-relaxed">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ─── Mock Screen: لوحة تقدم المرشح ─── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">كيف يرى المرشح مساره</h2>
          <p className="text-white/50 text-sm">لقطة فعلية من لوحة المتقدم داخل منصة جدير</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          {/* Browser Bar */}
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-md px-3 py-0.5 text-xs text-gray-300 text-center">
              jadeer.nauss.edu.sa/candidate/dashboard
            </div>
          </div>

          {/* Screen Content */}
          <div className="bg-[#f0f4f8] p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-[#1a365d]">مرحباً، سعد الحارثي</h3>
                <p className="text-sm text-gray-500 mt-0.5">مسار الجاهزية القيادية — الدورة الثانية ١٤٤٧هـ</p>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-[#2D5A8B]">٦٤٪</div>
                <div className="text-xs text-gray-500">نسبة الاكتمال الكلي</div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'الملف القيادي', status: 'completed', pct: 100 },
                { label: 'المبادرات والإنجازات', status: 'completed', pct: 100 },
                { label: 'مؤشرات الأداء', status: 'completed', pct: 100 },
                { label: 'الاختبارات الذكية', status: 'in-progress', pct: 60 },
                { label: 'دائرة الثقة القيادية', status: 'pending', pct: 0 },
                { label: 'تقييم 360°', status: 'locked', pct: 0 },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border-2 ${
                  item.status === 'completed' ? 'bg-green-50 border-green-300' :
                  item.status === 'in-progress' ? 'bg-blue-50 border-blue-300' :
                  item.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status === 'completed' ? '✓ مكتمل' :
                       item.status === 'in-progress' ? '◉ جارٍ' :
                       item.status === 'pending' ? '○ لم يبدأ' : '🔒 مقفل'}
                    </span>
                  </div>
                  {item.pct > 0 && (
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${item.pct}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next Action */}
            <div className="bg-[#2D5A8B] text-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-200 mb-0.5">الخطوة التالية</div>
                <div className="font-bold">أكمل الاختبار الذكي رقم ٥ — إدارة الأزمات</div>
              </div>
              <button className="bg-[#E8D5A3] text-[#7A5C00] text-xs font-bold px-4 py-2 rounded-lg flex-shrink-0">
                ابدأ الآن ←
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-3">
          ⚠ هذه بيانات افتراضية لأغراض العرض — لا تمثل بيانات حقيقية لأي موظف
        </p>
      </section>

      {/* ─── ضمانة الجودة ─── */}
      <section className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">كل مرحلة موثقة — لا انتقال إلا باكتمال السابقة</h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          المسار كله محكوم بسجل تدقيق يُسجّل كل إجراء — لا يمكن تجاوزه أو تعديله بعد اكتماله.
        </p>
        <Link href="/executive-center/methodology"
          className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200 font-bold transition group">
          كيف تُحتسب درجة الجاهزية القيادية؟
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
