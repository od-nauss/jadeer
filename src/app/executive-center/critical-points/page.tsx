import { Shield, Eye, Brain, AlertTriangle, CheckCircle2, Lock, TrendingUp, Users, FileSearch, Award, Bell, Scale } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CRITICAL_POINTS = [
  {
    icon: Shield,
    color: 'text-gold-400',
    bg: 'bg-gold-400/10',
    title: 'دائرة الثقة القيادية',
    what: 'آلية هيكلية تضمن أن تقييم 360° يأتي من مقيمين متنوعين ومعتمدين، لا من اختيار فردي.',
    why: 'التقييم من دائرة المعارف فقط يؤدي إلى نتائج مشوهة وقابلة للتلاعب.',
    risk: 'دون هذه الآلية: المقيمون يصبحون أصدقاء وليس شهوداً موضوعيين.',
    solution: 'الموظف يقترح 15، اللجنة تعتمد 7–10، وتحدد 60٪ على الأقل من المقيمين.',
  },
  {
    icon: Lock,
    color: 'text-primary-300',
    bg: 'bg-primary-300/10',
    title: 'روابط التقييم الذكية المؤمنة',
    what: 'كل مقيم يحصل على رابط مخصص، يستخدم مرة واحدة، مرتبط بهويته وعلاقته بالمرشح.',
    why: 'لمنع إرسال الرابط لشخص آخر أو التقييم المتعدد من نفس الشخص.',
    risk: 'دون هذا: يمكن للمرشح التحكم في من يملأ التقييم فعلياً.',
    solution: 'المنصة تسجل وقت الفتح والجهاز وعنوان IP، وتعرض أي حالة مشبوهة للجنة.',
  },
  {
    icon: Eye,
    color: 'text-steelblue',
    bg: 'bg-steelblue/10',
    title: 'كشف التقييمات المتطرفة والتحيز',
    what: 'المنصة تحلل توزيع الدرجات وتكشف تلقائياً أي مقيم يعطي درجات استثنائية غير مبررة.',
    why: 'المجاملة والانتقام موجودان في أي بيئة بشرية — المنصة تراهما قبل أن يؤثرا.',
    risk: 'دون هذا: تقييم واحد مشوه يمكن أن يغير النتيجة كلياً.',
    solution: 'مؤشرات التحيز تعرض للجنة مع توصية باستبعاد مقيم أو إعادة التقييم.',
  },
  {
    icon: AlertTriangle,
    color: 'text-amber-300',
    bg: 'bg-amber-400/10',
    title: 'رصد الأداء العالي مع رضا منخفض',
    what: 'المنصة تكشف النمط الخطير: موظف ينجز استثنائياً لكن فريقه يعاني في صمت.',
    why: 'الأداء الرقمي المرتفع يخفي أحياناً إشكالية إنسانية أعمق تهدد تماسك الفريق.',
    risk: 'دون هذا: يُكلَّف شخص في موقع قيادي ويفقد المنصة أعداداً من الموظفين.',
    solution: 'تصنيف خاص "أداء عالٍ / رضا منخفض" مع توصية بتطوير إدارة الفريق قبل التكليف.',
  },
  {
    icon: Brain,
    color: 'text-purple-300',
    bg: 'bg-purple-400/10',
    title: 'كشف القيادة المخفية',
    what: 'تحليل الأنماط عبر المبادرات وتقييم الزملاء والأثر الفعلي — لا المنصب الرسمي.',
    why: 'كثير من القادة الحقيقيين لا يصلون للمشهد بسبب ضعف الحضور الإداري لا ضعف القدرة.',
    risk: 'دون هذا: تخسر المنظمة كفاءات استثنائية غير مرئية.',
    solution: 'علامة "قيادة مخفية محتملة" تُرفع للرئيس مع ملخص الأدلة الداعمة.',
  },
  {
    icon: FileSearch,
    color: 'text-sage',
    bg: 'bg-sage/10',
    title: 'التحقق من المبادرات والإنجازات',
    what: 'المبادرات لا تُقبل بمجرد الكتابة — المقيمون يُسألون عن دور المرشح الحقيقي فيها.',
    why: 'المبالغة في وصف الإنجازات ظاهرة طبيعية في بيئات التنافس — المنصة تصفيها.',
    risk: 'دون هذا: قرار تكليف مبني على إنجازات مبالغ فيها أو غير محققة.',
    solution: 'كل مبادرة مرتبطة بمقيم يؤكدها، وأي تناقض يرفع تنبيهاً للجنة.',
  },
  {
    icon: TrendingUp,
    color: 'text-gold-300',
    bg: 'bg-gold-300/10',
    title: 'مستوى الثقة في التصنيف',
    what: 'كل بطاقة قيادية تحمل درجة ثقة مستقلة تعكس مدى اتساق المصادر وتنوع المقيمين.',
    why: '80٪ من مصدر واحد تختلف جوهرياً عن 75٪ من 9 مصادر متنوعة.',
    risk: 'دون هذا: القيادة لا تعرف كم يمكن الاعتماد فعلياً على النتيجة.',
    solution: 'مستوى الثقة يظهر في البطاقة بوضوح مع شرح العوامل المؤثرة فيه.',
  },
  {
    icon: Scale,
    color: 'text-primary-200',
    bg: 'bg-primary-200/10',
    title: 'التظلمات وإعادة المراجعة',
    what: 'كل مرشح يحق له التظلم الرسمي على النتيجة أمام لجنة الحوكمة.',
    why: 'العدالة الحقيقية لا تكتمل دون حق الطعن، وإلا يبقى شعور بالظلم حتى لو النتيجة صحيحة.',
    risk: 'دون هذا: الثقة في المنظومة تنهار عند أول قرار مثير للجدل.',
    solution: 'آلية تظلم رسمية مع سجل موثق لكل مرحلة من مراحل القرار.',
  },
  {
    icon: Users,
    color: 'text-amber-200',
    bg: 'bg-amber-200/10',
    title: 'خريطة التعاقب الوظيفي',
    what: 'المنصة تبني تلقائياً صفاً قيادياً ثانياً وثالثاً لكل وحدة تنظيمية حرجة.',
    why: 'الفراغ القيادي المفاجئ من أكبر مخاطر الاستمرارية المؤسسية.',
    risk: 'دون هذا: خروج قيادي واحد يشل وحدة كاملة لأشهر.',
    solution: 'خريطة تعاقب حية تتحدث مع كل دورة تقييم — ليس خطة ورقية مرة كل سنتين.',
  },
  {
    icon: Bell,
    color: 'text-rose-300',
    bg: 'bg-rose-400/10',
    title: 'الإشعارات الاستباقية للقيادة',
    what: 'المنصة تنبه القيادة تلقائياً عند ظهور مرشح استثنائي أو خطر قيادي وشيك.',
    why: 'الانتظار حتى الاجتماع الدوري يعني تأخيراً قد يكون مكلفاً.',
    risk: 'دون هذا: الفرص تضيع والمخاطر تتراكم قبل أن تصل للطاولة الصحيحة.',
    solution: 'تنبيهات فورية لكبار المسؤولين عند أي حدث قيادي مؤثر.',
  },
  {
    icon: CheckCircle2,
    color: 'text-sage',
    bg: 'bg-sage/10',
    title: 'سجل الحوكمة والتدقيق الكامل',
    what: 'كل قرار، كل تعديل، كل اعتماد — يُسجل تلقائياً مع التوقيت والمسؤول.',
    why: 'المساءلة لا تكتمل دون أثر رقمي موثق لكل إجراء.',
    risk: 'دون هذا: أي قرار يُطعن فيه يصبح بلا إثبات ولا رواية موثوقة.',
    solution: 'سجل تدقيق شامل متاح للجنة الحوكمة في أي وقت، قابل للتصدير.',
  },
  {
    icon: Award,
    color: 'text-gold-400',
    bg: 'bg-gold-400/10',
    title: 'خطة التطوير الفردية المرتبطة بالنتيجة',
    what: 'عند صدور البطاقة القيادية، تقترح المنصة تلقائياً خطة تطوير مبنية على الفجوات المحددة.',
    why: 'التقييم بلا خطة عمل هو قياس بلا قيمة — المنصة تتبع التشخيص بالعلاج.',
    risk: 'دون هذا: المرشح يعرف نقاط ضعفه لكن لا يملك خارطة طريق واضحة للتحسن.',
    solution: 'خطة تطوير فردية تتكامل مع الموارد البشرية وتُتابع في دورة التقييم القادمة.',
  },
];

