import { Monitor, LayoutDashboard, FileText, Activity, Users, Award, Map, Target } from 'lucide-react';

const SCREENS = [
  {
    icon: LayoutDashboard,
    title: 'لوحة المستخدم',
    purpose: 'متابعة تقدم المرشح في مسار الجاهزية',
    user: 'المتقدم',
    importance: 'يرى نسبة الاكتمال والمراحل المتبقية والتذكيرات.',
  },
  {
    icon: FileText,
    title: 'الملف القيادي',
    purpose: 'إدخال البيانات الأساسية والخبرات',
    user: 'المتقدم',
    importance: 'الأساس الذي تُبنى عليه المراجعة الكاملة للجنة الحوكمة.',
  },
  {
    icon: Award,
    title: 'المبادرات والإنجازات',
    purpose: 'توثيق الأثر مع الشواهد',
    user: 'المتقدم',
    importance: 'تقاس قوة المبادرة بأثرها وقابلية التحقق منها.',
  },
  {
    icon: Activity,
    title: 'مؤشرات الأداء',
    purpose: 'المؤشرات التي استخدمها في عمله',
    user: 'المتقدم',
    importance: 'قياس نضج المرشح في الاعتماد على البيانات لا الانطباع.',
  },
  {
    icon: Users,
    title: 'تقييم 360',
    purpose: 'دائرة الثقة القيادية',
    user: 'المتقدم → اللجنة → المقيم',
    importance: 'الضامن الأكبر للعدالة عبر تعدد المصادر.',
  },
  {
    icon: LayoutDashboard,
    title: 'لوحة لجنة الحوكمة',
    purpose: 'مركز المراجعة والاعتماد',
    user: 'لجنة الحوكمة',
    importance: 'كل قرار يوثق ولا يُحذَف.',
  },
  {
    icon: Award,
    title: 'بطاقة المرشح القيادية',
    purpose: 'المخرَج النهائي بعد اعتماد اللجنة',
    user: 'القيادة',
    importance: 'تصنيف، نوع قيادة، مستوى ثقة، ملاءمة، توصية.',
  },
  {
    icon: LayoutDashboard,
    title: 'لوحة الرئيس',
    purpose: 'الصورة القيادية الكاملة للمنظمة',
    user: 'الرئيس',
    importance: 'رؤية تنفيذية مختصرة للقرار.',
  },
  {
    icon: Map,
    title: 'خريطة الملاءمة التنظيمية',
    purpose: 'ربط الكفاءات بالوحدات',
    user: 'الرئيس + اللجنة + الموارد',
    importance: 'التصنيف ≠ الملاءمة. الخريطة تجيب: أين يناسبه؟',
  },
  {
    icon: Target,
    title: 'خطط التطوير الفردية',
    purpose: 'تحويل الفجوات إلى خطط عملية',
    user: 'الموارد البشرية + المرشح',
    importance: 'دورة حياة كاملة: فجوة → خطة → تنفيذ → إعادة تقييم.',
  },
];

export default function SystemPreviewPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          لقطات من <span className="text-gold-400">داخل النظام</span>
        </h1>
        <p className="text-xl text-gold-200">المنصة جاهزة وملموسة، ليست عرضاً نظرياً</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {SCREENS.map((screen, i) => (
          <div
            key={i}
            className="bg-white/5 border border-gold-500/20 hover:border-gold-400/60 rounded-2xl p-6 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-500/5 border border-gold-400/30 flex items-center justify-center">
                <screen.icon className="h-6 w-6 text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{screen.title}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gold-300 font-semibold">الغرض: </span>
                <span className="text-white/80">{screen.purpose}</span>
              </div>
              <div>
                <span className="text-gold-300 font-semibold">المستخدم: </span>
                <span className="text-white/80">{screen.user}</span>
              </div>
              <div>
                <span className="text-gold-300 font-semibold">لماذا مهمة: </span>
                <span className="text-white/80">{screen.importance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gold-500/10 to-transparent border-r-4 border-gold-400 rounded-2xl p-6 text-center">
        <Monitor className="h-10 w-10 text-gold-400 mx-auto mb-3" />
        <p className="text-lg text-white/90">
          كل صفحة في المنصة مصممة بنفس المنهجية المؤسسية. التصميم هادئ، واضح، أكاديمي، ومناسب للقيادات.
        </p>
      </div>
    </div>
  );
}
