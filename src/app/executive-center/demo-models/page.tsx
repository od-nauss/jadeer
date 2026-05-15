import Link from 'next/link';
import { AlertTriangle, ChevronLeft, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

const MODELS = [
  {
    name: 'نورة القحطاني',
    title: 'رئيس قسم العمليات',
    department: 'إدارة العمليات',
    score: 87,
    trustScore: 91,
    type: 'قائد تشغيلي',
    classification: 'جاهزة الآن',
    classColor: 'bg-green-900/60 text-green-300 border-green-500/30',
    barColor: 'bg-green-500',
    insight: 'نمط متسق عبر ٣ سنوات — أعلى ٨٪ من المتقدمين',
    strengths: ['قوة تشغيلية استثنائية', 'رضا فريق مرتفع باستمرار', 'مؤشرات أداء ناضجة', 'خبرة عميقة في تحسين الإجراءات'],
    gaps: ['تعزيز التخطيط الاستراتيجي طويل المدى'],
    recommendation: 'تكليف قيادي مباشر موصى به. الوحدة الأنسب: إدارة العمليات (ملاءمة ٩٢٪). برنامج مصاحب في التخطيط الاستراتيجي مدة ٦ أشهر.',
    fitUnit: 'إدارة العمليات',
    fitPct: 92,
  },
  {
    name: 'سعد الحارثي',
    title: 'مدير إدارة المشاريع',
    department: 'قطاع الشؤون الأكاديمية',
    score: 78,
    trustScore: 85,
    type: 'قائد استراتيجي',
    classification: 'جاهز خلال ١٢ شهراً',
    classColor: 'bg-blue-900/60 text-blue-300 border-blue-500/30',
    barColor: 'bg-blue-500',
    insight: 'مبادرات استراتيجية موثقة — يحتاج تجربة ميدانية أوسع',
    strengths: ['تخطيط استراتيجي قوي', 'بناء شبكات علاقات متميز', 'تحليل بيانات متقدم'],
    gaps: ['يحتاج تطويراً في إدارة الأزمات الميدانية', 'تجربة محدودة في قيادة فرق كبيرة'],
    recommendation: 'برنامج إعداد قيادي ٨ أشهر + تكليف بمشروع تنفيذي استراتيجي + إعادة تقييم بعد ١٢ شهراً.',
    fitUnit: 'إدارة المشاريع الاستراتيجية',
    fitPct: 84,
  },
  {
    name: 'هند العتيبي',
    title: 'مديرة وحدة دعم الفرق',
    department: 'إدارة دعم الفرق والمستفيدين',
    score: 76,
    trustScore: 88,
    type: 'قائد إنساني',
    classification: 'جاهزة مع تطوير موجه',
    classColor: 'bg-purple-900/60 text-purple-300 border-purple-500/30',
    barColor: 'bg-purple-500',
    insight: 'ذكاء عاطفي استثنائي — يحتاج تأهيلاً في إدارة بالنتائج',
    strengths: ['ذكاء عاطفي عالٍ جداً', 'دعم الفرق وبناء التماسك', 'إدارة الخلافات بفاعلية', 'رضا فريق ممتاز'],
    gaps: ['تعزيز إدارة مؤشرات الأداء', 'تطوير التفكير الاستراتيجي'],
    recommendation: 'تدريب في بناء مؤشرات الأداء + تكليف بإعداد لوحة مؤشرات فريق + متابعة الأثر بعد ٣ أشهر.',
    fitUnit: 'إدارة دعم الفرق',
    fitPct: 88,
  },
  {
    name: 'عبدالعزيز الدوسري',
    title: 'مهندس بيانات أول',
    department: 'إدارة التقنية والذكاء الاصطناعي',
    score: 71,
    trustScore: 77,
    type: 'قائد تقني',
    classification: 'واعد — يحتاج تطويراً موجهاً',
    classColor: 'bg-steelblue/50 text-blue-200 border-steelblue/40',
    barColor: 'bg-cyan-500',
    insight: 'كفاءة تقنية في أعلى مستوياتها — يحتاج تطوير مهارات القيادة الإنسانية',
    strengths: ['تخصص تقني عميق ونادر', 'ابتكار في الحلول التقنية', 'استخدام متقدم للذكاء الاصطناعي'],
    gaps: ['التواصل القيادي مع غير التقنيين', 'إدارة أصحاب العلاقة', 'تجربة محدودة في قيادة الفرق'],
    recommendation: 'برنامج التواصل القيادي + إدارة أصحاب العلاقة + تكليف بقيادة فريق صغير + إعادة تقييم بعد ٦ أشهر.',
    fitUnit: 'إدارة التقنية والذكاء الاصطناعي',
    fitPct: 71,
  },
  {
    name: 'فهد المطيري',
    title: 'مدير إدارة الجودة',
    department: 'إدارة الجودة والامتثال',
    score: 81,
    trustScore: 79,
    type: 'صاحب إنجاز قوي',
    classification: 'لا يناسب القيادة المباشرة حالياً',
    classColor: 'bg-amber-900/60 text-amber-300 border-amber-500/30',
    barColor: 'bg-amber-500',
    insight: 'أداء رقمي مرتفع — الفجوة في رضا الفريق تستوجب المعالجة قبل التكليف',
    strengths: ['أداء قوي وإنجازات موثقة', 'مبادرات مؤثرة', 'مؤشرات تشغيلية ناضجة'],
    gaps: ['رضا الفريق منخفض نسبياً', 'يحتاج تطوير في الذكاء العاطفي وإدارة الخلافات'],
    recommendation: 'تدريب في القيادة الإنسانية + إرشاد في إدارة الخلافات + قياس رضا الفريق بعد ٦ أشهر + إعادة تقييم قبل أي تكليف مباشر.',
    fitUnit: 'إدارة الجودة والامتثال',
    fitPct: 68,
  },
];

export default function DemoModelsPage() {
  return (
    <div className="space-y-14 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          نماذج قيادية تجريبية
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          خمسة نماذج قيادية مختلفة —<br />
          <span className="text-gold-400">خمس قصص حقيقية تحكيها البيانات</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          كل نموذج يُظهر نمطاً قيادياً مختلفاً مع مستوى جاهزيته وتوصيته —
          لتُدرك أن المنصة لا تُصنّف الجميع بنفس الطريقة.
        </p>
      </section>

      {/* ─── تحذير ─── */}
      <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-100/80">
          هذه بيانات افتراضية لأغراض العرض التنفيذي — لا تمثل تقييماً حقيقياً لأي موظف في أي جهة.
        </p>
      </div>

      {/* ─── Mock Screen: مقارنة المرشحين ─── */}
      <section>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">نظرة بانورامية على النماذج الخمسة</h2>
          <p className="text-white/50 text-sm">كما تبدو في لوحة القيادة العليا</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-xl">
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-md px-3 py-0.5 text-xs text-gray-300 text-center">
              jadeer.nauss.edu.sa/president/candidates
            </div>
          </div>
          <div className="bg-[#f8f6f0] p-4" dir="rtl">
            <div className="space-y-2">
              {MODELS.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-[#2D5A8B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.title}</div>
                  </div>
                  <div className="flex items-center gap-3 text-center">
                    <div>
                      <div className="text-sm font-bold text-[#2D5A8B]">{m.score}٪</div>
                      <div className="text-[10px] text-gray-400">جاهزية</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-green-600">{m.trustScore}٪</div>
                      <div className="text-[10px] text-gray-400">ثقة</div>
                    </div>
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${m.barColor} rounded-full`} style={{ width: `${m.score}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.classColor}`}>
                      {m.classification}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-3">⚠ بيانات افتراضية لأغراض العرض</p>
      </section>

      {/* ─── البطاقات التفصيلية ─── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">البطاقات التفصيلية لكل نموذج</h2>
        {MODELS.map((m, i) => (
          <div key={i}
            className="bg-white/5 border border-white/10 hover:border-gold-400/20 rounded-2xl overflow-hidden transition-all">

            {/* رأس البطاقة */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gold-500/20 flex items-center justify-center font-bold text-gold-300 text-lg flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-white">{m.name}</h3>
                    <span className={`text-xs font-bold border rounded-full px-3 py-0.5 ${m.classColor}`}>
                      {m.classification}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">{m.title} · {m.department}</p>
                  <p className="text-xs text-gold-400/70 mt-1 italic">"{m.insight}"</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400">{m.score}</div>
                  <div className="text-xs text-white/40">الجاهزية</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400">{m.trustScore}٪</div>
                  <div className="text-xs text-white/40">الثقة</div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-sm font-bold text-white">{m.type}</div>
                  <div className="text-xs text-white/40">النمط</div>
                </div>
              </div>
            </div>

            {/* تفاصيل */}
            <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">نقاط القوة</div>
                <ul className="space-y-1.5">
                  {m.strengths.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/75">
                      <span className="text-green-400 mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">فجوات التطوير</div>
                <ul className="space-y-1.5">
                  {m.gaps.map((g, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/75">
                      <span className="text-amber-400 mt-0.5">◦</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mx-6 mb-5 grid md:grid-cols-2 gap-3">
              <div className="bg-gold-500/5 border-r-2 border-gold-400/50 rounded-lg p-4">
                <div className="text-xs font-bold text-gold-300 mb-1">الوحدة الأنسب تنظيمياً</div>
                <div className="font-bold text-white">{m.fitUnit}</div>
                <div className="text-gold-400 font-bold">{m.fitPct}٪ ملاءمة</div>
              </div>
              <div className="bg-primary-700/20 border-r-2 border-primary-400/50 rounded-lg p-4">
                <div className="text-xs font-bold text-primary-300 mb-1">التوصية</div>
                <p className="text-sm text-white/80 leading-relaxed">{m.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ─── الخلاصة ─── */}
      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          خمسة أشخاص — خمسة ملفات مختلفة — خمسة قرارات دقيقة
        </h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          المنصة لا تُصنّف الجميع بنفس القالب — كل ملف قيادي تحليل مستقل يُعطي القيادة أدق صورة ممكنة.
        </p>
        <Link href="/executive-center/urgency"
          className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200 font-bold transition group">
          لماذا الاعتماد الآن وليس لاحقاً؟
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
