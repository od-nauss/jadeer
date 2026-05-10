import { ArrowLeft, X, Check } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default function WhyPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          لماذا نحتاج <span className="text-gold-400">منصة جدير</span>؟
        </h1>
        <p className="text-xl text-gold-200">الفجوة المؤسسية التي نعالجها</p>
      </div>

      <div className="bg-gradient-to-br from-gold-500/10 to-transparent border-r-4 border-gold-400 rounded-2xl p-8">
        <p className="text-xl text-white/90 leading-loose">
          المنظمات الكبرى لا تفتقر دائماً إلى الكفاءات، بل تفتقر إلى نظام يكشفها بعدالة، ويربطها
          بالجاهزية، ويضعها أمام القيادة في الوقت المناسب.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-rose-200 mb-4 flex items-center gap-2">
            <X className="h-6 w-6" /> قبل منصة جدير
          </h3>
          <ul className="space-y-3 text-white/80 text-sm">
            {[
              'ترشيحات تعتمد على المعرفة الشخصية والانطباع',
              'موظفون لديهم قدرة قيادية لكنهم غير ظاهرين',
              'موظفون يملكون أثراً حقيقياً لكن لا حضور إداري قوي',
              'خلط بين الموظف المنجز والقائد المناسب',
              'قرارات تكليف تحتاج دعماً أعمق من السيرة الذاتية',
              'غياب الصف القيادي الثاني والثالث',
              'بيانات قيادية متفرقة وغير منظمة',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <X className="h-4 w-4 text-rose-300 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-sage/10 border border-sage/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-green-200 mb-4 flex items-center gap-2">
            <Check className="h-6 w-6" /> بعد منصة جدير
          </h3>
          <ul className="space-y-3 text-white/80 text-sm">
            {[
              'تقديم مفتوح لجميع الموظفين لإثبات الجاهزية',
              'تحليل ذكي لكل ملف ومبادرة ومؤشر',
              'تقييم 360 من دائرة ثقة قيادية متنوعة',
              'لجنة حوكمة تعتمد المقيمين والتصنيفات',
              'بطاقة قيادية موثقة بمصادر متعددة',
              'خريطة ملاءمة تنظيمية وتعاقب وظيفي',
              'خطط تطوير مبنية على فجوات حقيقية',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-300 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/executive-center/beneficiaries"
          className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200"
        >
          <span>المستفيدون من المنصة</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
