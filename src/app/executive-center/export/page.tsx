import { FileText, Download, Share2 } from 'lucide-react';

const EXPORT_OPTIONS = [
  { title: 'تصدير نسخة PDF كاملة من العرض التنفيذي', desc: 'كافة الأقسام في مستند واحد قابل للمشاركة' },
  { title: 'تصدير ملخص قيادي مختصر', desc: '5 صفحات تركز على الفكرة والقيمة والقرار المطلوب' },
  { title: 'تصدير نسخة موسعة', desc: 'جميع التفاصيل التقنية والمنهجية للمراجعة العميقة' },
  { title: 'تصدير صفحة القرار المطلوب', desc: 'نقاط الاعتماد السبعة فقط' },
  { title: 'تصدير قسم الأسئلة المتوقعة', desc: 'إجابات قيادية للأسئلة الحساسة' },
  { title: 'تصدير النماذج التجريبية', desc: 'بطاقات النماذج الخمسة للمناقشة' },
  { title: 'تصدير مؤشرات العرض', desc: 'البيانات التجريبية والرسوم البيانية' },
];

export default function ExportPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          تصدير <span className="text-gold-400">العرض</span>
        </h1>
        <p className="text-xl text-gold-200">خيارات المشاركة والتصدير</p>
      </div>

      <div className="bg-gold-500/10 border border-gold-400/40 rounded-xl p-4 text-sm text-gold-100">
        <strong>ملاحظة:</strong> ميزات التصدير الفعلية مجهزة بنيوياً ضمن المنصة وقابلة للتفعيل في
        مرحلة الإنتاج. الواجهة جاهزة، التنفيذ الكامل للتصدير يمكن إضافته لاحقاً حسب احتياج المنظمة.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {EXPORT_OPTIONS.map((opt, i) => (
          <button
            key={i}
            className="bg-white/5 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-400/60 rounded-xl p-5 text-right transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold-500/20 border border-gold-400/30 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-gold-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">{opt.title}</h3>
                <p className="text-xs text-white/60 mb-3">{opt.desc}</p>
                <div className="inline-flex items-center gap-1 text-xs text-gold-400 group-hover:text-gold-300">
                  <Download className="h-3 w-3" />
                  <span>تصدير PDF</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-gold-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Share2 className="h-6 w-6 text-gold-400 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-white mb-2">مشاركة العرض مع مستشار</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              يستطيع الرئيس مشاركة كامل العرض أو أقسام محددة منه مع مستشاريه عبر صلاحية موقتة.
              كل مشاركة تُسجَّل في سجل التدقيق.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
