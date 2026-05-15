import Link from 'next/link';
import { ChevronLeft, Monitor } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SystemPreviewPage() {
  return (
    <div className="space-y-20 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          المنصة مشغّلة وجاهزة
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          لقطات حقيقية <span className="text-gold-400">من داخل النظام</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          ما تراه ليس تصميماً مقترحاً — بل لقطات من المنصة الفعلية الجاهزة للإطلاق.
        </p>
      </section>

      {/* ─── Mock 1: لوحة القيادة العليا (لوحة الرئيس) ─── */}
      <section>
        <div className="mb-6">
          <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-4 py-1 text-gold-300 text-xs font-bold mb-3">
            الشاشة الأولى
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">لوحة القيادة العليا — مركز الرؤية التنفيذية</h2>
          <p className="text-white/50 text-sm">ما يراه الرئيس حين يفتح المنصة — صورة كاملة بنقرة واحدة</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-md px-3 py-0.5 text-xs text-gray-300 text-center">
              jadeer.nauss.edu.sa/president/dashboard
            </div>
          </div>

          <div className="bg-[#0d1b2a] p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[#E8D5A3] text-xs font-bold mb-1">الدورة الثانية 1447هـ · مركز القيادة العليا</div>
                <h3 className="text-xl font-bold text-white">لوحة جاهزية الكفاءات القيادية</h3>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-green-900/60 text-green-300 border border-green-500/30 px-3 py-1 rounded-full font-medium">● مباشر</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { val: '23', label: 'إجمالي المتقدمين', color: 'text-[#E8D5A3]' },
                { val: '8', label: 'جاهزون للتكليف', color: 'text-green-400' },
                { val: '11', label: 'تحت التطوير', color: 'text-blue-400' },
                { val: '2', label: 'وحدات حرجة بلا بديل', color: 'text-red-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.val}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Top Candidates Table */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-[#E8D5A3] mb-3">أعلى المرشحين جاهزيةً</div>
              <div className="space-y-2">
                {[
                  { name: 'نورة القحطاني', dept: 'إدارة العمليات', score: 87, trust: 91, status: 'جاهزة الآن', statusColor: 'bg-green-900/60 text-green-300' },
                  { name: 'فهد المطيري', dept: 'إدارة الجودة', score: 81, trust: 79, status: 'جاهز مشروط', statusColor: 'bg-yellow-900/60 text-yellow-300' },
                  { name: 'سعد الحارثي', dept: 'المشاريع الاستراتيجية', score: 78, trust: 85, status: 'جاهز خلال سنة', statusColor: 'bg-blue-900/60 text-blue-300' },
                ].map((cand, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                    <div className="h-7 w-7 rounded-full bg-[#2D5A8B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{cand.name}</div>
                      <div className="text-xs text-gray-400">{cand.dept}</div>
                    </div>
                    <div className="text-left flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-bold text-[#E8D5A3]">{cand.score}٪</div>
                        <div className="text-[10px] text-gray-500">جاهزية</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-green-400">{cand.trust}٪</div>
                        <div className="text-[10px] text-gray-500">ثقة</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cand.statusColor}`}>
                        {cand.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert */}
            <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div>
                <span className="text-sm font-bold text-red-300">تنبيه حرج: </span>
                <span className="text-sm text-white/70">إدارة الجودة وقطاع التحول الرقمي — لا يوجد بديل قيادي جاهز. يُوصى باتخاذ إجراء.</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-3">⚠ بيانات افتراضية لأغراض العرض</p>
      </section>

      {/* ─── Mock 2: البطاقة القيادية ─── */}
      <section>
        <div className="mb-6">
          <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-4 py-1 text-gold-300 text-xs font-bold mb-3">
            الشاشة الثانية
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">البطاقة القيادية — المخرج النهائي المعتمد</h2>
          <p className="text-white/50 text-sm">الملف التحليلي الكامل الذي يصل لمتخذ القرار لكل مرشح</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-md px-3 py-0.5 text-xs text-gray-300 text-center">
              jadeer.nauss.edu.sa/president/cards/JDR-2026-019
            </div>
          </div>

          <div className="bg-[#f8f6f0] p-5" dir="rtl">
            {/* Card Header */}
            <div className="bg-[#1a365d] rounded-xl p-5 mb-4 flex items-start justify-between">
              <div>
                <div className="text-[#E8D5A3] text-xs mb-1 font-medium">بطاقة قيادية معتمدة · الدورة الثانية 1447هـ</div>
                <h3 className="text-2xl font-bold text-white">نورة القحطاني</h3>
                <p className="text-blue-200 text-sm mt-0.5">رئيس قسم العمليات · إدارة العمليات</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#E8D5A3]">87</div>
                <div className="text-xs text-blue-300">درجة الجاهزية</div>
                <div className="text-sm font-bold text-green-300 mt-1">جاهزة الآن</div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">91٪</div>
                <div className="text-xs text-gray-500">مستوى الثقة</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                <div className="text-sm font-bold text-blue-600 mt-1">قائد تشغيلي</div>
                <div className="text-xs text-gray-500">النمط القيادي</div>
              </div>
              <div className="bg-[#fdf8ee] border-2 border-[#E8D5A3] rounded-xl p-3 text-center">
                <div className="text-sm font-bold text-[#7A5C00] mt-1">إدارة العمليات</div>
                <div className="text-xs text-gray-500">الوحدة الأنسب</div>
              </div>
            </div>

            {/* Axes Breakdown */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-gray-600 mb-3">التفصيل حسب المحاور السبعة</div>
              <div className="space-y-2">
                {[
                  { name: 'القيادة والأثر', score: 90, max: 20 },
                  { name: 'التفكير الاستراتيجي', score: 87, max: 15 },
                  { name: 'الأداء والإنجاز', score: 93, max: 15 },
                  { name: 'الابتكار', score: 80, max: 15 },
                ].map((axis, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-36 flex-shrink-0">{axis.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D5A8B] rounded-full" style={{ width: `${axis.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#2D5A8B] w-8 text-left">{axis.score}٪</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-[#1a365d] rounded-xl p-4">
              <div className="text-xs text-[#E8D5A3] font-bold mb-1">توصية الذكاء الاصطناعي — معتمدة من لجنة الحوكمة</div>
              <p className="text-sm text-white/85 leading-relaxed">
                تكليف قيادي مباشر موصى به. الوحدة الأنسب: إدارة العمليات (ملاءمة 92٪). برنامج مصاحب في التخطيط الاستراتيجي مدة 6 أشهر.
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-3">⚠ بيانات افتراضية لأغراض العرض</p>
      </section>

      {/* ─── Mock 3: لوحة لجنة الحوكمة ─── */}
      <section>
        <div className="mb-6">
          <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-4 py-1 text-gold-300 text-xs font-bold mb-3">
            الشاشة الثالثة
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">لوحة لجنة الحوكمة — مركز المراجعة والاعتماد</h2>
          <p className="text-white/50 text-sm">الأدوات التي تضمن سلامة كل إجراء وتوثيق كل قرار</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-md px-3 py-0.5 text-xs text-gray-300 text-center">
              jadeer.nauss.edu.sa/governance/dashboard
            </div>
          </div>

          <div className="bg-[#f0f4f8] p-5" dir="rtl">
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">لوحة الحوكمة — قائمة المراجعة المعلقة</h3>
            <div className="space-y-2">
              {[
                { name: 'سعد الحارثي', stage: 'اعتماد المقيّمين', alert: null, time: 'منذ 2 يوم' },
                { name: 'نورة القحطاني', stage: 'مراجعة تقرير AI', alert: null, time: 'منذ 5 ساعات' },
                { name: 'عبدالعزيز الدوسري', stage: 'كشف تحيز محتمل', alert: '⚠ مقيّم يحتاج مراجعة', time: 'منذ ساعة' },
                { name: 'هند العتيبي', stage: 'مراجعة التظلم', alert: '📋 طلب إعادة مراجعة', time: 'منذ 3 أيام' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${item.alert ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                  <div className="h-8 w-8 rounded-full bg-[#2D5A8B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.stage}</div>
                    {item.alert && <div className="text-xs text-amber-700 font-medium mt-0.5">{item.alert}</div>}
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{item.time}</div>
                  <button className="text-xs bg-[#2D5A8B] text-white px-3 py-1 rounded-lg flex-shrink-0">مراجعة</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-3">⚠ بيانات افتراضية لأغراض العرض</p>
      </section>

      {/* ─── الخلاصة ─── */}
      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-8">
        <Monitor className="h-10 w-10 text-gold-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-3">
          كل شاشة مصممة لخدمة صاحبها بدقة
        </h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          الرئيس يرى الصورة الكاملة. اللجنة تملك أدوات الحوكمة. الموظف يتابع مساره.
          كل بوابة مُصممة لاحتياج صاحبها الفعلي.
        </p>
        <Link href="/executive-center/critical-points"
          className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200 font-bold transition group">
          ما الذي يجعل جدير مختلفة؟ النقاط الحرجة
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
