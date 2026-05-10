import { AlertCircle, CheckCircle2 } from 'lucide-react';

const POINTS = [
  {
    title: 'دائرة الثقة القيادية',
    what: 'شبكة المقيمين متعددي الزوايا (مدير، زملاء، مرؤوسون، أصحاب علاقة)',
    why: 'لا اعتماد على رأي شخص واحد، بل قراءة متعددة الزوايا',
    risk: 'بدونها: تصبح النتيجة انطباعية وضحلة',
    solution: '15 مقترح → 7-10 معتمدون من اللجنة بنسبة 60% منها',
  },
  {
    title: 'اعتماد المقيمين من لجنة الحوكمة',
    what: 'صلاحية اعتماد، إضافة، استبعاد المقيمين',
    why: 'منع الموظف من اختيار المجاملين فقط',
    risk: 'بدونها: يتلاعب الموظف بالنتيجة',
    solution: 'اللجنة تحدد ≥60% بنفسها وتراجع كل قائمة',
  },
  {
    title: 'تحليل مؤشرات الأداء',
    what: 'تحليل نضج المؤشرات التي استخدمها المرشح',
    why: 'الفرق بين موظف يعتمد على البيانات وآخر على الانطباع',
    risk: 'بدونه: لا نعرف هل القائد يقود بالأرقام أم بالحدس',
    solution: 'تقييم نضج كل مؤشر + تأكيد المقيمين له',
  },
  {
    title: 'التحقق من المبادرات عبر المقيمين',
    what: 'سؤال المقيمين: "هل تستطيع تأكيد هذه المبادرة؟"',
    why: 'حماية من المبالغة في الإنجازات',
    risk: 'بدونه: قد تكون بطاقة المرشح مزخرفة',
    solution: 'كل مبادرة لها شهود + سؤال تحقق في 360',
  },
  {
    title: 'مستوى الثقة في التصنيف',
    what: 'مؤشر مستقل عن درجة الجاهزية',
    why: 'درجة 87% بثقة 71% ليست مثل درجة 81% بثقة 93%',
    risk: 'بدونه: نتائج عالية بمصادر هشة',
    solution: 'حساب الثقة بناءً على عدد المقيمين والاتساق والتنوع',
  },
  {
    title: 'رصد الأداء العالي مع رضا منخفض',
    what: 'تصنيف خاص: صاحب إنجاز قوي لا يناسب القيادة المباشرة',
    why: 'حماية الفرق من القائد المنجز قاسي القيادة',
    risk: 'بدونه: نضع المنجز في موقع يضر بالفريق',
    solution: 'تنبيه واضح للجنة + خطة تطوير في القيادة الإنسانية',
  },
  {
    title: 'رصد القيادة المخفية',
    what: 'كشف من يقود دون منصب رسمي',
    why: 'الكفاءات لا تظهر دائماً في الاجتماعات',
    risk: 'بدونه: تخسر المنظمة كنوزها الصامتة',
    solution: 'وسم تلقائي + مراجعة اللجنة',
  },
  {
    title: 'خطة التطوير الفردية',
    what: 'خطة يولدها النظام بناءً على فجوات حقيقية',
    why: 'لا تطوير عشوائي بل موجه',
    risk: 'بدونها: التدريب يتحول إلى صرف ميزانية',
    solution: 'النظام يقترح + الموارد تراجع + اللجنة تعتمد للحالات المهمة',
  },
  {
    title: 'خريطة الملاءمة التنظيمية',
    what: 'ربط نوع القائد بالوحدة المناسبة',
    why: 'القائد التشغيلي ليس بالضرورة استراتيجياً',
    risk: 'بدونها: نضع القائد في مكان غير مناسب',
    solution: 'حساب الملاءمة لكل وحدة بأوزانها الخاصة',
  },
  {
    title: 'سجل الحوكمة',
    what: 'كل قرار حساس يُسجَّل ولا يُحذَف',
    why: 'العدالة تحتاج توثيقاً',
    risk: 'بدونه: لا مساءلة ولا تتبع للقرارات',
    solution: 'audit_logs لا يقبل الحذف من الواجهة',
  },
  {
    title: 'التظلمات',
    what: '8 أنواع تظلم بقرارات موثقة',
    why: 'حق الموظف في الاعتراض جزء من العدالة',
    risk: 'بدونها: نظام مغلق ضد الأخطاء',
    solution: 'تحليل ذكي للتظلم + قرار اللجنة موثق',
  },
  {
    title: 'الإشعارات الذكية',
    what: '22 نوع تنبيه موجه حسب الدور',
    why: 'القيادة تحتاج رؤية فورية لا متأخرة',
    risk: 'بدونها: تضيع المعلومات الحرجة',
    solution: 'إشعارات بالأولوية للوصول السريع',
  },
];

export default function CriticalPointsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          النقاط <span className="text-gold-400">الحرجة</span>
        </h1>
        <p className="text-xl text-gold-200">ما يميز نضج المنصة</p>
      </div>

      <div className="space-y-4">
        {POINTS.map((p, i) => (
          <div
            key={i}
            className="bg-white/5 border border-gold-500/20 rounded-2xl p-6 hover:border-gold-400/40 transition-all"
          >
            <h3 className="text-xl font-bold text-gold-300 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {p.title}
            </h3>
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs uppercase text-gold-400 font-bold mb-1">ما هي؟</div>
                <p className="text-white/80">{p.what}</p>
              </div>
              <div>
                <div className="text-xs uppercase text-gold-400 font-bold mb-1">لماذا مهمة؟</div>
                <p className="text-white/80">{p.why}</p>
              </div>
              <div>
                <div className="text-xs uppercase text-rose-400 font-bold mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> الخطر بدونها
                </div>
                <p className="text-white/80">{p.risk}</p>
              </div>
              <div>
                <div className="text-xs uppercase text-green-400 font-bold mb-1">الحل في جدير</div>
                <p className="text-white/80">{p.solution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
