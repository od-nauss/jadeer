import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Brain, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

const AXES = [
  { name: 'القيادة والأثر المؤسسي',    weight: 20, color: 'bg-gold-400',     bar: 'from-gold-400 to-gold-600',      example: 'عدد الفرق المقودة، حجم القرارات، الأثر الموثق على المنظمة' },
  { name: 'التفكير الاستراتيجي',        weight: 15, color: 'bg-primary-400',  bar: 'from-primary-400 to-primary-600', example: 'نتائج الاختبارات الذكية + سيناريوهات التخطيط' },
  { name: 'الأداء والإنجاز',            weight: 15, color: 'bg-emerald-400',  bar: 'from-emerald-400 to-emerald-600', example: 'مؤشرات KPI الموثقة + تقارير الأداء السنوية' },
  { name: 'الابتكار والمبادرة',          weight: 15, color: 'bg-blue-400',     bar: 'from-blue-400 to-blue-600',       example: 'المبادرات التي أطلقها المرشح وأثرها الموثق' },
  { name: 'رضا الفريق والتعاون',         weight: 15, color: 'bg-purple-400',   bar: 'from-purple-400 to-purple-600',   example: 'نتيجة تقييم 360° من الزملاء والمرؤوسين والمديرين' },
  { name: 'التقنية والذكاء الاصطناعي',  weight: 10, color: 'bg-cyan-400',     bar: 'from-cyan-400 to-cyan-600',       example: 'اختبارات التقنية + شهادات الابتكار الرقمي' },
  { name: 'النزاهة والحوكمة',            weight: 10, color: 'bg-rose-400',     bar: 'from-rose-400 to-rose-600',       example: 'سجل الالتزام + تقييم لجنة الحوكمة المستقل' },
];

const SOURCES = [
  { n: '1', title: 'الملف القيادي',          desc: 'التجربة والمسيرة والمؤهلات' },
  { n: '2', title: 'المبادرات والإنجازات',   desc: 'المشاريع وأثرها الموثق' },
  { n: '3', title: 'مؤشرات الأداء KPIs',    desc: 'الأرقام والتقارير السنوية' },
  { n: '4', title: '8 اختبارات ذكية',        desc: 'تكيّفية بالذكاء الاصطناعي' },
  { n: '5', title: 'تقييم 360°',             desc: '7–10 مقيّمين من 3 مستويات' },
  { n: '6', title: 'تحليل AI',               desc: 'أنماط وتوصية موضوعية أولية' },
  { n: '7', title: 'خريطة الملاءمة',         desc: 'مطابقة مع الوحدات التنظيمية' },
  { n: '8', title: 'الأدلة الداعمة',         desc: 'وثائق وشهادات وتوصيات' },
  { n: '9', title: 'قرار لجنة الحوكمة',     desc: 'الاعتماد الرسمي النهائي' },
];

export default function MethodologyPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          المنهجية العلمية المعتمدة
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          كيف تُحتسب <span className="text-gold-400">درجة الجاهزية القيادية؟</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          ليست درجة عشوائية — كل نقطة مصدرها موثق، كل وزن مدروس،
          وكل محور يُعبّر عن <strong className="text-gold-300">بُعد حقيقي من أبعاد الجاهزية القيادية.</strong>
        </p>
      </section>

      {/* ─── المحاور السبعة ─── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">المحاور السبعة وأوزانها</h2>
          <p className="text-white/50 text-sm">أوزان مدروسة بناءً على أبحاث قيادة مؤسسية في بيئات حكومية</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* شريط الأوزان */}
          <div className="flex-1 space-y-4">
            {AXES.map((axis) => (
              <div key={axis.name} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white font-medium">{axis.name}</span>
                  <span className="text-gold-400 font-bold text-sm">{axis.weight}٪</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-l ${axis.bar} rounded-full`}
                    style={{ width: `${axis.weight * 5}%` }} />
                </div>
                <p className="text-xs text-white/35 mt-1 group-hover:text-white/55 transition leading-relaxed">
                  {axis.example}
                </p>
              </div>
            ))}
          </div>

          {/* ملخص الأوزان */}
          <div className="md:w-56 shrink-0">
            <div className="bg-gradient-to-br from-gold-500/20 to-transparent border border-gold-400/30 rounded-2xl p-5 text-center sticky top-24">
              <div className="text-5xl font-bold text-gold-400 mb-1">100</div>
              <div className="text-white font-bold text-sm mb-4">درجة الجاهزية</div>
              <div className="space-y-1.5 text-right">
                {AXES.map(a => (
                  <div key={a.name} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${a.color} shrink-0`} />
                    <span className="text-xs text-white/55 flex-1 leading-tight">{a.name}</span>
                    <span className="text-xs font-bold text-gold-400">{a.weight}٪</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9 مصادر البيانات ─── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">9 مصادر تُغذّي الدرجة</h2>
          <p className="text-white/50 text-sm">لا مصدر واحد يحدد النتيجة — التنوع يضمن الموضوعية</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {SOURCES.map((s) => (
            <div key={s.n}
              className="bg-white/5 border border-white/10 hover:border-gold-400/25 rounded-xl p-4 flex gap-3 transition-all group">
              <div className="h-8 w-8 rounded-lg bg-gold-400/15 flex items-center justify-center text-gold-400 font-bold shrink-0 text-sm">
                {s.n}
              </div>
              <div>
                <div className="font-bold text-white text-sm mb-0.5">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── مثال تفصيلي ─── */}
      <section className="bg-white/5 border border-gold-400/20 rounded-2xl p-7">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-gold-400" />
          <h2 className="text-xl font-bold text-white">مثال حي: احتساب درجة نورة القحطاني</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { axis: 'القيادة والأثر',     score: 18, max: 20, pct: 90 },
            { axis: 'التفكير الاستراتيجي', score: 13, max: 15, pct: 87 },
            { axis: 'الأداء والإنجاز',    score: 14, max: 15, pct: 93 },
            { axis: 'الابتكار',            score: 12, max: 15, pct: 80 },
            { axis: 'رضا الفريق (360°)',  score: 13, max: 15, pct: 87 },
            { axis: 'التقنية',             score: 9,  max: 10, pct: 90 },
            { axis: 'النزاهة',             score: 8,  max: 10, pct: 80 },
          ].map((row) => (
            <div key={row.axis} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{row.axis}</div>
                <div className="text-xs text-white/35 mt-0.5">{row.score} من {row.max}</div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-gold-400 rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
              <div className="text-gold-400 font-bold text-lg">{row.pct}٪</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gold-400/15 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-white font-bold">الدرجة الإجمالية النهائية</span>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gold-400">87 / 100</div>
            <div className="text-xs text-emerald-400 font-bold">جاهزة الآن</div>
          </div>
        </div>
      </section>

      {/* ─── ملاحظة منهجية ─── */}
      <section className="bg-primary-700/20 border border-primary-400/20 rounded-2xl p-5 flex gap-4">
        <Info className="h-5 w-5 text-primary-300 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-primary-200 mb-1 text-sm">الأوزان قابلة للتكيّف</h3>
          <p className="text-sm text-white/65 leading-relaxed">
            أوزان المحاور مدروسة لتناسب البيئات المؤسسية الحكومية — ويمكن تعديلها وفق السياق التنظيمي لجامعة نايف بقرار من القيادة في أي وقت.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="text-center">
        <Link href="/executive-center/anti-bias"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          كيف تحمي المنصة القرار القيادي من التحيز؟
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
