import Link from 'next/link';
import { Clock, TrendingUp, Users, Brain, ShieldCheck, Zap, AlertTriangle, ChevronLeft, Star, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

const URGENCY_POINTS = [
  {
    icon: Clock,
    title: 'كل شهر بلا نظام = كفاءة مخفية قد لا تُكتشف',
    desc: 'القادة المخفيون موجودون الآن في المنظمة. كل يوم يمر دون آلية اكتشاف هو يوم ضائع من إمكاناتهم.',
  },
  {
    icon: AlertTriangle,
    title: 'قرارات التكليف تحتاج بيانات لا انطباعات',
    desc: 'الانطباع الشخصي لا يُلغى، لكن يمكن تعزيزه بملفات موثقة وتحليل متعدد المصادر تجعل القرار أكثر دفاعاً.',
  },
  {
    icon: TrendingUp,
    title: 'الرؤية المستمرة أفضل من الجرد الموسمي',
    desc: 'منصة جدير تمنح القيادة رؤية حية للكفاءات — ليس تقريراً سنوياً واحداً يُنسى في الأدراج.',
  },
  {
    icon: Brain,
    title: 'القيادات المخفية لا تظهر في الاجتماعات',
    desc: 'من يقود التغيير الحقيقي في المنظمة لا يُرى دائماً في الصف الأمامي. جدير تجعله مرئياً بالأدلة.',
  },
  {
    icon: Users,
    title: 'الموظف المتميز يحتاج قناة عادلة لإثبات نفسه',
    desc: 'إذا لم توجد آلية عادلة للظهور، سيرى الموظف المتميز أن الترقي مرتبط بالمعرفة الشخصية فقط — وهذا يهدد الولاء.',
  },
  {
    icon: ShieldCheck,
    title: 'المنظمة تحتاج بدائل جاهزة قبل الحاجة إليها',
    desc: 'الخطط تُبنى قبل الحاجة لا بعدها. خريطة التعاقب الوظيفي في جدير جاهزة لأي تغيير مفاجئ.',
  },
  {
    icon: Zap,
    title: 'التطوير القيادي يبدأ بالقياس',
    desc: 'لا يمكن تطوير ما لا يُقاس. جدير تحوّل الجاهزية القيادية من انطباع ذاتي إلى ملف موثق قابل للتحسين.',
  },
  {
    icon: Star,
    title: 'عدالة الفرص تُولد ثقة مؤسسية',
    desc: 'حين يرى الموظفون أن فرصهم مبنية على الجدارة والموضوعية، يرتفع مستوى الالتزام والانتماء.',
  },
];

export default function UrgencyPage() {
  return (
    <div className="space-y-14 max-w-5xl mx-auto" dir="rtl">

      {/* الافتتاحية */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          لماذا الآن تحديداً؟
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          القيمة العاجلة <span className="text-gold-400">لاعتماد جدير</span>
        </h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
          كل منظمة كبيرة تملك كفاءات. الفرق بين منظمة وأخرى هو{' '}
          <span className="text-gold-300 font-bold">سرعة اكتشاف هذه الكفاءات، وعدالة تقييمها، وحسن توظيفها في الوقت المناسب.</span>
        </p>
      </section>

      {/* نقاط القيمة العاجلة */}
      <section className="grid md:grid-cols-2 gap-5">
        {URGENCY_POINTS.map((point, idx) => (
          <div key={idx} className="flex gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-gold-400/20 rounded-2xl p-5 transition-all group">
            <div className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-gold-400/10">
              <point.icon className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1.5 group-hover:text-gold-300 transition leading-tight">{point.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{point.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* لحظة التحول */}
      <section className="bg-gradient-to-br from-primary-700/40 to-primary-900/40 border border-primary-400/20 rounded-3xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          منصة جدير تحوّل الجاهزية القيادية من انطباع إلى ملف موثق
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="text-center text-sm font-bold text-rose-300 mb-4 bg-rose-400/10 border border-rose-400/20 rounded-xl py-2">
              قبل منصة جدير
            </div>
            {[
              'ترشيحات شخصية ومعرفة محدودة',
              'رؤية مقيدة بالحضور الإداري',
              'بيانات متفرقة وغير مترابطة',
              'غياب تقييم متعدد المصادر',
              'قرارات تكليف بلا توثيق',
              'فراغ قيادي مفاجئ بلا بدائل',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="text-center text-sm font-bold text-sage mb-4 bg-sage/10 border border-sage/20 rounded-xl py-2">
              مع منصة جدير
            </div>
            {[
              'تقديم مفتوح لكل الموظفين بعدالة',
              'تحليل ذكي يكشف القيادات المخفية',
              'حوكمة مستقلة وتوثيق كامل',
              'تقييم 360° من دائرة ثقة متنوعة',
              'بطاقة قيادية موثقة وقابلة للمراجعة',
              'خريطة تعاقب جاهزة قبل الحاجة إليها',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-sage flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الخاتمة القوية */}
      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          اعتماد منصة جدير ليس مشروعاً تقنياً فقط
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
          بل خطوة مؤسسية لبناء{' '}
          <span className="text-gold-300 font-bold">عدالة الفرص، واستدامة القيادة، ورفع جودة القرار.</span>
        </p>
        <Link href="/executive-center/decision"
          className="inline-flex items-center gap-3 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-8 py-4 rounded-2xl text-base transition-all group">
          شاهد القرار المطلوب
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
