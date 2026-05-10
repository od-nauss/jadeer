import { Award, CheckCircle2, FileSignature } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
const APPROVALS = [
  {
    title: 'اعتماد منصة جدير كمنصة مؤسسية',
    desc: 'لقياس الجاهزية القيادية بشكل رسمي ومؤسسي.',
  },
  {
    title: 'اعتماد فتح التقديم لجميع الموظفين',
    desc: 'فتح المجال أمام الجميع لإثبات الجاهزية، مع ضوابط الأهلية.',
  },
  {
    title: 'اعتماد تشكيل لجنة الحوكمة',
    desc: 'الجهة المسؤولة عن مراجعة المقيمين والتصنيفات والتظلمات.',
  },
  {
    title: 'اعتماد منهجية التقييم',
    desc: 'سبعة محاور بأوزان مدروسة، قابلة للتعديل من إعدادات النظام.',
  },
  {
    title: 'اعتماد تقييم 360 عبر دائرة الثقة القيادية',
    desc: '15 مقترحاً → 7-10 معتمدين بنسبة 60% من اللجنة.',
  },
  {
    title: 'اعتماد استخدام النتائج لدعم قرارات التكليف والتطوير',
    desc: 'النتائج أداة دعم قرار، لا قرار تعيين تلقائي.',
  },
  {
    title: 'اعتماد متابعة النتائج عبر لوحة القيادة العليا',
    desc: 'رؤية تنفيذية مستمرة للجاهزية القيادية في المنظمة.',
  },
];

export default function DecisionPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          من الفكرة إلى <span className="text-gold-400">التنفيذ</span>
        </h1>
        <p className="text-xl text-gold-200">القرار المطلوب من القيادة</p>
      </div>

      <div className="bg-gradient-to-br from-gold-500/15 to-transparent border-r-4 border-gold-400 rounded-2xl p-8">
        <FileSignature className="h-12 w-12 text-gold-400 mb-4" />
        <p className="text-lg md:text-xl text-white/90 leading-loose">
          لتحويل الفكرة إلى مشروع منفذ نحتاج لاعتماد القيادة على النقاط التالية:
        </p>
      </div>

      <div className="space-y-3">
        {APPROVALS.map((approval, i) => (
          <div
            key={i}
            className="bg-white/5 hover:bg-gold-500/5 border border-gold-500/20 hover:border-gold-400/40 rounded-xl p-5 flex items-start gap-4 transition-all"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-gold-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{approval.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{approval.desc}</p>
            </div>
            <div className="text-3xl font-bold text-gold-400/40">0{i + 1}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary-700 to-primary-900 border-2 border-gold-400/40 rounded-2xl p-10 text-center">
        <Award className="h-16 w-16 text-gold-400 mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          منصة جدير جاهزة للاعتماد المؤسسي
        </h2>
        <p className="text-lg text-gold-200 leading-loose max-w-3xl mx-auto mb-8">
          المنصة تشغيلية كاملة، وليست عرضاً تقديمياً. كل ميزة تعرضها هذه الصفحات مبنية فعلاً في النظام،
          والقرار المطلوب هو تحويل المشروع من جاهز إلى مفعّل.
        </p>
        <Link
          href="/executive-center/export"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-8 py-3 rounded-lg transition-all"
        >
          الانتقال لخيارات التصدير
        </Link>
      </div>
    </div>
  );
}
