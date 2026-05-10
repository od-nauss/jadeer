import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';
const MODELS = [
  {
    name: 'سعد الحارثي',
    title: 'مدير إدارة المشاريع',
    department: 'قطاع الشؤون الأكاديمية',
    score: 78,
    trustScore: 85,
    type: 'قائد استراتيجي',
    classification: 'جاهز خلال سنة',
    color: 'gold',
    strengths: ['تخطيط استراتيجي قوي', 'بناء شبكات علاقات', 'تحليل البيانات'],
    gaps: ['يحتاج تطويراً في إدارة الأزمات', 'تجربة محدودة في الفرق الكبيرة'],
    reasoning: 'ملف قوي مع مبادرات استراتيجية موثقة، لكن يحتاج تجربة قيادية ميدانية إضافية قبل التكليف الكامل.',
    recommendation: 'برنامج إعداد قيادي 8 أشهر + تكليف بمشروع تنفيذي + إعادة تقييم بعد سنة.',
  },
  {
    name: 'نورة القحطاني',
    title: 'رئيس قسم العمليات',
    department: 'إدارة العمليات',
    score: 87,
    trustScore: 91,
    type: 'قائد تشغيلي',
    classification: 'جاهز الآن',
    color: 'sage',
    strengths: ['قوة تشغيلية', 'رضا فريق مرتفع', 'مؤشرات أداء ناضجة', 'خبرة في تحسين الإجراءات'],
    gaps: ['تعزيز التخطيط طويل المدى'],
    reasoning: 'بيانات متسقة جداً عبر المصادر. تقييم 360 يدعم الأداء، المبادرات موثقة، رضا الفريق عالٍ.',
    recommendation: 'تكليف قيادي مباشر + برنامج قصير في التخطيط الاستراتيجي + متابعة بعد 3 أشهر.',
  },
  {
    name: 'عبدالعزيز الدوسري',
    title: 'مهندس بيانات أول',
    department: 'إدارة التقنية والذكاء الاصطناعي',
    score: 71,
    trustScore: 77,
    type: 'قائد تقني',
    classification: 'واعد ويحتاج تطويراً موجهاً',
    color: 'steelblue',
    strengths: ['تخصص تقني عميق', 'ابتكار في الحلول', 'استخدام متقدم للذكاء الاصطناعي'],
    gaps: ['التواصل القيادي', 'إدارة أصحاب العلاقة', 'محدودية في إدارة الفرق'],
    reasoning: 'كفاءة تقنية عالية لكن بحاجة لتطوير في القيادة الناعمة قبل التكليف بإدارة كبيرة.',
    recommendation: 'برنامج التواصل القيادي + إدارة أصحاب العلاقة + تكليف بفريق صغير + إعادة تقييم بعد 6 أشهر.',
  },
  {
    name: 'هند العتيبي',
    title: 'مديرة وحدة دعم الفرق',
    department: 'إدارة دعم الفرق والمستفيدين',
    score: 76,
    trustScore: 88,
    type: 'قائد إنساني',
    classification: 'قائد إنساني محتمل',
    color: 'primary',
    strengths: ['ذكاء عاطفي عالٍ', 'دعم الفرق', 'إدارة الخلافات', 'رضا فريق ممتاز'],
    gaps: ['ضعف في مؤشرات الأداء', 'تحتاج تأهيلاً في المؤشرات والنتائج', 'تفكير استراتيجي محدود'],
    reasoning: 'قائد إنساني مناسب لفرق الدعم، لكن يحتاج تأهيلاً في إدارة بالنتائج قبل التوسع لقيادة أكبر.',
    recommendation: 'تدريب على بناء مؤشرات الأداء + تكليف بإعداد لوحة مؤشرات + متابعة الأثر بعد 3 أشهر.',
  },
  {
    name: 'فهد المطيري',
    title: 'مدير إدارة الجودة',
    department: 'إدارة الجودة والامتثال',
    score: 81,
    trustScore: 79,
    type: 'صاحب إنجاز قوي',
    classification: 'لا يناسب القيادة المباشرة حالياً',
    color: 'wine',
    strengths: ['أداء قوي', 'مبادرات مؤثرة', 'مؤشرات تشغيلية ناضجة', 'إنجازات موثقة'],
    gaps: ['رضا الفريق منخفض', 'إدارة الخلافات', 'الذكاء العاطفي', 'مرونة في التعامل'],
    reasoning: 'هذا المرشح يحقق نتائج قوية، لكن تقييم رضا الفريق منخفض. ينصح بمراجعة نمط القيادة قبل اعتماد جاهزية قيادية مباشرة.',
    recommendation: 'تدريب في القيادة الإنسانية + إرشاد في إدارة الخلافات + قياس رضا الفريق لاحقاً + عدم تكليف مباشر بفريق كبير قبل التحسن.',
  },
];

export default function DemoModelsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          النماذج <span className="text-gold-400">التجريبية</span>
        </h1>
        <p className="text-xl text-gold-200">خمسة نماذج قيادية مختلفة</p>
      </div>

      <div className="bg-gold-500/10 border border-gold-400/40 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gold-100">
          هذه بيانات افتراضية لأغراض العرض والتجربة، ولا تمثل تقييماً حقيقياً لأي موظف.
        </p>
      </div>

      <div className="space-y-5">
        {MODELS.map((m, i) => (
          <div
            key={i}
            className="bg-white/5 border border-gold-500/20 rounded-2xl p-6 hover:border-gold-400/50 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white">{m.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    m.color === 'sage' ? 'bg-sage/30 text-green-200' :
                    m.color === 'gold' ? 'bg-gold-500/30 text-gold-200' :
                    m.color === 'steelblue' ? 'bg-steelblue/30 text-blue-200' :
                    m.color === 'primary' ? 'bg-primary-500/30 text-primary-100' :
                    'bg-wine/40 text-rose-200'
                  }`}>
                    {m.classification}
                  </span>
                </div>
                <p className="text-sm text-white/60">{m.title} — {m.department}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400">{m.score}%</div>
                  <div className="text-xs text-white/50">الجاهزية</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400">{m.trustScore}%</div>
                  <div className="text-xs text-white/50">الثقة</div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-sm font-bold text-white">{m.type}</div>
                  <div className="text-xs text-white/50">نوع القيادة</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs uppercase text-sage font-bold mb-2">نقاط القوة</div>
                <ul className="space-y-1">
                  {m.strengths.map((s, j) => (
                    <li key={j} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-sage">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase text-rose-400 font-bold mb-2">فجوات التطوير</div>
                <ul className="space-y-1">
                  {m.gaps.map((g, j) => (
                    <li key={j} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-rose-400">−</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gold-500/5 border-r-2 border-gold-400 rounded-lg p-4 mb-3">
              <div className="text-xs uppercase text-gold-300 font-bold mb-1">سبب التصنيف</div>
              <p className="text-sm text-white/85 leading-relaxed">{m.reasoning}</p>
            </div>

            <div className="bg-primary-700/20 border-r-2 border-primary-400 rounded-lg p-4">
              <div className="text-xs uppercase text-primary-300 font-bold mb-1">التوصية</div>
              <p className="text-sm text-white/85 leading-relaxed">{m.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
