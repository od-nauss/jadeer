import Link from 'next/link';
import { Award, CheckCircle2, TrendingUp, Target, Brain, ShieldCheck, Users, ChevronLeft, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LeadershipCardPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* العنوان */}
      <section className="text-center">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          المخرج النهائي لمنصة جدير
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          البطاقة <span className="text-gold-400">القيادية</span>
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          وثيقة رسمية معتمدة تلخّص جاهزية الموظف القيادية بدقة وشفافية —
          هي المرجع الذي يستند إليه كل قرار تكليف أو تطوير.
        </p>
      </section>

      {/* البطاقة القيادية البصرية */}
      <section>
        <h2 className="text-2xl font-bold text-gold-300 mb-6 text-center">نموذج بطاقة قيادية — نورة القحطاني</h2>

        <div className="relative max-w-2xl mx-auto">
          {/* البطاقة */}
          <div className="bg-gradient-to-br from-primary-800 to-primary-950 border-2 border-gold-400/40 rounded-3xl overflow-hidden shadow-2xl shadow-gold-900/30">

            {/* رأس البطاقة */}
            <div className="bg-gradient-to-l from-gold-600/30 to-primary-700/50 px-8 py-6 border-b border-gold-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gold-300/70 font-mono mb-1">JADEER · LEADERSHIP CARD · 2026</div>
                  <h3 className="text-2xl font-bold text-white">نورة القحطاني</h3>
                  <p className="text-gold-300 text-sm mt-1">مديرة إدارة المشاريع الاستراتيجية</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gold-400 leading-none">87</div>
                  <div className="text-xs text-gold-300/70 mt-1">درجة الجاهزية</div>
                  <div className="text-xs text-white/40">/ 100</div>
                </div>
              </div>
            </div>

            {/* محتوى البطاقة */}
            <div className="p-8 space-y-6">

              {/* التصنيف ومستوى الجاهزية */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 text-center border border-gold-400/20">
                  <div className="text-xs text-white/50 mb-2">نوع القيادة</div>
                  <div className="text-gold-400 font-bold text-lg">تشغيلية</div>
                  <div className="text-xs text-white/40 mt-1">Operational Leader</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center border border-emerald-400/20">
                  <div className="text-xs text-white/50 mb-2">مستوى الجاهزية</div>
                  <div className="text-emerald-400 font-bold text-lg">جاهزة الآن</div>
                  <div className="text-xs text-white/40 mt-1">Ready Now</div>
                </div>
              </div>

              {/* شريط الجاهزية */}
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span>درجة الجاهزية الإجمالية</span>
                  <span className="text-gold-400 font-bold">87%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-gold-400 to-gold-600 rounded-full" style={{ width: '87%' }} />
                </div>
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>

              {/* المحاور السبعة */}
              <div>
                <div className="text-xs text-white/50 mb-3 font-bold">درجات المحاور السبعة</div>
                <div className="space-y-2">
                  {[
                    { label: 'القيادة والأثر',         score: 18, max: 20, color: 'bg-gold-400' },
                    { label: 'التفكير الاستراتيجي',   score: 13, max: 15, color: 'bg-primary-400' },
                    { label: 'الأداء والإنجاز',        score: 14, max: 15, color: 'bg-emerald-400' },
                    { label: 'الابتكار والمبادرة',     score: 12, max: 15, color: 'bg-blue-400' },
                    { label: 'رضا الفريق',             score: 13, max: 15, color: 'bg-purple-400' },
                    { label: 'التقنية والذكاء',        score: 9,  max: 10, color: 'bg-cyan-400' },
                    { label: 'النزاهة والحوكمة',       score: 8,  max: 10, color: 'bg-rose-400' },
                  ].map((axis) => (
                    <div key={axis.label} className="flex items-center gap-3">
                      <div className="text-xs text-white/60 w-36 shrink-0 text-left">{axis.label}</div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${axis.color} rounded-full`}
                          style={{ width: `${(axis.score / axis.max) * 100}%` }} />
                      </div>
                      <div className="text-xs text-white/60 w-10 text-left shrink-0">
                        {axis.score}/{axis.max}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* نقاط القوة والفجوات */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> نقاط القوة
                  </div>
                  <ul className="space-y-1">
                    {['إدارة الفريق بامتياز', 'تنفيذ المشاريع بكفاءة', 'بناء الثقة المؤسسية'].map(s => (
                      <li key={s} className="text-xs text-white/70 flex items-center gap-1">
                        <span className="text-emerald-400">·</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-amber-400 font-bold mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3" /> فجوات التطوير
                  </div>
                  <ul className="space-y-1">
                    {['التفكير طويل المدى', 'إدارة التغيير الكبير', 'مهارات البيانات'].map(g => (
                      <li key={g} className="text-xs text-white/70 flex items-center gap-1">
                        <span className="text-amber-400">·</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* تقييم 360° */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gold-400" />
                    <span className="text-sm text-white font-medium">تقييم 360° — دائرة الثقة</span>
                  </div>
                  <div className="text-2xl font-bold text-gold-400">91%</div>
                </div>
                <p className="text-xs text-white/50 mt-2">من 13 مقيّماً معتمداً — 4 رؤساء، 5 زملاء، 4 مرؤوسين</p>
              </div>

              {/* اعتماد الحوكمة */}
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-300 text-sm">معتمدة من لجنة الحوكمة</div>
                  <div className="text-xs text-white/50 mt-0.5">بتاريخ 15 مايو 2026 · قرار رقم GC-2026-047</div>
                </div>
              </div>

              {/* توصية الذكاء الاصطناعي */}
              <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 flex items-start gap-3">
                <Brain className="h-6 w-6 text-purple-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300 text-sm mb-1">توصية الذكاء الاصطناعي</div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    نورة تُظهر نمطاً قيادياً تشغيلياً مميزاً مع قدرة عالية على تنفيذ الأهداف.
                    يُوصى بتكليفها بإدارة قطاع بدرجة تعقيد متوسطة مع دعم تطويري في الاستراتيجية
                    خلال 6 أشهر للوصول للجاهزية الكاملة للمناصب العليا.
                  </p>
                </div>
              </div>
            </div>

            {/* ذيل البطاقة */}
            <div className="px-8 py-4 bg-white/3 border-t border-gold-400/10 flex items-center justify-between">
              <div className="text-xs text-white/30 font-mono">JADEER-2026-NC-0047</div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-gold-400 fill-gold-400" />)}
              </div>
              <div className="text-xs text-white/30">منصة جدير · NAUSS</div>
            </div>
          </div>
        </div>
      </section>

      {/* أنواع البطاقات الأربعة */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">أنواع القيادة الأربعة</h2>
        <p className="text-white/60 text-center mb-8">جدير تصنّف كل مرشح ضمن نوع قيادي يناسب طبيعة دوره</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'استراتيجية', en: 'Strategic', desc: 'رؤية بعيدة المدى وتوجيه المنظمة نحو المستقبل', color: 'border-gold-400 bg-gold-400/10', badge: 'text-gold-400' },
            { type: 'تشغيلية',   en: 'Operational', desc: 'تنفيذ ممتاز وإدارة فرق عالية الأداء', color: 'border-primary-400 bg-primary-400/10', badge: 'text-primary-300' },
            { type: 'تقنية',     en: 'Technical', desc: 'ريادة في التقنية والذكاء الاصطناعي والابتكار', color: 'border-blue-400 bg-blue-400/10', badge: 'text-blue-300' },
            { type: 'إنسانية',   en: 'Human', desc: 'بناء الثقة وتطوير الكفاءات وتنمية المواهب', color: 'border-purple-400 bg-purple-400/10', badge: 'text-purple-300' },
          ].map((t) => (
            <div key={t.type} className={`border rounded-2xl p-5 ${t.color}`}>
              <div className={`font-bold text-lg mb-1 ${t.badge}`}>{t.type}</div>
              <div className="text-xs text-white/40 mb-3 font-mono">{t.en}</div>
              <p className="text-sm text-white/70 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* مستويات الجاهزية */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">مستويات الجاهزية</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {[
            { level: 'جاهز الآن',       range: '80–100%', color: 'bg-emerald-400', width: '100%', desc: 'يمكن تكليفه فوراً' },
            { level: 'جاهز خلال سنة',  range: '65–79%',  color: 'bg-gold-400',    width: '75%',  desc: 'يحتاج خطة تطوير 6–12 شهراً' },
            { level: 'قائد واعد',       range: '50–64%',  color: 'bg-blue-400',    width: '55%',  desc: 'يحتاج برنامجاً قيادياً' },
            { level: 'يحتاج تطويراً',   range: 'أقل من 50%', color: 'bg-rose-400', width: '35%', desc: 'غير جاهز حالياً' },
          ].map((l) => (
            <div key={l.level} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="w-28 shrink-0">
                <div className="font-bold text-white text-sm">{l.level}</div>
                <div className="text-xs text-white/40 font-mono">{l.range}</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${l.color} rounded-full`} style={{ width: l.width }} />
                </div>
              </div>
              <div className="text-xs text-white/60 w-40 shrink-0">{l.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pt-4">
        <Link href="/executive-center/organization-fit"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          شاهد الخريطة التنظيمية — من يناسب أي منصب؟
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
