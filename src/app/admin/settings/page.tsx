import { Settings, Bell, Globe, Database, Cpu } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

const INFO_GROUPS = [
  {
    icon: Bell, title: 'الإشعارات',
    items: [
      { label: 'إشعارات داخل المنصة', value: 'مفعّلة' },
      { label: 'إشعارات البريد الإلكتروني', value: 'مفعّلة (تتطلب SMTP)' },
      { label: 'إشعارات SMS', value: 'غير مفعّلة' },
    ],
  },
  {
    icon: Cpu, title: 'الذكاء الاصطناعي',
    items: [
      { label: 'مزود الذكاء الاصطناعي', value: 'محرك قواعد (قابل لربط Anthropic/OpenAI)' },
      { label: 'تحليل الملفات والمبادرات', value: 'مفعّل' },
      { label: 'كشف التحيز في 360', value: 'مفعّل' },
      { label: 'إصدار البطاقة القيادية', value: 'ذكاء اصطناعي — لجنة الحوكمة تراجع الجودة فقط' },
    ],
  },
  {
    icon: Globe, title: 'اللغة والمنطقة',
    items: [
      { label: 'اللغة الافتراضية', value: 'العربية (RTL)' },
      { label: 'تنسيق التاريخ', value: 'هجري + ميلادي' },
      { label: 'المنطقة الزمنية', value: 'Asia/Riyadh' },
    ],
  },
  {
    icon: Database, title: 'قاعدة البيانات',
    items: [
      { label: 'مزود قاعدة البيانات', value: 'Supabase Postgres' },
      { label: 'النسخ الاحتياطي', value: 'يومي تلقائي' },
      { label: 'صلاحية رابط 360', value: 'استخدام واحد فقط — 14 يوماً' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div dir="rtl">
      <PageHeader
        title="إعدادات النظام"
        description="إعدادات المنصة الرئيسية. جميع التعديلات تُسجَّل في سجل التدقيق."
        icon={<Settings className="h-5 w-5" />}
      />

      <div className="space-y-5">
        {/* الإعدادات */}
        {INFO_GROUPS.map((group, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
                <group.icon className="h-5 w-5 text-gold-700" />
              </div>
              <h3 className="text-lg font-bold text-primary-700">{group.title}</h3>
            </div>
            <div className="space-y-2">
              {group.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between py-2 border-b border-gold-100 last:border-0">
                  <span className="text-sm text-darkgray">{item.label}</span>
                  <span className="text-sm font-medium text-primary-700 text-right max-w-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
