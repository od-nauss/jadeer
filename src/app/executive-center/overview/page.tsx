import Link from 'next/link';
import {
  TrendingUp,
  Users,
  ShieldCheck,
  HelpCircle,
  Eye,
  Lightbulb,
  Award,
  ArrowLeft,
  Target,
  Brain,
} from 'lucide-react';

const QUICK_LINKS = [
  { href: '/executive-center/why', label: 'لماذا نحتاج المنصة؟', icon: Target },
  { href: '/executive-center/how-it-works', label: 'كيف تعمل المنصة؟', icon: Brain },
  { href: '/executive-center/beneficiaries', label: 'من المستفيد؟', icon: Users },
  { href: '/executive-center/anti-bias', label: 'كيف تمنع التحيز؟', icon: ShieldCheck },
  { href: '/executive-center/demo-models', label: 'النماذج التجريبية', icon: Eye },
  { href: '/executive-center/faq-leadership', label: 'الأسئلة المتوقعة', icon: HelpCircle },
  { href: '/executive-center/decision', label: 'القرار المطلوب', icon: Award },
];

const STATS = [
  { label: 'إجمالي المتقدمين', value: '5', subtext: 'تجريبي' },
  { label: 'جاهز الآن', value: '1', subtext: 'مرشح' },
  { label: 'جاهز خلال سنة', value: '1', subtext: 'مرشح' },
  { label: 'قادة واعدون', value: '1', subtext: 'مرشح' },
  { label: 'قيادة إنسانية محتملة', value: '1', subtext: 'مرشح' },
  { label: 'قيادة مخفية محتملة', value: '1', subtext: 'مرشح' },
];

export default function ExecutiveOverview() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          منصة <span className="text-gold-400">جدير</span>
        </h1>
        <p className="text-xl md:text-2xl text-gold-200 mb-8">
          لتحليل الجاهزية وبناء قيادات المستقبل
        </p>
        <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
          منصة مؤسسية ذكية تفتح المجال أمام الموظفين لإثبات جاهزيتهم القيادية، وتمنح القيادة رؤية
          عادلة ومدعومة بالبيانات لاكتشاف القادة الظاهرين والمخفيين، وبناء قرارات تكليف وتطوير أكثر
          دقة وشفافية.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group bg-white/5 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-400/60 backdrop-blur-sm rounded-xl p-4 transition-all"
          >
            <link.icon className="h-7 w-7 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-white group-hover:text-gold-200">
              {link.label}
            </div>
            <ArrowLeft className="h-4 w-4 text-gold-400/50 mt-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gold-300 mb-6">مؤشرات تجريبية</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-xl p-4 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-gold-400 mb-1">{stat.value}</div>
              <div className="text-xs text-white/70 mb-1">{stat.label}</div>
              <div className="text-[10px] text-white/40 uppercase">{stat.subtext}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gold-300">توزيع تصنيفات الجاهزية</h3>
            <TrendingUp className="h-5 w-5 text-gold-400" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'جاهز الآن', value: 20, color: 'bg-sage' },
              { label: 'جاهز خلال سنة', value: 20, color: 'bg-gold-500' },
              { label: 'واعد', value: 20, color: 'bg-steelblue' },
              { label: 'قائد إنساني', value: 20, color: 'bg-primary-400' },
              { label: 'لا يناسب القيادة المباشرة حالياً', value: 20, color: 'bg-wine' },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>{row.label}</span>
                  <span>{row.value}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gold-300">مستوى الثقة في التصنيفات</h3>
            <ShieldCheck className="h-5 w-5 text-gold-400" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'ثقة عالية (85%+)', value: 40, color: 'bg-sage' },
              { label: 'ثقة جيدة (70-84%)', value: 40, color: 'bg-gold-500' },
              { label: 'ثقة متوسطة (55-69%)', value: 20, color: 'bg-steelblue' },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>{row.label}</span>
                  <span>{row.value}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-4 leading-relaxed">
            مستوى الثقة مؤشر مستقل عن درجة الجاهزية، ويعكس قوة مصادر التحقق وتنوع المقيمين واتساق
            البيانات.
          </p>
        </div>
      </div>

      {/* Decision CTA */}
      <div className="bg-gradient-to-br from-gold-500/20 to-primary-700/20 border-2 border-gold-400/40 rounded-2xl p-8 text-center">
        <Award className="h-12 w-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">جاهزة للاعتماد المؤسسي</h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-6 leading-relaxed">
          منصة جدير ليست مشروعاً تقنياً فقط، بل خطوة مؤسسية لبناء عدالة الفرص، واستدامة القيادة،
          ورفع جودة القرار. القرار المطلوب من القيادة ينتظركم.
        </p>
        <Link
          href="/executive-center/decision"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-6 py-3 rounded-lg transition-all"
        >
          <span>عرض القرار المطلوب</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
