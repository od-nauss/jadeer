import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
const GUARANTEES = [
  'الموظف لا يتحكم وحده في المقيمين',
  'الموظف يقترح 15 مقيماً فقط',
  'لجنة الحوكمة تعتمد من 7 إلى 10',
  'لجنة الحوكمة تحدد 60٪ على الأقل من المقيمين',
  'كل مقيم يحصل على رابط خاص',
  'كل رابط يستخدم مرة واحدة',
  'كل رابط مرتبط بالمقيم والمرشح',
  'المرشح لا يرى إجابات المقيمين',
  'اللجنة ترى بيانات المقيمين وحالة التقييم',
  'المنصة تكشف التقييمات المتطرفة',
  'المنصة تكشف ضعف تنوع المقيمين',
  'المنصة تكشف تضارب المصالح المحتمل',
  'كل قرار يوثق في سجل الحوكمة',
];

const FLOW = [
  { step: 'الموظف', action: 'يقترح 15 مقيماً' },
  { step: 'اللجنة', action: 'تعتمد 7-10 + تضيف 60% من اختيارها' },
  { step: 'المقيم', action: 'يقيّم عبر رابط فردي آمن' },
  { step: 'المنصة', action: 'تحلل الاتساق والتحيز' },
  { step: 'اللجنة', action: 'تراجع وتعتمد التصنيف' },
  { step: 'القيادة', action: 'تقرر التكليف' },
];

export default function AntiBiasPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          كيف تمنع المنصة <span className="text-gold-400">التحيز</span>
        </h1>
        <p className="text-xl text-gold-200">ثلاثة عشر ضمانة للعدالة</p>
      </div>

      <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-gold-500/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-gold-400" />
          </div>
          <h2 className="text-2xl font-bold text-gold-300">الضمانات</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {GUARANTEES.map((g, i) => (
            <div
              key={i}
              className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-3 text-sm text-white/80 flex items-start gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-700/30 to-transparent border border-gold-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gold-300 mb-6">دورة العدالة</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {FLOW.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 border border-gold-500/30 rounded-xl p-4 text-center"
            >
              <div className="text-xs text-gold-400 font-bold mb-1">المرحلة {i + 1}</div>
              <div className="text-base font-bold text-white mb-1">{f.step}</div>
              <div className="text-xs text-white/70 leading-relaxed">{f.action}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gold-500/10 border-r-4 border-gold-400 rounded-2xl p-6">
        <p className="text-lg text-gold-100 leading-loose">
          <strong>القاعدة الذهبية:</strong> لا اعتماد لتصنيف نهائي دون قرار موثق من لجنة الحوكمة. هذه
          الجملة الواحدة تختصر فلسفة الحوكمة في منصة جدير.
        </p>
      </div>
    </div>
  );
}
