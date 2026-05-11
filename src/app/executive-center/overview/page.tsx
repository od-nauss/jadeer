import Link from 'next/link';
import { ArrowLeft, Target, Brain, ShieldCheck, Award, TrendingUp, Users, Zap, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ExecutiveOverview() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* الافتتاحية التشويقية */}
      <section className="text-center py-8">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold tracking-wider mb-6">
          جامعة نايف العربية للعلوم الأمنية &middot; مركز العرض التنفيذي
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          كيف تعرف أن الشخص الصحيح<br />
          <span className="text-gold-400">في المكان الصحيح؟</span>
        </h1>
        <p className="text-xl text-white/75 max-w-3xl mx-auto leading-relaxed mb-4">
          في معظم المنظمات، تُبنى قرارات القيادة على الانطباع الشخصي، سنوات الخبرة، أو من يعرف من.
          النتيجة؟ قادة في غير مكانهم، وكفاءات حقيقية مخفية لم تُكتشف بعد.
        </p>
        <p className="text-2xl font-bold text-gold-300 mb-10">منصة جدير تغيّر هذه المعادلة كلياً.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/executive-center/why" className="btn-gold px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            لماذا نحتاجها؟ <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/executive-center/urgency"
            className="border border-gold-400/50 text-gold-200 hover:bg-white/5 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
            <Award className="h-4 w-4" /> شاهد البطاقة القيادية
          </Link>
        </div>
      </section>

      {/* جدير في جملة واحدة */}
      <section className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-8 md:p-12 text-center">
        <p className="text-2xl md:text-3xl text-white leading-relaxed font-light">
          منصة جدير هي المنظومة الأولى من نوعها التي{' '}
          <span className="text-gold-400 font-bold">تحوّل تقييم القيادة</span>{' '}
          من رأي شخصي إلى{' '}
          <span className="text-gold-400 font-bold">بطاقة قيادية موثّقة</span>{' '}
          مبنية على 7 محاور، تقييم 360°، وتحليل ذكاء اصطناعي، تحت إشراف لجنة حوكمة مستقلة.
        </p>
      </section>

      {/* الأهداف الستة */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">ماذا تحقق جدير؟</h2>
          <p className="text-white/60">ستة أهداف استراتيجية تحلّ إشكاليات حقيقية</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Target, title: 'اكتشاف القادة المخفيين', desc: 'الكفاءات الحقيقية لا تصل دائماً للواجهة — جدير تجعلها مرئية بآلية موضوعية لا تعتمد على المعارف.', color: 'text-gold-400', bg: 'bg-gold-400/10' },
            { icon: ShieldCheck, title: 'قرارات تكليف مدعومة بالبيانات', desc: 'بدلاً من "أتوقع أنه مناسب" — ستقول "نسبة جاهزيته 87% وهذا توثيقها".', color: 'text-primary-300', bg: 'bg-primary-300/10' },
            { icon: Users, title: 'تكافؤ الفرص', desc: 'كل موظف يستطيع التقديم وإثبات نفسه بغض النظر عن موقعه أو علاقاته.', color: 'text-sage', bg: 'bg-sage/10' },
            { icon: TrendingUp, title: 'بناء الصف القيادي الثاني', desc: 'تعرّف مسبقاً على من سيكون جاهزاً للقيادة بعد سنة أو سنتين — خطط ولا تفاجأ.', color: 'text-steelblue', bg: 'bg-steelblue/10' },
            { icon: Brain, title: 'تحليل ذكي لا بشري', desc: 'الذكاء الاصطناعي يحلل الأنماط عبر آلاف نقاط البيانات ويصدر توصية موضوعية لا يستطيعها الإنسان وحده.', color: 'text-purple-300', bg: 'bg-purple-400/10' },
            { icon: Zap, title: 'استدامة مؤسسية', desc: 'بناء قاعدة بيانات قيادية حيّة تتجدد مع كل دورة تقييم — لن تُفاجأ بفراغ قيادي.', color: 'text-amber-300', bg: 'bg-amber-400/10' },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-400/30 rounded-2xl p-6 transition-all">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} mb-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المسار بصرياً */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">المسار في لمحة</h2>
          <p className="text-white/60">من التقديم إلى البطاقة القيادية</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: '1', label: 'الموظف يقدّم ملفه',      sub: 'ملف + مبادرات + KPIs', color: 'bg-primary-600' },
            { n: '2', label: 'التقييم متعدد المصادر',  sub: 'اختبارات + 360° + AI', color: 'bg-gold-600' },
            { n: '3', label: 'مراجعة الحوكمة',         sub: 'اللجنة تعتمد أو ترفض', color: 'bg-steelblue' },
            { n: '4', label: 'البطاقة القيادية',        sub: 'نتيجة موثقة رسمياً',  color: 'bg-sage' },
          ].map((step) => (
            <div key={step.n} className="text-center">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-white text-2xl font-bold mb-3 mx-auto block`}>
                {step.n}
              </div>
              <div className="font-bold text-white text-sm mb-1">{step.label}</div>
              <div className="text-xs text-white/50">{step.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* الأرقام */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '7',    label: 'محاور تقييم',         sub: 'بأوزان مختلفة' },
          { value: '15',   label: 'مقيّماً في الـ 360°', sub: 'معتمدون من اللجنة' },
          { value: '9',    label: 'مصادر بيانات',         sub: 'تُغذّي التحليل' },
          { value: '100%', label: 'شفافية',               sub: 'كل قرار موثق' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-2xl p-5 text-center">
            <div className="text-4xl font-bold text-gold-400 mb-1">{stat.value}</div>
            <div className="font-bold text-white text-sm">{stat.label}</div>
            <div className="text-xs text-white/50 mt-1">{stat.sub}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center pt-4">
        <p className="text-white/50 text-sm mb-4">ابدأ بالسؤال الأهم</p>
        <Link href="/executive-center/why"
          className="inline-flex items-center gap-3 text-gold-300 hover:text-gold-200 font-bold text-lg transition group">
          لماذا منظمتك تحتاج هذا الآن؟
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
