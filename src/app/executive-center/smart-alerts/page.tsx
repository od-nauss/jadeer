import { Bell, AlertTriangle, TrendingUp, Eye } from 'lucide-react';

const ALERTS = [
  {
    type: 'مرشح تجاوز 85٪',
    receivers: 'الرئيس + الموارد البشرية',
    why: 'مرشح يستحق التكليف الفوري',
    action: 'مراجعة البطاقة + خريطة الملاءمة',
    priority: 'عالية',
    color: 'sage',
  },
  {
    type: 'قيادة مخفية محتملة',
    receivers: 'الرئيس + اللجنة',
    why: 'موظف بمسمى غير قيادي يظهر مؤشرات قيادة قوية',
    action: 'مراجعة الملف ووضعه في خريطة التعاقب',
    priority: 'عالية',
    color: 'gold',
  },
  {
    type: 'مرشح عالي الأداء منخفض الرضا',
    receivers: 'الرئيس + الموارد + اللجنة',
    why: 'منجز قوي لا يناسب القيادة المباشرة',
    action: 'برنامج قيادة إنسانية قبل التكليف',
    priority: 'عالية',
    color: 'wine',
  },
  {
    type: 'مرشح مناسب لإدارة تشغيلية',
    receivers: 'الرئيس',
    why: 'ملاءمة عالية لمنصب شاغر',
    action: 'مراجعة ملاءمة الوحدة',
    priority: 'متوسطة',
    color: 'primary',
  },
  {
    type: 'وحدة تنظيمية بلا بديل قيادي',
    receivers: 'الرئيس + الموارد',
    why: 'مخاطر فراغ قيادي',
    action: 'مسابقة وظيفية أو خطة تطوير عاجلة',
    priority: 'عالية',
    color: 'wine',
  },
  {
    type: 'تقييم 360 ناقص',
    receivers: 'لجنة الحوكمة',
    why: 'التقييم لم يكتمل في الوقت المحدد',
    action: 'تمديد الروابط أو إغلاق مشروط',
    priority: 'متوسطة',
    color: 'gold',
  },
  {
    type: 'تقييم متطرف',
    receivers: 'لجنة الحوكمة',
    why: 'احتمال تحيز أو تضارب مصالح',
    action: 'مراجعة المقيم والتعليقات',
    priority: 'عالية',
    color: 'wine',
  },
  {
    type: 'تظلم جديد',
    receivers: 'لجنة الحوكمة',
    why: 'مرشح يطلب إعادة نظر',
    action: 'تحليل التظلم وإصدار قرار',
    priority: 'عالية',
    color: 'wine',
  },
  {
    type: 'خطة تطوير متأخرة',
    receivers: 'الموارد + المرشح',
    why: 'بنود لم تُنفذ في الموعد',
    action: 'متابعة وتذكير',
    priority: 'متوسطة',
    color: 'gold',
  },
  {
    type: 'مسابقة وظيفية أظهرت مرشحاً مميزاً',
    receivers: 'الرئيس',
    why: 'نتائج مهمة تحتاج انتباه قيادي',
    action: 'مراجعة نتائج المسابقة',
    priority: 'متوسطة',
    color: 'sage',
  },
];

export default function SmartAlertsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          الإشعارات <span className="text-gold-400">الذكية</span>
        </h1>
        <p className="text-xl text-gold-200">القيادة لا تكتشف بل تُنبَّه</p>
      </div>

      <div className="space-y-3">
        {ALERTS.map((alert, i) => (
          <div
            key={i}
            className="bg-white/5 border border-gold-500/20 rounded-xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gold-500/20 border border-gold-400/30 flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-gold-400" />
              </div>
              <div className="flex-1 grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">{alert.type}</div>
                  <div className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
                    alert.priority === 'عالية' ? 'bg-rose-500/20 text-rose-200' : 'bg-gold-500/20 text-gold-200'
                  }`}>
                    {alert.priority}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-gold-400 mb-1">المستلم</div>
                  <div className="text-white/80">{alert.receivers}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-gold-400 mb-1">السبب</div>
                  <div className="text-white/80">{alert.why}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-gold-400 mb-1">الإجراء المقترح</div>
                  <div className="text-white/80">{alert.action}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
