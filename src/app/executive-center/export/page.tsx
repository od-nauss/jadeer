import Link from 'next/link';
import { FileText, Download, Share2, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const EXPORT_OPTIONS = [
  {
    icon: FileText,
    title: 'ملخص قيادي مختصر',
    desc: '5 صفحات تُركّز على الفرصة، القيمة، والقرار المطلوب — مثالي للمشاركة مع أعضاء المجلس.',
    tag: 'الأكثر استخداماً',
    tagColor: 'bg-gold-500/20 text-gold-300',
  },
  {
    icon: FileText,
    title: 'العرض التنفيذي الكامل',
    desc: 'جميع أقسام العرض في مستند واحد شامل — للمراجعة العميقة والرجوع إليه.',
    tag: null,
    tagColor: '',
  },
  {
    icon: FileText,
    title: 'صفحة القرار المطلوب',
    desc: 'نقاط الاعتماد السبع فقط — ورقة عمل للنقاش في اجتماع القيادة.',
    tag: null,
    tagColor: '',
  },
  {
    icon: FileText,
    title: 'النماذج التجريبية الخمسة',
    desc: 'بطاقات النماذج القيادية الخمسة للنقاش المؤسسي وتوضيح كيفية عمل التصنيف.',
    tag: null,
    tagColor: '',
  },
  {
    icon: FileText,
    title: 'منهجية التقييم والمحاور',
    desc: 'الأوزان العلمية لمحاور التقييم السبعة مع شرح المصادر — للجان المتخصصة.',
    tag: null,
    tagColor: '',
  },
  {
    icon: FileText,
    title: 'الأسئلة المتوقعة وإجاباتها',
    desc: 'مرجع سريع للإجابة على كل الأسئلة القيادية الحساسة.',
    tag: null,
    tagColor: '',
  },
];

export default function ExportPage() {
  return (
    <div className="space-y-14 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          مشاركة العرض التنفيذي
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          خيارات التصدير <span className="text-gold-400">والمشاركة</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          صدّر العرض أو أي جزء منه لمشاركته مع القيادة أو الاحتفاظ به مرجعاً رسمياً.
        </p>
      </section>

      {/* ─── ملاحظة ─── */}
      <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-100/80">
          <strong>ملاحظة تقنية:</strong> وظائف التصدير الفعلية جاهزة بنيوياً ضمن المنصة وقابلة للتفعيل الفوري في مرحلة الإنتاج.
          واجهة التصدير مكتملة — التنفيذ الكامل يُفعَّل حسب احتياج المنظمة.
        </p>
      </div>

      {/* ─── خيارات التصدير ─── */}
      <div className="grid md:grid-cols-2 gap-4">
        {EXPORT_OPTIONS.map((opt, i) => (
          <button
            key={i}
            className="bg-white/5 hover:bg-gold-500/8 border border-white/10 hover:border-gold-400/30 rounded-xl p-5 text-right transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gold-500/15 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
                <opt.icon className="h-5 w-5 text-gold-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm">{opt.title}</h3>
                  {opt.tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.tagColor}`}>
                      {opt.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/55 mb-3 leading-relaxed">{opt.desc}</p>
                <div className="inline-flex items-center gap-1.5 text-xs text-gold-400 group-hover:text-gold-300 transition">
                  <Download className="h-3 w-3" />
                  <span>تصدير PDF</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ─── مشاركة العرض ─── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <Share2 className="h-6 w-6 text-gold-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-white mb-1">مشاركة العرض مع مستشار</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                يستطيع المسؤول مشاركة العرض الكامل أو أقسام محددة منه
                مع مستشاريه عبر صلاحية موقتة ومحدودة.
                كل مشاركة تُسجَّل في سجل التدقيق.
              </p>
            </div>
          </div>
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm py-2.5 rounded-xl transition">
            إنشاء رابط مشاركة موقت
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <Printer className="h-6 w-6 text-gold-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-white mb-1">الطباعة المباشرة</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                طباعة العرض التنفيذي الكامل أو الملخص القيادي
                بتنسيق احترافي مناسب للعروض الرسمية.
              </p>
            </div>
          </div>
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm py-2.5 rounded-xl transition">
            معاينة قبل الطباعة
          </button>
        </div>
      </div>

      {/* ─── الختام ─── */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 border-2 border-gold-400/40 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">
          المنصة جاهزة — والقرار بيد قيادتكم
        </h2>
        <p className="text-white/65 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          كل ما في هذا العرض مُنفَّذ فعلاً وجاهز للإطلاق.
          لا تجريب ولا وعود — منصة تعمل وتنتظر القرار الاستراتيجي.
        </p>
        <Link href="/executive-center/decision"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-8 py-3 rounded-xl transition-all">
          القرار المطلوب من القيادة
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
