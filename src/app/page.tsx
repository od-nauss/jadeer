import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Target,
  Brain,
  Award,
  Building2,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/layout/PublicLayout';
import { UniversityLogo } from '@/components/branding/Logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-800 via-primary-700 to-primary-900 text-white">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full bg-primary-300 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Logo Hero - الشعار في الوسط بحجم كبير */}
          <div className="text-center mb-10">
            <div className="inline-block bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gold-500/20">
              <UniversityLogo size="hero" className="brightness-0 invert mx-auto" />
            </div>
          </div>

          {/* Platform Name */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              منصة <span className="text-gold-400">جدير</span>
            </h1>
            <p className="text-xl md:text-2xl text-gold-200 font-medium">
              منصة مؤسسية لقياس الجدارة القيادية
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-primary-900 font-bold rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              <span>بدء الرحلة القيادية</span>
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/executive-center/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-gold-400 backdrop-blur-sm text-white font-bold rounded-xl transition-all duration-300"
            >
              <span>استعراض العرض التنفيذي</span>
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="institutional-card p-8 border-r-4 border-gold-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-primary-700">الرؤية</h2>
              </div>
              <p className="text-darkgray leading-loose text-lg">
                أن نكون المنصة المرجعية لقياس الجاهزية القيادية في المؤسسات الحكومية والأكاديمية،
                ونمنح القيادة بيانات عادلة ومعتمدة لاتخاذ قرارات تكليف وتطوير دقيقة.
              </p>
            </div>

            <div className="institutional-card p-8 border-r-4 border-primary-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-gold-700" />
                </div>
                <h2 className="text-2xl font-bold text-primary-700">الرسالة</h2>
              </div>
              <p className="text-darkgray leading-loose text-lg">
                تمكين الموظفين من إثبات جاهزيتهم القيادية بطريقة منظمة، وتمكين القيادة من اكتشاف
                الكفاءات الظاهرة والمخفية، عبر منهجية حوكمية متعددة المصادر تحفظ العدالة وتمنع التحيز.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* الفكرة */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-ivory to-gold-50/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-6">
            الفكرة
          </h2>
          <div className="gold-divider w-32 mx-auto mb-8" />
          <p className="text-lg md:text-xl text-darkgray leading-loose">
            منصة جدير منصة مؤسسية ذكية تتيح لجميع موظفي المنظمة التقدم لمسار الجاهزية القيادية.
            يدخل الموظف إلى المنصة، ينشئ ملفه القيادي، يوثق مبادراته وإنجازاته، يضيف مؤشرات الأداء التي
            استخدمها في عمله أو إدارته، ينفذ اختبارات ذكية، يرشح مقيمين لتقييم 360، ثم تراجع لجنة الحوكمة
            ملفه وقائمة المقيمين. وبعد اكتمال التقييم والتحليل تصدر المنصة بطاقة قيادية بأدوات تحليل ذكية
            توضح درجة الجاهزية، نوع القيادة، نقاط القوة، فجوات التطوير، مستوى الثقة، والملاءمة التنظيمية.
          </p>
        </div>
      </section>

      {/* الأهداف */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">الأهداف</h2>
            <div className="gold-divider w-32 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'عدالة الفرص',
                desc: 'فتح المجال أمام جميع الموظفين لإثبات جاهزيتهم القيادية بطريقة منظمة.',
              },
              {
                icon: ShieldCheck,
                title: 'الحوكمة والشفافية',
                desc: 'لجنة حوكمة تضمن أن قرارات التصنيف موثقة ومدعومة بمصادر متعددة.',
              },
              {
                icon: Brain,
                title: 'دعم القرار بالبيانات',
                desc: 'تحويل قرار التكليف من انطباع إلى ملف موثق بمعطيات وتحليل ذكي.',
              },
              {
                icon: Building2,
                title: 'استدامة القيادة',
                desc: 'بناء صف قيادي ثانٍ وثالث قبل الحاجة، عبر خريطة تعاقب وظيفي.',
              },
              {
                icon: TrendingUp,
                title: 'التطوير الموجه',
                desc: 'خطط تطوير فردية مبنية على فجوات حقيقية لا مجرد برامج عامة.',
              },
              {
                icon: Award,
                title: 'اكتشاف القيادات',
                desc: 'كشف الكفاءات المخفية التي تملك أثراً دون منصب رسمي.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="institutional-card p-6 hover:border-gold-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-gold-700" />
                </div>
                <h3 className="text-lg font-bold text-primary-700 mb-2">{item.title}</h3>
                <p className="text-sm text-darkgray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* كيف تعمل المنصة */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary-700 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">كيف تعمل المنصة</h2>
            <p className="text-gold-200 text-lg">رحلة الموظف من التقديم إلى البطاقة القيادية</p>
            <div className="w-32 h-px bg-gold-400 mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'إنشاء الملف القيادي', desc: 'بيانات أساسية، خبرات، مهارات، أدوات' },
              { num: '02', title: 'توثيق المبادرات والمؤشرات', desc: 'مع شواهد قابلة للتحقق' },
              { num: '03', title: 'الاختبارات الذكية', desc: 'قياس نمط التفكير واتخاذ القرار' },
              { num: '04', title: 'ترشيح 15 مقيماً', desc: 'دائرة الثقة القيادية' },
              { num: '05', title: 'مراجعة لجنة الحوكمة', desc: 'اعتماد 7-10 مقيمين بنسبة 60٪+' },
              { num: '06', title: 'تقييم 360', desc: 'روابط فردية آمنة لمرة واحدة' },
              { num: '07', title: 'التحليل والاعتماد', desc: 'تحليل ذكي + قرار اللجنة' },
              { num: '08', title: 'البطاقة القيادية', desc: 'تصنيف، نوع قيادة، مستوى ثقة، خطة تطوير' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white/5 backdrop-blur-sm border border-gold-400/20 rounded-xl p-5 hover:border-gold-400/60 transition-all">
                  <div className="text-gold-400 font-bold text-3xl mb-2">{step.num}</div>
                  <h3 className="font-bold text-base mb-2 text-white">{step.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الحوكمة والشفافية */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
              الشفافية والحوكمة
            </h2>
            <div className="gold-divider w-32 mx-auto" />
          </div>

          <div className="institutional-card p-8 md:p-10 bg-gradient-to-br from-white to-gold-50/40">
            <div className="space-y-4">
              {[
                'الموظف لا يتحكم وحده في المقيمين — يقترح 15 ولجنة الحوكمة تعتمد 7 إلى 10',
                'لجنة الحوكمة تحدد 60٪ على الأقل من المقيمين المعتمدين لمنع التحيز',
                'كل مقيم يحصل على رابط فردي يستخدم مرة واحدة فقط',
                'المرشح لا يرى إجابات المقيمين أو درجاتهم التفصيلية',
                'المنصة تكشف التقييمات المتطرفة وتضارب المصالح المحتمل',
                'لا اعتماد لتصنيف نهائي دون قرار موثق من لجنة الحوكمة',
                'كل قرار حساس يُسجَّل في سجل التدقيق لا يقبل الحذف',
                'الذكاء الاصطناعي محلل مساعد فقط، والقرار النهائي للقيادة',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <p className="text-darkgray leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
