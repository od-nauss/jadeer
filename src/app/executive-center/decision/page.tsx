import { Award, CheckCircle2, FileSignature, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const APPROVALS = [
  { title: 'اعتماد منصة جدير كمنظومة مؤسسية رسمية', desc: 'لقياس الجاهزية القيادية وبناء قاعدة بيانات الكفاءات القيادية.' },
  { title: 'فتح باب التقديم أمام جميع الموظفين المؤهلين', desc: 'بضوابط وشروط أهلية واضحة، مع الحفاظ على معايير الانتقاء.' },
  { title: 'تشكيل لجنة الحوكمة', desc: 'الجهة المسؤولة عن ضمان نزاهة العملية، اعتماد المقيّمين، ومراجعة الشكاوى.' },
  { title: 'اعتماد منهجية التقييم', desc: 'سبعة محاور بأوزان علمية مدروسة، قابلة للمراجعة والتعديل حسب السياق المؤسسي.' },
  { title: 'اعتماد تقييم 360° عبر دائرة الثقة القيادية', desc: 'منهجية مُحكمة: ١٥ مقترحاً — ٧-١٠ معتمدين — ٦٠٪ تختارهم اللجنة.' },
  { title: 'توظيف النتائج في دعم قرارات التكليف والتطوير', desc: 'النتائج أداة دعم قرار لا قرار تلقائي — صاحب القرار يحتفظ بالكلمة الأخيرة دائماً.' },
  { title: 'متابعة مستمرة عبر لوحة القيادة العليا', desc: 'رؤية تنفيذية حية لجاهزية الكفاءات — في أي وقت وبدون انتظار تقارير دورية.' },
];

export default function DecisionPage() {
  return (
    <div className="space-y-14 max-w-5xl mx-auto" dir="rtl">

      {/* ─── العنوان — بلغة الإرث ─── */}
      <div className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          من الفكرة إلى التنفيذ
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          القرار المطلوب <span className="text-gold-400">من القيادة</span>
        </h1>
        <p className="text-lg text-white/65 max-w-2xl mx-auto">
          ما يبنيه القائد اليوم في مجال اكتشاف الكفاءات وتأهيل القيادات
          هو أحد أعمق الإرثات المؤسسية التي تبقى بعده.
        </p>
      </div>

      {/* ─── الرسالة الافتتاحية ─── */}
      <div className="bg-gradient-to-br from-gold-500/15 to-transparent border-r-4 border-gold-400 rounded-2xl p-8">
        <FileSignature className="h-10 w-10 text-gold-400 mb-4" />
        <p className="text-lg text-white/90 leading-loose">
          لتحويل هذه الرؤية إلى مشروع مؤسسي قائم، نحتاج إلى اعتماد قيادتكم على المحاور التالية.
          وهي ليست قرارات تقنية — بل قرارات مؤسسية استراتيجية تُرسم بها ملامح القيادة القادمة للجامعة.
        </p>
      </div>

      {/* ─── نقاط الاعتماد السبع ─── */}
      <div className="space-y-3">
        {APPROVALS.map((approval, i) => (
          <div key={i}
            className="bg-white/5 hover:bg-gold-500/5 border border-gold-500/20 hover:border-gold-400/40 rounded-xl p-5 flex items-start gap-4 transition-all group">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-gold-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-gold-300 transition">{approval.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{approval.desc}</p>
            </div>
            <div className="text-3xl font-bold text-gold-400/30 flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      {/* ─── ضمانة للقائد — لا تُلزمه ─── */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: '🔒', title: 'قراركم يبقى محورياً', body: 'البيانات تُعزز حكمتكم ولا تحل محلها. القرار النهائي لقيادتكم دائماً.' },
          { icon: '🔄', title: 'قابل للتكيف', body: 'الأوزان والمعايير قابلة للتعديل وفق رؤيتكم في أي وقت.' },
          { icon: '⚡', title: 'النتائج من اليوم الأول', body: 'تبدأ البيانات بالتراكم فور الإطلاق — لا انتظار لسنوات.' },
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-3">{item.icon}</div>
            <div className="font-bold text-white text-sm mb-2">{item.title}</div>
            <p className="text-xs text-white/55 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      {/* ─── الختام — الإرث ─── */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 border-2 border-gold-400/40 rounded-2xl p-10 text-center">
        <div className="flex justify-center gap-1 mb-6">
          {[1,2,3].map(i => <Star key={i} className="h-5 w-5 text-gold-400 fill-gold-400" />)}
        </div>
        <Award className="h-16 w-16 text-gold-400 mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          منصة جدير جاهزة للاعتماد المؤسسي
        </h2>
        <p className="text-lg text-gold-200 leading-loose max-w-3xl mx-auto mb-8">
          المنصة مشغّلة وجاهزة — ليست فكرة على ورق.
          كل ما تراه في هذا العرض مُنفَّذ فعلاً وجاهز للإطلاق.
          القرار المطلوب اليوم هو تحويل هذا المشروع الجاهز إلى مبادرة مؤسسية رسمية تحمل اسم جامعة نايف.
        </p>
        <div className="inline-block bg-gold-500/20 border border-gold-400/40 rounded-xl px-6 py-3 text-gold-200 text-sm font-medium">
          "المنظمات التي تبني قيادتها بمنهجية علمية اليوم — تقود قطاعها غداً"
        </div>
        <div className="mt-8">
          <Link href="/executive-center/export"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-8 py-3 rounded-xl transition-all">
            تصدير ملخص العرض التنفيذي
          </Link>
        </div>
      </div>
    </div>
  );
}
