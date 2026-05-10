import { Users, Building2, Briefcase, ShieldCheck, GraduationCap } from 'lucide-react';

const BENEFICIARIES = [
  {
    icon: Briefcase,
    title: 'القيادة العليا',
    color: 'from-primary-500 to-primary-700',
    benefits: [
      'دعم قرارات التعيين والتكليف',
      'رؤية الكفاءات الجاهزة والواعدة',
      'اكتشاف قيادات لم تكن ظاهرة',
      'تقليل الاعتماد على الانطباعات',
      'معرفة المرشح الأنسب لكل وحدة',
      'رؤية مخاطر نقص البدائل القيادية',
      'بناء خريطة تعاقب وظيفي',
      'تحويل القرار القيادي إلى قرار مدعوم بالبيانات',
    ],
    message:
      'منصة جدير لا تسحب القرار من القيادة، بل تمنحها رؤية أوضح، وبدائل أكثر، وثقة أعلى في الاختيار.',
  },
  {
    icon: Users,
    title: 'الموظف المتقدم',
    color: 'from-gold-500 to-gold-700',
    benefits: [
      'فرصة عادلة لإظهار قدراته',
      'عرض المبادرات والإنجازات بطريقة منظمة',
      'إثبات الأثر أمام المنظمة',
      'دخول مسار تقييم واضح',
      'الحصول على خطة تطوير فردية',
      'الظهور أمام القيادة إذا كان يستحق ذلك',
      'عدم البقاء رهين الانطباع أو قرب الدائرة',
    ],
    message:
      'إذا كان لديك ما تقدمه، تمنحك منصة جدير مساحة منظمة لإثبات ذلك.',
  },
  {
    icon: GraduationCap,
    title: 'الموارد البشرية',
    color: 'from-sage to-primary-600',
    benefits: [
      'بناء مسارات تطوير مبنية على بيانات',
      'معرفة الفجوات القيادية المتكررة',
      'إدارة المسابقات الوظيفية',
      'تحويل نتائج التقييم إلى خطط تطوير',
      'متابعة جاهزية الصف الثاني',
      'توجيه البرامج التدريبية للمهارات الأكثر احتياجاً',
    ],
    message: 'الموارد البشرية أصبحت شريكاً تطويرياً مدعوماً بالبيانات.',
  },
  {
    icon: ShieldCheck,
    title: 'لجنة الحوكمة',
    color: 'from-wine to-primary-700',
    benefits: [
      'امتلاك أدوات مراجعة وعدالة',
      'منع الاعتماد على رأي واحد',
      'اعتماد المقيمين',
      'مراجعة التحيزات',
      'توثيق القرارات',
      'معالجة التظلمات',
      'ضمان سلامة التصنيف',
    ],
    message: 'اللجنة هي صمام العدالة، والمنصة توفر لها الأدوات.',
  },
  {
    icon: Building2,
    title: 'المنظمة',
    color: 'from-steelblue to-primary-700',
    benefits: [
      'حماية الاستدامة القيادية',
      'تقليل مخاطر فراغ المناصب',
      'رفع عدالة الفرص',
      'تعزيز الثقة الداخلية',
      'رفع جودة قرارات التكليف',
      'اكتشاف الكفاءات المخفية',
      'توجيه التطوير والاستثمار البشري بذكاء',
    ],
    message: 'كل منظمة تحتاج نظاماً يحمي قيادتها قبل الحاجة إليها.',
  },
];

export default function BeneficiariesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          من <span className="text-gold-400">المستفيد</span> من المنصة
        </h1>
        <p className="text-xl text-gold-200">خمس فئات تستفيد مؤسسياً</p>
      </div>

      <div className="space-y-6">
        {BENEFICIARIES.map((b, i) => (
          <div
            key={i}
            className="bg-white/5 border border-gold-500/20 rounded-2xl overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${b.color} px-6 py-4 flex items-center gap-3`}>
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <b.icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{b.title}</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gold-300 mb-3">كيف يستفيد؟</h3>
                <ul className="space-y-2">
                  {b.benefits.map((bene, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="text-gold-400 font-bold mt-0.5">•</span>
                      <span>{bene}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gold-500/10 border-r-4 border-gold-400 rounded-lg p-4 self-start">
                <p className="text-gold-200 italic leading-relaxed">{b.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
