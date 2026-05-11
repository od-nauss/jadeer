import Link from 'next/link';
import { TrendingUp, Target, CheckCircle2, Calendar, ChevronLeft, Brain, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DevelopmentPlanPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* العنوان */}
      <section className="text-center">
        <div className="inline-block bg-emerald-500/15 border border-emerald-400/30 rounded-full px-5 py-2 text-emerald-300 text-sm font-bold mb-6">
          المحور العاشر من العرض
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          خطة <span className="text-emerald-400">التطوير القيادي</span>
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          جدير لا تكتفي بقياس الجاهزية — بل تُنشئ خطة تطوير مخصصة لكل مرشح
          تُسرّع وصوله للقيادة وتسدّ فجواته الحقيقية
        </p>
      </section>

      {/* فكرة خطة التطوير */}
      <section className="grid md:grid-cols-3 gap-5">
        {[
          { icon: Target, title: 'مبنية على فجوات حقيقية', desc: 'لا تخمين — كل هدف في الخطة مرتبط بفجوة محددة كشفها التحليل المتعدد المصادر.', color: 'text-gold-400', bg: 'bg-gold-400/10' },
          { icon: Brain,  title: 'مُصمَّمة بالذكاء الاصطناعي', desc: 'AI يُوصي بالتدخلات الأنسب لكل شخص بناءً على نمط تعلّمه وطبيعة دوره.', color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { icon: TrendingUp, title: 'قابلة للقياس والمتابعة', desc: 'كل هدف له مؤشر نجاح وموعد نهائي — الموارد البشرية والمستشار يتابعان التقدم.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((item) => (
          <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} mb-4`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <h3 className="font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* مثال مفصّل: نورة القحطاني */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">خطة تطوير قيادي — نورة القحطاني</h2>
        <p className="text-white/60 mb-8">درجة الجاهزية: 87% · المستهدف: 93%+ خلال 8 أشهر</p>

        <div className="space-y-6">

          {/* الشهر 1-2 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  1-2
                </div>
                <div className="w-0.5 h-full bg-white/10 mt-2 mb-0" />
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-4 w-4 text-primary-300" />
                  <span className="font-bold text-primary-300">الشهران الأول والثاني — التأسيس</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                  {[
                    { goal: 'برنامج التفكير الاستراتيجي',      action: 'دورة مكثفة 3 أيام + مشروع تطبيقي فعلي داخل المنظمة', kpi: 'تقديم خطة استراتيجية لقطاعها بنهاية الشهر الثاني' },
                    { goal: 'مهارات قراءة وتحليل البيانات',     action: 'تدريب عملي على لوحات BI + ورش Power BI/Tableau', kpi: 'بناء لوحة بيانات للقطاع بشكل مستقل' },
                  ].map((item) => (
                    <div key={item.goal} className="flex gap-3 items-start">
                      <CheckCircle2 className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-sm">{item.goal}</div>
                        <div className="text-xs text-white/60 mt-0.5">{item.action}</div>
                        <div className="text-xs text-primary-300 mt-1 flex items-center gap-1">
                          <Target className="h-3 w-3" /> {item.kpi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* الشهر 3-4 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-gold-600 flex items-center justify-center text-white font-bold text-sm">
                  3-4
                </div>
                <div className="w-0.5 h-full bg-white/10 mt-2" />
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-4 w-4 text-gold-300" />
                  <span className="font-bold text-gold-300">الشهران الثالث والرابع — التعمّق</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                  {[
                    { goal: 'قيادة التغيير المؤسسي', action: 'تكليف بقيادة مبادرة تحوّل حقيقية داخلياً كاختبار عملي', kpi: 'تقرير تأثير موثق + تقييم من الفريق والمشرف' },
                    { goal: 'مهارات التفاوض والإقناع', action: 'ورشة تطبيقية مع سيناريوهات واقعية من بيئة العمل', kpi: 'تقديم نتائج المفاوضات الداخلية لمشروع فعلي' },
                  ].map((item) => (
                    <div key={item.goal} className="flex gap-3 items-start">
                      <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-sm">{item.goal}</div>
                        <div className="text-xs text-white/60 mt-0.5">{item.action}</div>
                        <div className="text-xs text-gold-300 mt-1 flex items-center gap-1">
                          <Target className="h-3 w-3" /> {item.kpi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* الشهر 5-6 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-steelblue flex items-center justify-center text-white font-bold text-sm">
                  5-6
                </div>
                <div className="w-0.5 h-full bg-white/10 mt-2" />
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-4 w-4 text-steelblue" />
                  <span className="font-bold" style={{ color: '#2E6F8E' }}>الشهران الخامس والسادس — الاختبار الفعلي</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                  {[
                    { goal: 'قيادة قطاع أو إدارة بشكل مؤقت', action: 'تكليف مؤقت (Acting) لمدة 60 يوماً لاختبار الجاهزية الفعلية', kpi: 'تقييم 360° ثانوي بنهاية التكليف' },
                    { goal: 'برنامج الإرشاد (Mentoring)', action: 'جلسات أسبوعية مع قائد أقدم داخل المنظمة', kpi: 'تقرير تطور مشترك بين الموجّه والمتطوّر' },
                  ].map((item) => (
                    <div key={item.goal} className="flex gap-3 items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-sm">{item.goal}</div>
                        <div className="text-xs text-white/60 mt-0.5">{item.action}</div>
                        <div className="text-xs mt-1 flex items-center gap-1" style={{ color: '#2E6F8E' }}>
                          <Target className="h-3 w-3" /> {item.kpi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* الشهر 7-8 */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                7-8
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-4 w-4 text-emerald-300" />
                <span className="font-bold text-emerald-300">الشهران السابع والثامن — التقييم والاعتماد</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-5 space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-sm">إعادة التقييم الشاملة</div>
                    <div className="text-xs text-white/60 mt-0.5">تطبيق كامل لمنهجية جدير مجدداً بعد التطوير</div>
                    <div className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
                      <Target className="h-3 w-3" /> الهدف: رفع الدرجة من 87% إلى 93%+
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-sm">قرار التكليف الرسمي</div>
                    <div className="text-xs text-white/60 mt-0.5">لجنة الحوكمة تُعيد مراجعة البطاقة وتُصدر قرار التكليف</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* نتيجة الخطة */}
      <section className="bg-gradient-to-br from-emerald-900/20 to-primary-900/40 border border-emerald-400/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">النتيجة المتوقعة بعد 8 أشهر</h2>
        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-1">87% → 93%</div>
            <div className="text-sm text-white/60">درجة الجاهزية</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gold-400 mb-1">جاهزة</div>
            <div className="text-sm text-white/60">للمناصب القيادية العليا</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-300 mb-1">موثّق</div>
            <div className="text-sm text-white/60">كل خطوة في سجل جدير</div>
          </div>
        </div>
        <p className="text-white/70 max-w-2xl mx-auto text-sm leading-relaxed">
          جدير لا تُقدّم خطة تطوير عامة — بل تُصمّم مساراً شخصياً دقيقاً يُسرّع الوصول للقيادة
          وتتابع تنفيذه خطوة بخطوة عبر لوحة متابعة متكاملة للموارد البشرية والمستشار.
        </p>
      </section>

      {/* CTA */}
      <section className="text-center pt-4">
        <Link href="/executive-center/beneficiaries"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          من يستفيد من كل هذا؟
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
