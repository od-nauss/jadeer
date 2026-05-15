import { Shield, CheckCircle2, Lock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const GUARANTEES = [
  { title: 'اعتماد المقيّمين بيد لجنة الحوكمة', body: 'الموظف يقترح ١٥ اسماً فقط — واللجنة هي التي تعتمد ٧–١٠ مقيّمين وتُحدد ٦٠٪ منهم على الأقل، مما يضمن تنوع المصادر وحياديتها.', icon: Shield },
  { title: 'روابط تقييم مؤمّنة وذات استخدام واحد', body: 'كل مقيّم يحصل على رابط مخصص لا يُستخدم إلا مرة واحدة، مرتبط بهويته وعلاقته بالمرشح، مما يُحصّن العملية من أي تلاعب.', icon: Lock },
  { title: 'كشف التقييمات المتطرفة تلقائياً', body: 'المنظومة ترصد أي تقييم خارج النطاق الطبيعي وتعرضه للجنة الحوكمة مع مؤشر واضح، مما يُحمي النتيجة من التأثيرات الفردية.', icon: CheckCircle2 },
  { title: 'التحقق من المبادرات عبر المقيّمين', body: 'الشواهد والمبادرات لا تُقبل بمجرد ذكرها — بل يتحقق منها المقيّمون مما يمنع المبالغة ويضمن مصداقية الملف.', icon: CheckCircle2 },
  { title: 'مستوى الثقة — مؤشر مستقل عن الدرجة', body: 'كل بطاقة قيادية تحمل درجتين: درجة الجاهزية ودرجة الثقة في مصادر التقييم. هذا يُعطي متخذ القرار صورة أشمل وأدق.', icon: Shield },
  { title: 'سجل حوكمة محمي من الحذف', body: 'كل إجراء وكل قرار يُسجَّل تلقائياً في سجل حوكمة لا يُحذف، مما يُؤسس لمرجعية مؤسسية يُعتمد عليها.', icon: Lock },
];

const CYCLE = [
  { label: 'الموظف يقترح', sub: '١٥ اسماً' },
  { label: 'اللجنة تعتمد', sub: '٧–١٠ مقيّمين' },
  { label: 'رابط مؤمَّن', sub: 'مرة واحدة فقط' },
  { label: 'الذكاء الاصطناعي يحلل', sub: 'ويكشف التطرف' },
  { label: 'اللجنة تُقرّ', sub: 'سلامة العملية' },
  { label: 'القيادة تقرر', sub: 'بسند موثق' },
];

export default function AntiBiasPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          حماية القرار القيادي
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          كيف تحمي منصة جدير<br />
          <span className="text-gold-400">قرار القيادة العليا؟</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          القرار القيادي الصحيح لا يحتاج فقط إلى حكمة صاحبه —
          بل إلى <strong className="text-gold-300">بنية منهجية تحميه من الطعن وتمنحه السند الموضوعي.</strong>
        </p>
      </section>

      {/* ─── الضمانات الستة ─── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">٦ ضمانات تحمي سلامة العملية</h2>
          <p className="text-white/50 text-sm">بُنيت لتُعطي متخذ القرار سنداً لا يُطعن فيه</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {GUARANTEES.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-gold-400/20 transition flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{g.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{g.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── دورة ضمان الجودة ─── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">دورة ضمان سلامة التقييم</h2>
          <p className="text-white/50 text-sm">كل مرحلة مُصمَّمة لتُعزز موثوقية المرحلة التالية</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CYCLE.map((step, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="h-8 w-8 rounded-full bg-gold-500/20 text-gold-300 text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {i + 1}
              </div>
              <div className="font-bold text-white text-sm">{step.label}</div>
              <div className="text-xs text-white/50 mt-0.5">{step.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── الرسالة الختامية ─── */}
      <section className="text-center bg-gradient-to-br from-primary-700/30 to-transparent border border-primary-400/20 rounded-3xl p-10">
        <Shield className="h-12 w-12 text-gold-400 mx-auto mb-5" />
        <h2 className="text-2xl font-bold text-white mb-4">
          القرار يبقى بيد القيادة — دائماً
        </h2>
        <p className="text-white/65 max-w-2xl mx-auto leading-relaxed text-base">
          الهدف من هذه المنظومة ليس الحكم على الموظف — بل تزويد متخذ القرار بأعمق وأدق الملفات التحليلية
          الممكنة، لتصدر قراراته مُحصَّنة بالبيانات، مُدعَّمة بالحوكمة، جاهزة للمحاسبة.
        </p>
        <Link href="/executive-center/system-preview"
          className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 font-bold transition group">
          شاهد النظام من الداخل
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
