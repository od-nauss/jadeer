import Link from 'next/link';
import { Brain, Zap, Shield, Eye, TrendingUp, ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AIAnalysisPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* العنوان */}
      <section className="text-center">
        <div className="inline-block bg-purple-500/15 border border-purple-400/30 rounded-full px-5 py-2 text-purple-300 text-sm font-bold mb-6">
          المحور السادس من العرض
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          دور <span className="text-purple-400">الذكاء الاصطناعي</span>
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          AI في جدير ليس أداة إضافية — هو المحرك الذي يحوّل البيانات الخام إلى رؤية قيادية دقيقة وموضوعية
        </p>
      </section>

      {/* ماذا يفعل AI */}
      <section className="bg-gradient-to-br from-purple-900/30 to-primary-900/50 border border-purple-400/20 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">ماذا يفعل الذكاء الاصطناعي في جدير؟</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Brain,
              title: 'تحليل الأنماط القيادية',
              desc: 'يقرأ آلاف نقاط البيانات من 9 مصادر مختلفة ويكتشف أنماطاً يستحيل على الإنسان رصدها يدوياً — مثل العلاقة بين أسلوب القرارات ومعدلات الأداء.',
              color: 'text-purple-300',
              bg: 'bg-purple-400/10',
            },
            {
              icon: Eye,
              title: 'الكشف عن القيادة المخفية',
              desc: 'يرصد الموظفين الذين يُظهرون مؤشرات قيادة استثنائية لكنهم لم يُرشَّحوا أبداً — بناءً على سلوكهم الفعلي لا على من يعرفون.',
              color: 'text-blue-300',
              bg: 'bg-blue-400/10',
            },
            {
              icon: Shield,
              title: 'كشف التحيز وتضارب المصالح',
              desc: 'يحلل علاقات المقيّمين بالمرشحين ويُنبّه تلقائياً عند وجود تحيز محتمل في تقييم 360° — يحمي النزاهة دون تدخل بشري.',
              color: 'text-emerald-300',
              bg: 'bg-emerald-400/10',
            },
            {
              icon: TrendingUp,
              title: 'التنبؤ بالجاهزية المستقبلية',
              desc: 'لا يقيّم فقط الوضع الحالي — بل يتوقع من سيصل للجاهزية القيادية خلال 6 أو 12 شهراً بناءً على مسار التطور.',
              color: 'text-gold-300',
              bg: 'bg-gold-400/10',
            },
            {
              icon: Zap,
              title: 'الاختبارات التكيّفية',
              desc: 'الاختبارات الذكية لا تُعطي نفس الأسئلة لكل شخص — AI يُكيّف صعوبة الأسئلة في الوقت الفعلي بناءً على إجاباتك السابقة.',
              color: 'text-cyan-300',
              bg: 'bg-cyan-400/10',
            },
            {
              icon: CheckCircle2,
              title: 'صياغة التوصية النهائية',
              desc: 'يصدر تقريراً شاملاً يتضمن نوع القيادة، الوحدات التنظيمية الأنسب، نقاط القوة، الفجوات، وخطة التطوير — كل ذلك بصياغة احترافية.',
              color: 'text-rose-300',
              bg: 'bg-rose-400/10',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-1`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* مثال حي لتقرير AI */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">مثال: تقرير AI لنورة القحطاني</h2>
        <div className="bg-white/5 border border-purple-400/20 rounded-2xl overflow-hidden">
          {/* رأس التقرير */}
          <div className="bg-purple-900/30 border-b border-purple-400/20 px-6 py-4 flex items-center gap-3">
            <Brain className="h-5 w-5 text-purple-400" />
            <span className="text-purple-300 font-bold text-sm">تقرير تحليل الذكاء الاصطناعي · Jadeer AI v2.1</span>
            <span className="mr-auto text-xs text-white/30 font-mono">AI-RPT-2026-047</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-400 shrink-0 mt-2" />
              <p className="text-white/80 leading-relaxed text-sm">
                <strong className="text-white">تحليل الأنماط:</strong> رصد النظام نمطاً متسقاً على مدى 3 سنوات — نورة تُظهر معدل إنجاز مشاريع 94% مع رضا فريق يتجاوز 90% في كل دورة، وهو ما يضعها في أعلى 8% من مجموع المتقدمين.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-2" />
              <p className="text-white/80 leading-relaxed text-sm">
                <strong className="text-white">تحليل التحيز:</strong> فحص النظام علاقات المقيّمين الـ13 — لم يُرصد تضارب مصالح في أي منهم. درجات التقييم مُوزّعة بشكل طبيعي بانحراف معياري 8.3، مما يُعزز مصداقية النتيجة.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-2" />
              <p className="text-white/80 leading-relaxed text-sm">
                <strong className="text-white">التنبؤ المستقبلي:</strong> بناءً على منحنى التطور الحالي، يُتوقع وصولها لـ 92%+ خلال 8 أشهر في حال الاستثمار في محورَي التفكير الاستراتيجي والبيانات.
              </p>
            </div>
            <div className="border-t border-white/10 pt-4 flex gap-3">
              <div className="h-2 w-2 rounded-full bg-gold-400 shrink-0 mt-2" />
              <p className="text-white/80 leading-relaxed text-sm">
                <strong className="text-gold-400">التوصية النهائية:</strong> مرشحة ممتازة لقيادة قطاع تشغيلي بدرجة تعقيد متوسطة-عالية. الوحدات الأنسب: إدارة العمليات، إدارة الجودة والامتثال. يُوصى بتكليفها خلال الربع الثاني مع خطة تطوير موازية مدتها 6 أشهر.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ضمانات AI */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">AI مساعد — لا بديل عن الحوكمة</h2>
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6 flex gap-4">
          <AlertTriangle className="h-8 w-8 text-amber-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-300 mb-2">مبدأ أساسي لا يتغير</h3>
            <p className="text-white/80 leading-relaxed">
              توصية الذكاء الاصطناعي <strong className="text-white">استشارية وليست نهائية</strong>.
              لا يُعتمد أي تصنيف قيادي دون مراجعة لجنة الحوكمة والتصويت عليه.
              AI يُوفّر البيانات، والإنسان يتخذ القرار. هذا المبدأ مُقنَّن في بنية المنصة ولا يمكن تجاوزه.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pt-4">
        <Link href="/executive-center/system-preview"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          شاهد لقطات النظام من داخل كل بوابة
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
