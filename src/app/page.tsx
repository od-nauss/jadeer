import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Target,
  Users,
  ShieldCheck,
  TrendingUp,
  Brain,
  Award,
  CheckCircle2,
  ArrowLeft,
  Star,
  Building2,
  UserCheck,
  BarChart3,
  FileText,
  Eye,
  Lightbulb,
  ChevronLeft,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/current-user';
import { ROLES } from '@/lib/auth/roles';
import { PublicHeader, PublicFooter } from '@/components/layout/PublicLayout';
import { UniversityLogo } from '@/components/branding/Logo';

export const dynamic = 'force-dynamic';

// ── رحلة الموظف — 7 مراحل ────────────────────────────────────────────────
const JOURNEY_STEPS = [
  {
    num: '١',
    title: 'الملف القيادي',
    desc: 'تعبئة بيانات المسيرة المهنية، الشهادات، الإنجازات، وسمات القيادة الذاتية.',
    icon: FileText,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
  },
  {
    num: '٢',
    title: 'المبادرات والإنجازات',
    desc: 'توثيق المشاريع التي قادها الموظف، تأثيرها على المنظمة، وشهادات داعمة.',
    icon: Lightbulb,
    color: 'text-gold-700',
    bg: 'bg-gold-50',
    border: 'border-gold-200',
  },
  {
    num: '٣',
    title: 'مؤشرات الأداء',
    desc: 'تحميل KPIs الموثقة وتقارير الأداء السنوية كأدلة قابلة للقياس.',
    icon: BarChart3,
    color: 'text-steelblue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    num: '٤',
    title: 'الاختبارات الذكية',
    desc: 'اختبارات تكيفية تقيس التفكير الاستراتيجي، صنع القرار، واليقظة القيادية.',
    icon: Brain,
    color: 'text-sage',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    num: '٥',
    title: 'دائرة الثقة — تقييم 360°',
    desc: 'تقييم سري من 15 مقيماً تختارهم اللجنة من مستويات مختلفة داخل المنظمة.',
    icon: Users,
    color: 'text-wine',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  {
    num: '٦',
    title: 'البطاقة القيادية',
    desc: 'نتيجة موثقة تتضمن درجة الجاهزية، نوع القيادة، نقاط القوة، والفجوات.',
    icon: Award,
    color: 'text-gold-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    num: '٧',
    title: 'خطة التطوير',
    desc: 'خطة مخصصة لسد الفجوات وتسريع مسار القيادة بناءً على نتائج التقييم.',
    icon: TrendingUp,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
  },
];

// ── المستفيدون ────────────────────────────────────────────────────────────
const BENEFICIARIES = [
  {
    icon: Star,
    title: 'القيادة العليا',
    desc: 'رؤية أوضح للمرشحين، وقرارات تكليف مدعومة بالبيانات بدل الانطباعات.',
    color: 'text-gold-700',
    bg: 'bg-gold-50',
  },
  {
    icon: UserCheck,
    title: 'الموظف المتقدم',
    desc: 'فرصة عادلة وشفافة لإثبات القدرات والأثر أمام الجميع دون وساطة.',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Building2,
    title: 'الموارد البشرية',
    desc: 'خطط تطوير مبنية على فجوات حقيقية، لا على تقييمات انطباعية.',
    color: 'text-steelblue',
    bg: 'bg-blue-50',
  },
  {
    icon: ShieldCheck,
    title: 'لجنة الحوكمة',
    desc: 'ضبط العدالة، اعتماد المقيمين، توثيق القرارات بأثر رجعي كامل.',
    color: 'text-sage',
    bg: 'bg-emerald-50',
  },
];

// ── مزايا الحوكمة ─────────────────────────────────────────────────────────
const GOVERNANCE_FEATURES = [
  'لا اعتماد لأي تصنيف دون مراجعة لجنة الحوكمة',
  'كشف التحيز ومنع تضارب المصالح تلقائياً',
  'سجل تدقيق كامل لا يمكن حذفه أو تعديله',
  'تقييم 360 من دائرة معتمدة ومختارة باستقلالية',
  'الشفافية الكاملة للمتقدم في كل مرحلة',
  'آلية تظلم رسمية ومتابعة موثقة',
];

export default async function HomePage() {
  // إذا كان المستخدم مسجلاً → وجّهه لصفحته مباشرة
  const user = await getCurrentUser();
  if (user) {
    const homePath = ROLES[user.primaryRole]?.homePath;
    redirect(homePath ?? '/candidate/dashboard');
  }

  return (
    <div className="min-h-screen bg-ivory" dir="rtl">
      <PublicHeader />

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white">
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-300/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          {/* شعار الجامعة */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
              <UniversityLogo size="md" />
            </div>
          </div>

          {/* اسم المنصة */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            منصة <span className="text-gold-400">جدير</span>
          </h1>

          {/* الشعار النصي */}
          <p className="text-xl md:text-2xl text-gold-200 font-medium mb-6">
            لتحليل الجاهزية وبناء قيادات المستقبل
          </p>

          {/* وصف مختصر */}
          <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-10">
            منصة مؤسسية ذكية تمنح كل موظف فرصة عادلة لإثبات جاهزيته القيادية،
            وتزود القيادة العليا برؤية موثقة وشفافة لاكتشاف القادة وبناء قرارات
            التكليف على أسس بيانية لا انطباعية.
          </p>

          {/* أزرار CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-gold px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-gold-900/20 flex items-center gap-2"
            >
              ابدأ رحلتك القيادية
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link
              href="/executive-center/login"
              className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gold-400/50 text-gold-200 hover:bg-gold-400/10 hover:border-gold-300 transition-all flex items-center gap-2"
            >
              <Eye className="h-5 w-5" />
              استعراض العرض التنفيذي
            </Link>
          </div>

          {/* إحصائيات سريعة */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '٧', label: 'محاور تقييم' },
              { value: '٣٦٠°', label: 'تقييم شامل' },
              { value: '١٥', label: 'مقيّم معتمد' },
              { value: '١٠٠٪', label: 'شفافية كاملة' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-400 mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* موجة سفلية */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-ivory" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          الفكرة العامة
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-gold-600 bg-gold-50 border border-gold-200 px-4 py-1.5 rounded-full mb-4">
              الفكرة العامة
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
              ماذا تحل منصة جدير؟
            </h2>
            <div className="gold-divider max-w-xs mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="institutional-card p-6 border-r-4 border-wine">
                <h3 className="font-bold text-wine text-lg mb-2">المشكلة</h3>
                <p className="text-darkgray leading-relaxed">
                  قرارات القيادة تُبنى على الانطباعات الشخصية، الترشيحات التقليدية،
                  أو المعارف — لا على بيانات موثقة وعادلة. يُضيع ذلك كفاءات حقيقية
                  ويُقدّم آخرين لا يستحقون.
                </p>
              </div>
              <div className="institutional-card p-6 border-r-4 border-primary-600">
                <h3 className="font-bold text-primary-700 text-lg mb-2">الحل</h3>
                <p className="text-darkgray leading-relaxed">
                  منصة جدير تجمع في مسار واحد: ملف قيادي + مبادرات + مؤشرات أداء +
                  اختبارات ذكية + تقييم 360° + تحليل ذكي + قرار حوكمي = بطاقة قيادية
                  موثقة وقابلة للطعن والمراجعة.
                </p>
              </div>
            </div>

            <div className="institutional-card p-8 bg-gradient-to-br from-primary-700 to-primary-900 text-white rounded-2xl">
              <h3 className="text-xl font-bold text-gold-300 mb-6">المعادلة الجوهرية</h3>
              <div className="space-y-3 text-sm">
                {[
                  'ملف قيادي موثق',
                  'مبادرات وإنجازات مثبتة',
                  'مؤشرات أداء قابلة للقياس',
                  'اختبارات ذكية متكيفة',
                  'تقييم 360° من دائرة الثقة',
                  'تحليل ذكي مساعد',
                  'قرار حوكمي معتمد',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
                    <span className="text-white/85">{item}</span>
                    {i < 6 && <ChevronLeft className="h-3 w-3 text-gold-500/50 mr-auto" />}
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-gold-400/30 flex items-center gap-3">
                  <Award className="h-6 w-6 text-gold-400 shrink-0" />
                  <span className="font-bold text-gold-300 text-base">= بطاقة قيادية موثقة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          الرؤية والرسالة والأهداف
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-primary-50/50 to-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* الرؤية */}
            <div className="institutional-card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-5 mx-auto">
                <Eye className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">الرؤية</h3>
              <div className="gold-divider mb-4" />
              <p className="text-darkgray leading-relaxed text-sm">
                أن تكون جامعة نايف العربية للعلوم الأمنية رائدة في بناء القيادات
                المؤسسية عبر منهجية علمية موثوقة وشفافة، تكتشف القادة الظاهرين
                والمخفيين على حد سواء.
              </p>
            </div>

            {/* الرسالة */}
            <div className="institutional-card p-8 text-center hover:shadow-lg transition-shadow md:scale-105 md:shadow-md">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 mb-5 mx-auto">
                <Target className="h-8 w-8 text-gold-700" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">الرسالة</h3>
              <div className="gold-divider mb-4" />
              <p className="text-darkgray leading-relaxed text-sm">
                تمكين كل موظف من إثبات جاهزيته القيادية بطريقة عادلة وشفافة،
                وتزويد القيادة العليا ببيانات دقيقة وموثقة لدعم قرارات التكليف
                والتعيين والتطوير.
              </p>
            </div>

            {/* القيم */}
            <div className="institutional-card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sage/15 mb-5 mx-auto">
                <ShieldCheck className="h-8 w-8 text-sage" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">القيم</h3>
              <div className="gold-divider mb-4" />
              <ul className="text-darkgray text-sm space-y-2 text-right">
                {['العدالة والشفافية', 'الموضوعية والبيانات', 'الحوكمة والمساءلة', 'تكافؤ الفرص'].map(v => (
                  <li key={v} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* الأهداف */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-bold tracking-widest text-gold-600 bg-gold-50 border border-gold-200 px-4 py-1.5 rounded-full mb-4">
                الأهداف
              </span>
              <h2 className="text-3xl font-bold text-primary-800">ماذا تحقق المنصة؟</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: TrendingUp, title: 'دعم القرارات', desc: 'قرارات تكليف وتعيين مبنية على بيانات موثقة لا انطباعات شخصية.' },
                { icon: Users, title: 'اكتشاف الكفاءات', desc: 'كشف القادة الواعدين الظاهرين والمخفيين عبر منهجية متعددة المصادر.' },
                { icon: Target, title: 'بناء الصف الثاني', desc: 'خطط تطوير مخصصة لسد الفجوات وتأهيل الصف القيادي المستقبلي.' },
                { icon: ShieldCheck, title: 'ضمان العدالة', desc: 'حوكمة صارمة تضمن الشفافية وعدالة الفرص لجميع المتقدمين.' },
              ].map((item) => (
                <div key={item.title} className="institutional-card p-6">
                  <item.icon className="h-8 w-8 text-primary-600 mb-3" />
                  <h4 className="font-bold text-primary-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-darkgray leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          كيف تعمل المنصة
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-gold-600 bg-gold-50 border border-gold-200 px-4 py-1.5 rounded-full mb-4">
              آلية العمل
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-3">
              كيف تعمل منصة جدير؟
            </h2>
            <p className="text-darkgray max-w-2xl mx-auto">
              عملية تقييم منظمة من أربع مراحل تضمن الشفافية والموضوعية في كل خطوة
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '١', title: 'التقديم', desc: 'يقدّم الموظف ملفه القيادي ومبادراته ومؤشرات أدائه عبر المنصة.', color: 'bg-primary-600' },
              { step: '٢', title: 'التقييم', desc: 'اختبارات ذكية ودائرة 360° من 15 مقيماً معتمداً من مستويات مختلفة.', color: 'bg-gold-600' },
              { step: '٣', title: 'التحليل', desc: 'تحليل ذكي شامل يصدر درجة الجاهزية، نوع القيادة، ونقاط القوة والفجوات.', color: 'bg-steelblue' },
              { step: '٤', title: 'القرار', desc: 'لجنة الحوكمة تراجع وتعتمد التصنيف، وتصدر بطاقة قيادية موثقة رسمياً.', color: 'bg-sage' },
            ].map((phase, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-l from-gold-300 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${phase.color} text-white text-2xl font-bold mb-4 shadow-lg`}>
                    {phase.step}
                  </div>
                  <h4 className="font-bold text-primary-800 mb-2 text-lg">{phase.title}</h4>
                  <p className="text-sm text-darkgray leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          رحلة الموظف — 7 مراحل
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-gold-400 bg-gold-400/10 border border-gold-400/30 px-4 py-1.5 rounded-full mb-4">
              رحلة الموظف
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              ٧ مراحل نحو البطاقة القيادية
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              مسار متكامل يوثق كل جانب من جوانب قدراتك القيادية
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {JOURNEY_STEPS.map((step, i) => (
              <div
                key={i}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-400/40 rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="text-3xl font-bold text-gold-400 leading-none shrink-0">
                    {step.num}
                  </div>
                  <step.icon className="h-6 w-6 text-gold-300 mt-1 shrink-0" />
                </div>
                <h4 className="font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-white/65 leading-relaxed">{step.desc}</p>
              </div>
            ))}

            {/* بطاقة النتيجة */}
            <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-400/40 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Award className="h-10 w-10 text-gold-400 mb-4" />
                <h4 className="font-bold text-gold-300 text-lg mb-2">البطاقة القيادية</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  وثيقة رسمية تعكس جاهزيتك القيادية الحقيقية — معتمدة من لجنة الحوكمة.
                </p>
              </div>
              <Link
                href="/register"
                className="mt-6 btn-gold px-4 py-2.5 rounded-lg text-sm font-bold text-center block"
              >
                ابدأ الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          الشفافية والحوكمة
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest text-gold-600 bg-gold-50 border border-gold-200 px-4 py-1.5 rounded-full mb-5">
                الشفافية والحوكمة
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-5">
                حوكمة صارمة تضمن العدالة لكل متقدم
              </h2>
              <p className="text-darkgray leading-relaxed mb-8">
                منصة جدير مبنية على مبدأ أن لا قرار يُتخذ دون توثيق، ولا تصنيف
                يُعتمد دون مراجعة. الشفافية ليست خياراً — هي أساس المنظومة.
              </p>
              <div className="space-y-3">
                {GOVERNANCE_FEATURES.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-sage mt-0.5 shrink-0" />
                    <span className="text-darkgray text-sm">{feat}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/governance-info"
                className="inline-flex items-center gap-2 mt-8 text-primary-700 font-bold hover:text-primary-800 transition-colors"
              >
                اقرأ المزيد عن الحوكمة
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-5">
              {[
                { label: 'الإجراء', value: 'لا اعتماد بدون لجنة', icon: ShieldCheck, color: 'text-primary-600' },
                { label: 'التوثيق', value: 'سجل تدقيق دائم', icon: FileText, color: 'text-gold-700' },
                { label: 'العدالة', value: 'كشف التحيز تلقائياً', icon: Eye, color: 'text-steelblue' },
                { label: 'الطعن', value: 'آلية تظلم رسمية', icon: UserCheck, color: 'text-sage' },
              ].map((item, i) => (
                <div key={i} className="institutional-card p-5 flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-midgray font-medium">{item.label}</div>
                    <div className="font-bold text-primary-800">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          من المستفيد
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-gold-50/50 to-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-gold-600 bg-gold-50 border border-gold-200 px-4 py-1.5 rounded-full mb-4">
              المستفيدون
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-3">
              من يستفيد من منصة جدير؟
            </h2>
            <p className="text-darkgray max-w-xl mx-auto">
              المنصة تخدم جميع أطراف المنظومة القيادية داخل المؤسسة
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFICIARIES.map((item) => (
              <div
                key={item.title}
                className={`institutional-card p-7 text-center hover:shadow-lg transition-all hover:-translate-y-1`}
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} mb-5 mx-auto`}>
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h4 className="font-bold text-primary-800 mb-3 text-lg">{item.title}</h4>
                <p className="text-sm text-darkgray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          مركز العرض التنفيذي — بروموشن بارز
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white p-10 md:p-14 text-center shadow-2xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-400/15 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400/20 border border-gold-400/40 mb-6 mx-auto">
                <Eye className="h-8 w-8 text-gold-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                مركز العرض <span className="text-gold-400">التنفيذي</span>
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-3">
                عرض تفصيلي مخصص للقيادات — يشمل الفكرة، المنهجية، النماذج التجريبية،
                الحوكمة، والأسئلة المتوقعة في ١٥ قسماً شاملاً.
              </p>
              <p className="text-gold-300 text-sm mb-8 font-medium">
                محمي بكلمة مرور — للقيادات العليا فقط
              </p>
              <Link
                href="/executive-center/login"
                className="inline-flex items-center gap-3 btn-gold px-8 py-4 rounded-xl font-bold text-lg shadow-xl"
              >
                <Eye className="h-5 w-5" />
                دخول مركز العرض التنفيذي
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          الدعوة العامة للتقديم — CTA نهائي
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-gold-50 via-ivory to-primary-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <UniversityLogo size="md" className="opacity-80" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
            هل أنت جاهز لإثبات جدارتك القيادية؟
          </h2>
          <p className="text-darkgray text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            فرصتك لإثبات قدراتك بطريقة موضوعية وعادلة أمام أصحاب القرار.
            ابدأ رحلتك القيادية الآن عبر منصة جدير.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg shadow-primary-900/15"
            >
              إنشاء حساب وابدأ التقديم
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="px-10 py-4 rounded-xl font-bold text-lg border-2 border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              <FileText className="h-5 w-5" />
              التعريف العام بالمنصة
            </Link>
          </div>
          <p className="mt-8 text-sm text-midgray">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary-700 font-bold hover:underline">
              سجّل دخولك هنا
            </Link>
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
