import { Settings, Lock, Bell, Globe, Database, Cpu } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';
const SETTINGS_GROUPS = [
  {
    icon: Lock,
    title: 'الأمان والوصول',
    items: [
      { label: 'مدة جلسة العرض التنفيذي', value: '4 ساعات' },
      { label: 'كلمة دخول العرض التنفيذي', value: 'تُغيَّر من الإعدادات الآمنة', sensitive: true },
      { label: 'صلاحية رابط 360 لمقيم واحد', value: 'استخدام واحد فقط' },
      { label: 'مدة صلاحية رابط 360', value: '14 يوماً' },
    ],
  },
  {
    icon: Bell,
    title: 'الإشعارات',
    items: [
      { label: 'إشعارات داخل المنصة', value: 'مفعّلة' },
      { label: 'إشعارات البريد الإلكتروني', value: 'مفعّلة (تتطلب SMTP)' },
      { label: 'إشعارات SMS', value: 'غير مفعّلة' },
    ],
  },
  {
    icon: Cpu,
    title: 'الذكاء الاصطناعي',
    items: [
      { label: 'مزود الذكاء الاصطناعي', value: 'Anthropic / OpenAI (حسب البيئة)' },
      { label: 'تحليل الملفات', value: 'مفعّل' },
      { label: 'تحليل المبادرات', value: 'مفعّل' },
      { label: 'كشف التحيز في 360', value: 'مفعّل' },
      { label: 'توليد ملخص البطاقة القيادية', value: 'مفعّل' },
    ],
  },
  {
    icon: Globe,
    title: 'اللغة والمنطقة',
    items: [
      { label: 'اللغة الافتراضية', value: 'العربية (RTL)' },
      { label: 'دعم الإنجليزية', value: 'جاهز للتفعيل' },
      { label: 'تنسيق التاريخ', value: 'هجري + ميلادي' },
      { label: 'المنطقة الزمنية', value: 'Asia/Riyadh' },
    ],
  },
  {
    icon: Database,
    title: 'قاعدة البيانات والتخزين',
    items: [
      { label: 'مزود قاعدة البيانات', value: 'Supabase Postgres' },
      { label: 'النسخ الاحتياطي', value: 'يومي تلقائي (Supabase)' },
      { label: 'تشفير الاتصالات', value: 'TLS 1.3' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader
        title="إعدادات النظام"
        description="إعدادات النظام الشاملة. التعديلات الحساسة تتطلب موافقة لجنة الحوكمة وتُسجَّل في سجل التدقيق."
        icon={<Settings className="h-5 w-5" />}
      />

      <div className="space-y-6">
        {SETTINGS_GROUPS.map((group, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
                <group.icon className="h-5 w-5 text-gold-700" />
              </div>
              <h3 className="text-lg font-bold text-primary-700">{group.title}</h3>
            </div>
            <div className="space-y-2">
              {group.items.map((item, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between py-2 border-b border-gold-100 last:border-0"
                >
                  <span className="text-sm text-darkgray">{item.label}</span>
                  <span className={`text-sm font-medium ${item.sensitive ? 'text-wine' : 'text-primary-700'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
