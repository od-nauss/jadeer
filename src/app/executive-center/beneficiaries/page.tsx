import Link from 'next/link';
import { ChevronLeft, Users, Building2, Briefcase, ShieldCheck, GraduationCap, Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';

const BENEFICIARIES = [
  {
    icon: Crown,
    tag: 'المستفيد الأول والأساسي',
    title: 'القيادة العليا',
    tagline: 'رؤية أوسع — قرار أرسخ — إرث أعمق',
    color: 'from-gold-500/20 to-gold-700/5',
    borderColor: 'border-gold-400/40',
    tagColor: 'bg-gold-500/20 text-gold-300 border-gold-400/30',
    benefits: [
      { title: 'رؤية بانورامية للكفاءات', desc: 'تملك صورة كاملة عن كل الكفاءات الجاهزة والواعدة داخل المنظمة — في لحظة واحدة.' },
      { title: 'ملف تحليلي لكل قرار', desc: 'كل مرشح يصلك بملف موثق يضم الجاهزية، الثقة، الملاءمة التنظيمية — يُعزز حكمتك ويُوثّق اختيارك.' },
      { title: 'اكتشاف الكفاءات غير المرئية', desc: 'الكفاءات الاستثنائية التي لم تصل بعد إلى دائرة الضوء — تصلك بالأدلة، لا بالصدفة.' },
      { title: 'خريطة التعاقب الوظيفي', desc: 'قبل أن يحدث أي فراغ قيادي، أنت تعرف بالضبط من الجاهز وأين.' },
      { title: 'تحصين القرار من الطعن', desc: 'كل تكليف يصدر مدعوماً بسند تحليلي لا يُطعن فيه — قرار موثق ومحمي.' },
    ],
    message: 'منصة جدير لا تحل محل حكمة القيادة — بل تُزودها بأعمق رؤية ممكنة لتجعل كل قرار أكثر رسوخاً وأبعد أثراً.',
  },
  {
    icon: Users,
    tag: 'المستفيد الثاني',
    title: 'الموظف المتقدم',
    tagline: 'فرصة حقيقية — مسار واضح — أثر موثق',
    color: 'from-primary-700/20 to-primary-900/5',
    borderColor: 'border-primary-400/30',
    tagColor: 'bg-primary-500/20 text-primary-200 border-primary-400/30',
    benefits: [
      { title: 'قناة رسمية عادلة', desc: 'مسار واضح لكل موظف مؤهل يرغب في إثبات جاهزيته القيادية — بلا واسطة ولا عشوائية.' },
      { title: 'عرض الإنجازات بمنهجية', desc: 'كل مبادرة وأثر موثق يُعرض أمام القيادة بطريقة احترافية موثوقة.' },
      { title: 'تقييم موضوعي متعدد المصادر', desc: 'ليس الرأي الواحد ولا الانطباع — بل بيانات متنوعة من دائرة ثقة معتمدة.' },
      { title: 'خطة تطوير فردية', desc: 'لا يخرج أي موظف من العملية خالي الوفاض — حتى غير الجاهز يحصل على خارطة طريق للنمو.' },
    ],
    message: 'الموظف المتميز يستحق أكثر من مجرد العمل الجيد — يستحق أن يُرى ويُسمع ويُقدَّر بالأدلة.',
  },
  {
    icon: GraduationCap,
    tag: 'المستفيد الثالث',
    title: 'الموارد البشرية',
    tagline: 'شراكة استراتيجية — قرارات مبنية على البيانات',
    color: 'from-sage/15 to-transparent',
    borderColor: 'border-sage/30',
    tagColor: 'bg-sage/15 text-green-200 border-sage/25',
    benefits: [
      { title: 'فهم الفجوات القيادية بدقة', desc: 'معرفة المهارات التي تتكرر كفجوة — لتوجيه البرامج التدريبية نحو الاحتياج الحقيقي.' },
      { title: 'ربط التقييم بالتطوير', desc: 'كل بطاقة قيادية تُولّد خطة تطوير — تحوّل الموارد البشرية من مسؤول توظيف إلى شريك تطوير.' },
      { title: 'بيانات موثوقة للتخطيط', desc: 'قاعدة بيانات قيادية حية تُغذّي قرارات التخطيط الاستراتيجي للموارد البشرية.' },
    ],
    message: 'الموارد البشرية أصبحت شريكاً استراتيجياً لا مجرد وحدة تشغيلية.',
  },
  {
    icon: ShieldCheck,
    tag: 'المستفيد الرابع',
    title: 'لجنة الحوكمة',
    tagline: 'أدوات العدالة — سلطة المراجعة — حماية النزاهة',
    color: 'from-steelblue/15 to-transparent',
    borderColor: 'border-steelblue/30',
    tagColor: 'bg-steelblue/15 text-blue-200 border-steelblue/25',
    benefits: [
      { title: 'اعتماد المقيّمين وضمان تنوعهم', desc: 'اللجنة هي المرجعية الحاكمة لمن يُقيّم — تنوع المصادر يُعزز النزاهة ويحمي القرار.' },
      { title: 'أدوات كشف التحيز', desc: 'المنصة تُعطي اللجنة كاشفاً تلقائياً لأي تقييم متطرف أو مشبوه.' },
      { title: 'سجل حوكمة لا يُحذف', desc: 'كل إجراء موثق بصاحبه ووقته — مرجعية مؤسسية ترتكز عليها قرارات الغد.' },
    ],
    message: 'لجنة الحوكمة هي صمام العدالة في المنظومة — والمنصة تُزودها بأدوات لا تُضاهى.',
  },
  {
    icon: Building2,
    tag: 'المستفيد الخامس',
    title: 'المنظمة ككل',
    tagline: 'استدامة القيادة — حماية المستقبل المؤسسي',
    color: 'from-white/5 to-transparent',
    borderColor: 'border-white/15',
    tagColor: 'bg-white/10 text-white/60 border-white/15',
    benefits: [
      { title: 'حماية الاستمرارية القيادية', desc: 'لا تُفاجأ المنظمة بفراغ قيادي — صف ثانٍ وثالث جاهز في كل وحدة حرجة.' },
      { title: 'رفع مستوى الثقة المؤسسية', desc: 'حين يرى الموظفون أن الفرص موضوعية وعادلة، يرتفع الانتماء والولاء.' },
      { title: 'مرجعية قيادية تتراكم عبر الزمن', desc: 'قاعدة بيانات قيادية حية تُبنى دورة بعد دورة — تراكم مؤسسي لا يُشترى.' },
    ],
    message: 'المنظمة التي تستثمر في قياديّيها بمنهجية اليوم — تقود قطاعها غداً.',
  },
];

export default function BeneficiariesPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          قيمة مشتركة — مستويات متعددة
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          من يستفيد من <span className="text-gold-400">منصة جدير؟</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          منصة جدير لا تخدم طرفاً واحداً — بل تُبني منظومة متكاملة
          تُعزز <strong className="text-gold-300">قرار القيادة، وعدالة الموظف، واستدامة المنظمة.</strong>
        </p>
      </section>

      {/* ─── المستفيدون ─── */}
      <div className="space-y-6">
        {BENEFICIARIES.map((b, i) => (
          <div key={i}
            className={`bg-gradient-to-br ${b.color} border ${b.borderColor} rounded-2xl overflow-hidden`}>
            {/* رأس البطاقة */}
            <div className="px-7 pt-6 pb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl border ${b.borderColor} bg-white/5 flex items-center justify-center flex-shrink-0`}>
                  <b.icon className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <div className={`inline-block text-xs font-bold border rounded-full px-3 py-0.5 mb-1 ${b.tagColor}`}>
                    {b.tag}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{b.title}</h2>
                  <p className="text-sm text-gold-300/80 mt-0.5">{b.tagline}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gold-400/20 flex-shrink-0 hidden md:block">
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* المحتوى */}
            <div className="px-7 pb-7 grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {b.benefits.map((ben, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm">{ben.title}: </span>
                      <span className="text-sm text-white/65 leading-relaxed">{ben.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`bg-gradient-to-br from-gold-500/10 to-transparent border-r-4 border-gold-400/50 rounded-xl p-5 self-start`}>
                <p className="text-gold-200/90 leading-loose text-sm italic">"{b.message}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── الخلاصة ─── */}
      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          منظومة تُعزز الجميع — وتُبقي القرار <span className="text-gold-400">بيد القيادة دائماً</span>
        </h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          حين تنتفع كل الأطراف من المنظومة بنفس القدر — يرتفع الانتماء، وتتعزز النزاهة، وتُصبح الاستدامة حقيقة لا وعداً.
        </p>
        <Link href="/executive-center/how-it-works"
          className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200 font-bold transition group">
          كيف تسير العملية من البداية إلى النهاية؟
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
