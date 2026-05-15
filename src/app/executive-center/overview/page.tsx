import Link from 'next/link';
import { ArrowLeft, ChevronLeft, Star, Shield, TrendingUp, Users, Brain, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ExecutiveOverview() {
  return (
    <div className="space-y-20 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية — تعظيم القائد ─── */}
      <section className="text-center py-10">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-6 py-2 text-gold-300 text-sm font-bold tracking-wider mb-8">
          جامعة نايف العربية للعلوم الأمنية &mdash; مركز العرض التنفيذي
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          منصة <span className="text-gold-400">جدير</span>
        </h1>
        <p className="text-xl md:text-2xl text-gold-200 font-light mb-4">
          لتحليل الجاهزية القيادية وبناء قيادات المستقبل
        </p>

        {/* الرسالة الافتتاحية — بلغة تُعظّم القائد */}
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white/5 border border-gold-400/20 rounded-3xl">
          <p className="text-lg text-white/85 leading-loose text-right">
            القيادات الاستثنائية لا تُبنى بالحظ — بل بمنظومة مدروسة تُعطي كل كفاءة حقها من الفرصة.
            منصة جدير تُزوّد متخذ القرار برؤية تحليلية شاملة تُعزز حكمته وتُوثّق خياراته،
            فيصدر قراره مدعوماً بالبيانات، محمياً بالحوكمة، مُسجَّلاً للتاريخ.
          </p>
          <p className="text-base text-gold-300/80 mt-4 text-right font-medium">
            الأداة لا تحكم — القيادة تحكم. الأداة تُنير — القيادة تقرر.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link href="/executive-center/why"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-7 py-3.5 rounded-xl transition-all">
            لماذا منظمتك تحتاجها؟ <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/executive-center/demo-models"
            className="inline-flex items-center gap-2 border border-gold-400/50 text-gold-200 hover:bg-white/5 px-7 py-3.5 rounded-xl transition">
            مشاهدة النماذج التجريبية
          </Link>
        </div>
      </section>

      {/* ─── المنصة في جملة ─── */}
      <section className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-8 md:p-12 text-center">
        <p className="text-xl md:text-2xl text-white leading-relaxed font-light">
          منصة جدير هي المنظومة الأولى من نوعها التي{' '}
          <span className="text-gold-400 font-bold">تُحوّل تقييم الجاهزية القيادية</span>{' '}
          من انطباع شخصي إلى{' '}
          <span className="text-gold-400 font-bold">بطاقة موثقة ومعتمدة</span>{' '}
          تُبنى على 7 محاور، وتقييم 360°، وتحليل ذكاء اصطناعي — تحت إشراف لجنة حوكمة مستقلة.
        </p>
      </section>

      {/* ─── المحاور الستة للقيمة ─── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">ماذا تُحقق جدير للمنظمة؟</h2>
          <p className="text-white/50">ست قيم مؤسسية تُعالج إشكاليات حقيقية</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Star,
              color: 'text-gold-400', bg: 'bg-gold-400/10',
              title: 'اكتشاف الكفاءات المخفية',
              desc: 'المنظمات الكبيرة تحمل ثروات بشرية لم تصل بعد إلى دائرة الضوء. جدير تُسهم في استثمار هذا الثراء المؤسسي.',
            },
            {
              icon: Shield,
              color: 'text-primary-300', bg: 'bg-primary-300/10',
              title: 'تحصين قرار التكليف',
              desc: 'كل قرار يصدر بسند تحليلي موثق يمنحه مشروعية أعمق أمام المؤسسة والجهات الرقابية.',
            },
            {
              icon: Users,
              color: 'text-sage', bg: 'bg-sage/10',
              title: 'رفع العدالة المؤسسية',
              desc: 'منح كل موظف قناة رسمية مشروعة لإثبات جاهزيته، مما يرفع الانتماء والولاء المؤسسي.',
            },
            {
              icon: TrendingUp,
              color: 'text-steelblue', bg: 'bg-steelblue/10',
              title: 'بناء الصف القيادي الثاني',
              desc: 'المنظمة التي تعرف مسبقاً من سيقود غداً لا تُفاجأ بالفراغ القيادي.',
            },
            {
              icon: Brain,
              color: 'text-purple-300', bg: 'bg-purple-400/10',
              title: 'تعزيز الحكمة بالبيانات',
              desc: 'الذكاء الاصطناعي لا يستبدل الحكمة القيادية — بل يُضيف إليها طبقة تحليلية دقيقة تدعمها.',
            },
            {
              icon: Target,
              color: 'text-amber-300', bg: 'bg-amber-400/10',
              title: 'الاستدامة المؤسسية',
              desc: 'بناء قاعدة بيانات قيادية حية تتجدد مع كل دورة، فلا يتوقف المسار بتغيّر الوجوه.',
            },
          ].map((item) => (
            <div key={item.title}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-400/30 rounded-2xl p-6 transition-all group">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} mb-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="font-bold text-white mb-2 group-hover:text-gold-300 transition">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── المسار في أربع خطوات ─── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">دورة التقييم — من التقديم إلى البطاقة</h2>
          <p className="text-white/50">مسار منهجي متكامل يضمن موضوعية النتيجة وشفافية الإجراء</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: '1', label: 'يُقدّم الموظف ملفه', sub: 'مبادرات · مؤشرات · اختبارات ذكية', color: 'bg-primary-600' },
            { n: '2', label: 'تقييم متعدد المصادر', sub: '360° · تحليل الذكاء الاصطناعي', color: 'bg-gold-600' },
            { n: '3', label: 'مراجعة الحوكمة', sub: 'التحقق من سلامة الإجراء', color: 'bg-steelblue' },
            { n: '4', label: 'البطاقة القيادية', sub: 'نتيجة موثقة · خطة تطوير · ملاءمة تنظيمية', color: 'bg-sage' },
          ].map((step) => (
            <div key={step.n} className="text-center group">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-white text-2xl font-bold mb-3 mx-auto block transition group-hover:scale-105`}>
                {step.n}
              </div>
              <div className="font-bold text-white text-sm mb-1">{step.label}</div>
              <div className="text-xs text-white/50 leading-relaxed">{step.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── الأرقام الجوهرية ─── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '7', label: 'محاور تقييم', sub: 'بأوزان علمية مدروسة' },
          { value: '15', label: 'مقيّماً في 360°', sub: 'تعتمدهم لجنة الحوكمة' },
          { value: '9', label: 'مصادر بيانات', sub: 'تُغذّي التحليل الذكي' },
          { value: '100٪', label: 'شفافية', sub: 'كل قرار موثق' },
        ].map((stat) => (
          <div key={stat.label}
            className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-2xl p-5 text-center hover:border-gold-400/40 transition">
            <div className="text-4xl font-bold text-gold-400 mb-1">{stat.value}</div>
            <div className="font-bold text-white text-sm">{stat.label}</div>
            <div className="text-xs text-white/50 mt-1">{stat.sub}</div>
          </div>
        ))}
      </section>

      {/* ─── CTA ─── */}
      <section className="text-center pt-4 pb-8">
        <p className="text-white/40 text-sm mb-5">تصفّح الأقسام للاطلاع على التفاصيل الكاملة</p>
        <Link href="/executive-center/why"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          ابدأ برؤية الفرصة الكاملة
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
