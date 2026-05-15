import Link from 'next/link';
import { ChevronLeft, Map, TrendingUp, Target, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function OrganizationFitPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية — الجملة التي تفتح العقل ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          الميزة التنافسية الاستراتيجية
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          خريطة الملاءمة التنظيمية
        </h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl text-gold-300 font-bold mb-4 leading-relaxed">
            "أنتم تملكون الذهب —<br />
            جدير تُخبركم أين يلمع أكثر."
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            معرفة أن الموظف كفء شرط ضروري — لكنه غير كافٍ.
            السؤال الأعمق الذي تجيب عنه هذه الخريطة:
            <strong className="text-gold-300"> في أيّ وحدة تنظيمية تُحقق هذه الكفاءة أعلى قيمة ممكنة لمنظمتكم؟</strong>
          </p>
        </div>
      </section>

      {/* ─── الفرق بين التصنيف والملاءمة ─── */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-300" />
            </div>
            <div>
              <div className="text-xs text-white/40">السؤال الأول</div>
              <div className="font-bold text-white">التصنيف القيادي</div>
            </div>
          </div>
          <p className="text-sm text-white/65 leading-relaxed mb-3">
            يُجيب عن: <strong className="text-white">ما نوع هذا القائد؟ وما درجة جاهزيته؟</strong>
          </p>
          <div className="space-y-1.5">
            {['قائد استراتيجي — ٧٨٪', 'مستوى الثقة: عالٍ', 'جاهز خلال ١٢ شهراً'].map((v, i) => (
              <div key={i} className="text-xs text-gold-300 flex items-center gap-2">
                <span className="h-1 w-4 bg-gold-400/60 rounded-full" />{v}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gold-500/15 to-transparent border border-gold-400/30 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Map className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <div className="text-xs text-gold-400/60">السؤال الأعمق</div>
              <div className="font-bold text-white">الملاءمة التنظيمية</div>
            </div>
          </div>
          <p className="text-sm text-white/80 leading-relaxed mb-3">
            يُجيب عن: <strong className="text-gold-300">أين يُحقق هذا القائد أعلى قيمة داخل منظمتكم؟</strong>
          </p>
          <div className="space-y-1.5">
            {['إدارة العمليات: ٩٢٪ — ✓ الأنسب', 'إدارة المشاريع: ٨٤٪', 'الإدارة الاستراتيجية: ٦٨٪'].map((v, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${i === 0 ? 'text-gold-300 font-bold' : 'text-white/60'}`}>
                <span className={`h-1 w-4 rounded-full ${i === 0 ? 'bg-gold-400' : 'bg-white/20'}`} />{v}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mock Screen: خريطة الملاءمة ─── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">كيف تبدو الخريطة لمتخذ القرار</h2>
          <p className="text-white/50 text-sm">لقطة فعلية من لوحة الرئيس داخل منصة جدير</p>
        </div>

        {/* Mock Screen */}
        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          {/* Browser Bar */}
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-md px-3 py-0.5 text-xs text-gray-300 text-center">
              jadeer.nauss.edu.sa/organization/map
            </div>
          </div>

          {/* Screen Content */}
          <div className="bg-[#f8f6f0] p-5" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#2D5A8B]">خريطة الملاءمة التنظيمية</h3>
                <p className="text-xs text-gray-500">رؤية بانورامية للعلاقة بين الكفاءات والوحدات التنظيمية</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-[#E8D5A3] text-[#7A5C00] px-3 py-1 rounded-full font-medium">٥ مرشحين</span>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">٣ جاهزون</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'إدارة العمليات', type: 'إدارة', critical: true, candidate: 'نورة القحطاني', score: 92, level: 'ملاءمة عالية', color: 'border-green-300 bg-green-50' },
                { name: 'إدارة المشاريع الاستراتيجية', type: 'إدارة', critical: true, candidate: 'سعد الحارثي', score: 84, level: 'ملاءمة جيدة', color: 'border-blue-300 bg-blue-50' },
                { name: 'إدارة التقنية والذكاء الاصطناعي', type: 'إدارة', critical: true, candidate: 'عبدالعزيز الدوسري', score: 71, level: 'ملاءمة مشروطة', color: 'border-yellow-300 bg-yellow-50' },
                { name: 'إدارة دعم الفرق', type: 'إدارة', critical: false, candidate: 'هند العتيبي', score: 88, level: 'ملاءمة عالية', color: 'border-green-300 bg-green-50' },
                { name: 'إدارة الجودة والامتثال', type: 'إدارة', critical: true, candidate: null, score: 0, level: 'بلا مرشح', color: 'border-red-300 bg-red-50' },
                { name: 'قطاع التحول الرقمي', type: 'قطاع', critical: true, candidate: null, score: 0, level: 'بلا مرشح', color: 'border-red-300 bg-red-50' },
              ].map((unit, i) => (
                <div key={i} className={`p-3 rounded-xl border-2 ${unit.color}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800 leading-tight">{unit.name}</div>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{unit.type}</span>
                        {unit.critical && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">حرجة</span>}
                      </div>
                    </div>
                    {unit.score > 0 && (
                      <div className="text-xl font-bold text-[#2D5A8B]">{unit.score}٪</div>
                    )}
                  </div>
                  {unit.candidate ? (
                    <div className="mt-2 p-2 bg-white/80 rounded-lg">
                      <div className="text-[10px] text-gray-500">أفضل ملاءمة</div>
                      <div className="text-xs font-bold text-[#2D5A8B]">{unit.candidate}</div>
                      <div className={`text-[10px] mt-0.5 font-medium ${unit.score >= 85 ? 'text-green-600' : unit.score >= 70 ? 'text-blue-600' : 'text-yellow-600'}`}>{unit.level}</div>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1">
                      <span className="text-red-500 text-xs">⚠</span>
                      <span className="text-xs text-red-600">وحدة حرجة — لا يوجد بديل</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Stats */}
            <div className="flex gap-3 mt-4">
              <div className="text-xs bg-[#2D5A8B] text-white px-3 py-1.5 rounded-lg">٤ وحدات لديها مرشحون</div>
              <div className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg">٢ وحدات حرجة بلا بديل</div>
              <div className="text-xs bg-[#E8D5A3] text-[#7A5C00] px-3 py-1.5 rounded-lg">حساب الملاءمة: تلقائي</div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-3">
          ⚠ هذه بيانات افتراضية لأغراض العرض — لا تمثل تقييماً حقيقياً لأي موظف
        </p>
      </section>

      {/* ─── القيمة التنافسية الفريدة ─── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">لماذا هذه الخريطة تُغيّر قواعد اللعبة؟</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: 'الفراغ القيادي — قبل وقوعه', body: 'ترى بوضوح الوحدات التي ستحتاج قيادة وعندها من الجاهز — قبل أن يتحول الفراغ إلى أزمة.' },
            { icon: Target, title: 'الكفاءة في موضعها الأمثل', body: 'لا يكفي أن تعرف أن الموظف متميز — الخريطة تُريك في أي وحدة تُحقق كفاءته أعلى عائد مؤسسي.' },
            { icon: TrendingUp, title: 'قرار مدعوم بالبيانات', body: 'حين تتخذ قرار التكليف، لديك ملف يقول: هذا الشخص في هذه الوحدة — ٩٢٪ ملاءمة — ولهذه الأسباب.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold-400/20 transition">
                <Icon className="h-8 w-8 text-gold-400 mb-4" />
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── الرسالة الختامية ─── */}
      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          المنظمة التي تعرف أين تضع كل كفاءة<br />
          <span className="text-gold-400">تتفوق على من يمتلك أضعاف مواردها</span>
        </h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
          الخريطة لا تُصدر قرار التكليف — بل تُعطي قيادتكم الرؤية الكاملة لكل خيار ممكن مع سنده التحليلي.
        </p>
        <Link href="/executive-center/demo-models"
          className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 font-bold transition group">
          شاهد النماذج الخمسة التجريبية
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
