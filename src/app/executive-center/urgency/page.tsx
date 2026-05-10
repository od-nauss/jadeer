import { Clock, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';
const POINTS = [
  'كل شهر يمر دون نظام لاكتشاف القيادات يعني احتمال بقاء كفاءات مؤثرة خارج المشهد.',
  'قرارات التكليف تحتاج بيانات لا انطباعات فقط.',
  'المنصة تمنح القيادة رؤية مستمرة لا موسمية.',
  'القيادات المخفية لا تظهر في الاجتماعات دائماً، لكنها تظهر في الأثر.',
  'الموظف المتميز يحتاج قناة عادلة لإثبات نفسه.',
  'المنظمة تحتاج بدائل جاهزة قبل الحاجة إليها.',
  'التطوير القيادي يبدأ بالقياس.',
  'منصة جدير تحول الجاهزية القيادية من انطباع إلى ملف موثق.',
];

export default function UrgencyPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          القيمة <span className="text-gold-400">العاجلة</span>
        </h1>
        <p className="text-xl text-gold-200">لماذا الآن؟</p>
      </div>

      <div className="bg-gradient-to-br from-gold-500/15 to-transparent border-r-4 border-gold-400 rounded-2xl p-8">
        <Clock className="h-12 w-12 text-gold-400 mb-4" />
        <p className="text-xl md:text-2xl text-white leading-loose font-medium">
          كل منظمة كبيرة تملك كفاءات، لكن الفرق بين منظمة وأخرى هو سرعة اكتشاف هذه الكفاءات،
          وعدالة تقييمها، وحسن توظيفها في الوقت المناسب.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {POINTS.map((point, i) => (
          <div
            key={i}
            className="bg-white/5 border border-gold-500/20 rounded-xl p-5 flex items-start gap-3"
          >
            <TrendingUp className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/85 leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary-700 to-primary-900 border-2 border-gold-400/40 rounded-2xl p-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          الخاتمة
        </h2>
        <p className="text-lg text-gold-200 leading-loose max-w-3xl mx-auto">
          اعتماد منصة جدير ليس مشروعاً تقنياً فقط، بل خطوة مؤسسية لبناء عدالة الفرص، واستدامة القيادة،
          ورفع جودة القرار.
        </p>
      </div>
    </div>
  );
}
