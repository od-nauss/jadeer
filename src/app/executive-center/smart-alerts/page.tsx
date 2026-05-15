import Link from 'next/link';
import { Brain, Zap, Shield, Eye, TrendingUp, ChevronLeft, AlertTriangle, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AIAnalysisPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-purple-500/15 border border-purple-400/30 rounded-full px-5 py-2 text-purple-300 text-sm font-bold mb-6">
          المحرك التحليلي للمنصة
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          دور <span className="text-purple-400">الذكاء الاصطناعي</span><br />
          في خدمة قرار القيادة
        </h1>
        <div className="max-w-3xl mx-auto bg-purple-500/10 border border-purple-400/20 rounded-2xl p-6">
          <p className="text-lg text-white/85 leading-loose">
            الذكاء الاصطناعي في منصة جدير ليس بديلاً عن الحكمة القيادية —
            بل هو <strong className="text-purple-300">محرك تحليلي يُحوّل آلاف نقاط البيانات إلى رؤية واضحة</strong>،
            تُمكّن القيادة من الحكم بأعمق معرفة ممكنة.
          </p>
          <p className="text-sm text-purple-300/70 mt-3 font-medium">
            "الآلة تُحلّل — القيادة تحكم. مبدأ لا يتغير في كل مرحلة."
          </p>
        </div>
      </section>

      {/* ─── ماذا يفعل AI ─── */}
      <section className="bg-gradient-to-br from-purple-900/30 to-primary-900/50 border border-purple-400/20 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">ستة أدوار تحليلية للذكاء الاصطناعي</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Brain,
              title: 'تحليل الأنماط القيادية عبر الزمن',
              desc: 'يقرأ آلاف نقاط البيانات من ٩ مصادر ويكشف أنماطاً يستحيل رصدها يدوياً — كالعلاقة بين أسلوب اتخاذ القرار ومعدلات رضا الفريق.',
              color: 'text-purple-300', bg: 'bg-purple-400/10',
            },
            {
              icon: Eye,
              title: 'الكشف عن القيادة غير المرئية',
              desc: 'يرصد الموظفين الذين يُظهرون مؤشرات قيادة استثنائية في بياناتهم الفعلية — بغض النظر عن مدى ظهورهم الإداري.',
              color: 'text-blue-300', bg: 'bg-blue-400/10',
            },
            {
              icon: Shield,
              title: 'حماية النزاهة من التحيزات',
              desc: 'يحلل علاقات المقيّمين بالمرشحين وينبّه لجنة الحوكمة تلقائياً عند وجود تحيز محتمل — يحمي العملية دون تدخل بشري.',
              color: 'text-emerald-300', bg: 'bg-emerald-400/10',
            },
            {
              icon: TrendingUp,
              title: 'التنبؤ بمسار الجاهزية',
              desc: 'لا يقيّم اللحظة الحالية فقط — بل يتوقع من سيصل للجاهزية القيادية خلال ٦ أو ١٢ شهراً بناءً على منحنى التطور.',
              color: 'text-gold-300', bg: 'bg-gold-400/10',
            },
            {
              icon: Zap,
              title: 'الاختبارات التكيّفية الذكية',
              desc: 'الاختبارات لا تُعطي نفس الأسئلة للجميع — يُكيّف صعوبة الأسئلة في الوقت الفعلي بناءً على إجابات المرشح السابقة لأعلى دقة ممكنة.',
              color: 'text-cyan-300', bg: 'bg-cyan-400/10',
            },
            {
              icon: Sparkles,
              title: 'صياغة البطاقة القيادية',
              desc: 'يُصدر البطاقة القيادية الأولية متضمنةً: نوع القيادة، الوحدات الأنسب، نقاط القوة، الفجوات، وخطة التطوير — تراجعها لجنة الحوكمة قبل الاعتماد.',
              color: 'text-rose-300', bg: 'bg-rose-400/10',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-1`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 text-sm">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mock Screen: تقرير AI ─── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">مثال: تقرير الذكاء الاصطناعي لمرشح فعلي</h2>
          <p className="text-white/50 text-sm">لقطة من التقرير التحليلي الذي يصدره الذكاء الاصطناعي قبل مراجعة لجنة الحوكمة</p>
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
              jadeer.nauss.edu.sa/governance/ai-report/JDR-2026-047
            </div>
          </div>

          <div className="bg-[#0f1929] p-6" dir="rtl">
            {/* AI Report Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-purple-400/20">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-white">تقرير التحليل الذكي — Jadeer AI v2.4</div>
                <div className="text-xs text-purple-400/60">صادر تلقائياً · بانتظار مراجعة لجنة الحوكمة</div>
              </div>
              <div className="mr-auto text-right">
                <div className="text-xs text-white/30 font-mono">AI-RPT-2026-047</div>
                <div className="text-xs text-amber-400">⏳ قيد المراجعة</div>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-3xl font-bold text-[#E8D5A3]">٨٧</div>
                <div className="text-xs text-gray-400 mt-0.5">درجة الجاهزية</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-3xl font-bold text-green-400">٩١٪</div>
                <div className="text-xs text-gray-400 mt-0.5">مستوى الثقة</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-sm font-bold text-blue-300 mt-1">قائد تشغيلي</div>
                <div className="text-xs text-gray-400 mt-0.5">النمط القيادي</div>
              </div>
            </div>

            {/* AI Analysis Points */}
            <div className="space-y-3">
              {[
                {
                  color: 'bg-purple-400',
                  label: 'تحليل الأنماط',
                  text: 'رصد النظام نمطاً متسقاً على مدى ٣ سنوات — معدل إنجاز مشاريع ٩٤٪ مع رضا فريق يتجاوز ٩٠٪ في كل دورة. هذا يضعها في أعلى ٨٪ من مجموع المتقدمين.',
                },
                {
                  color: 'bg-blue-400',
                  label: 'سلامة التقييم',
                  text: 'فُحصت علاقات المقيّمين الـ١٣ — لم يُرصد تضارب مصالح في أي منهم. توزيع الدرجات طبيعي بانحراف معياري ٨.٣، مما يُعزز مصداقية النتيجة.',
                },
                {
                  color: 'bg-emerald-400',
                  label: 'التنبؤ المستقبلي',
                  text: 'بناءً على منحنى التطور الحالي، يُتوقع وصولها لـ ٩٢٪+ خلال ٨ أشهر بالاستثمار في محوري التفكير الاستراتيجي والبيانات.',
                },
                {
                  color: 'bg-[#E8D5A3]',
                  label: 'توصية AI الأولية',
                  text: 'مرشحة ممتازة لقيادة قطاع تشغيلي. الوحدات الأنسب: إدارة العمليات، إدارة الجودة. يُوصى بالتكليف خلال الربع الثاني مع خطة تطوير موازية ٦ أشهر.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 bg-white/5 rounded-xl p-3">
                  <div className={`h-2 w-2 rounded-full ${item.color} shrink-0 mt-1.5`} />
                  <div>
                    <span className="text-xs font-bold text-white/50 ml-1">{item.label}: </span>
                    <span className="text-sm text-white/80 leading-relaxed">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-white/40">
                هذه التوصية أولية وتحليلية — لا تُعتمد قبل مراجعة لجنة الحوكمة وإصدار قرارها الرسمي.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-3">
          ⚠ هذه بيانات افتراضية لأغراض العرض — لا تمثل تقييماً حقيقياً لأي موظف
        </p>
      </section>

      {/* ─── مبدأ لا يتغير ─── */}
      <section className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6 flex gap-4">
        <AlertTriangle className="h-8 w-8 text-amber-400 shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-amber-300 mb-2">مبدأ راسخ في بنية المنصة</h3>
          <p className="text-white/80 leading-relaxed text-sm">
            توصية الذكاء الاصطناعي <strong className="text-white">استشارية وتحليلية — لا نهائية</strong>.
            البطاقة القيادية لا تُصدر إلا بعد مراجعة لجنة الحوكمة وإصدار قرارها الرسمي باعتماد سلامة الإجراء.
            وقرار القيادة العليا في التكليف يبقى سلطة لا تُفوَّض للآلة.
            هذا المبدأ مُقنَّن في بنية المنصة ولا يمكن تجاوزه.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="text-center pt-2">
        <Link href="/executive-center/system-preview"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          شاهد لقطات النظام من داخل كل بوابة
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