export default function CriticalPointsPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto" dir="rtl">
      <section className="text-center">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          ما الذي يجعل منصة جدير مختلفة؟
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          النقاط الحرجة <span className="text-gold-400">داخل المنصة</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          12 آلية تُميّز منصة جدير عن أي نظام تقييم تقليدي — كل واحدة تعالج مخاطرة حقيقية تواجهها المنظمات يومياً.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        {CRITICAL_POINTS.map((point, idx) => (
          <div key={idx} className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-gold-400/20 rounded-2xl p-6 transition-all group">
            <div className="flex items-start gap-4 mb-4">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${point.bg} flex-shrink-0`}>
                <point.icon className={`h-6 w-6 ${point.color}`} />
              </div>
              <div>
                <div className="text-xs text-white/30 mb-0.5">#{idx + 1}</div>
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-gold-300 transition">{point.title}</h3>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gold-400 font-bold flex-shrink-0 w-12 text-xs pt-0.5">ما هي؟</span>
                <span className="text-white/70 leading-relaxed">{point.what}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steelblue font-bold flex-shrink-0 w-12 text-xs pt-0.5">لماذا؟</span>
                <span className="text-white/60 leading-relaxed">{point.why}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-rose-300 font-bold flex-shrink-0 w-12 text-xs pt-0.5">الخطر</span>
                <span className="text-white/50 leading-relaxed italic">{point.risk}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <span className="text-sage font-bold flex-shrink-0 w-12 text-xs pt-0.5">الحل</span>
                <span className="text-white/80 leading-relaxed">{point.solution}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-8">
        <p className="text-xl md:text-2xl font-bold text-white mb-3">
          هذه ليست ميزات إضافية — هي الفرق بين نظام حقيقي وقائمة خانات فارغة.
        </p>
        <p className="text-white/50 text-sm">كل نقطة من النقاط الاثنتي عشرة تعالج خطراً يمكن أن يودي بأي عملية تقييم غير محمية.</p>
      </div>
    </div>
  );
}
