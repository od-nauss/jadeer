import { Settings, Lock, Bell, Globe, Database, Cpu } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { cookies } from 'next/headers';
import { ExecBypassToggle } from './ExecBypassToggle';

export const dynamic = 'force-dynamic';

const INFO_GROUPS = [
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
      { label: 'تحليل الملفات والمبادرات', value: 'مفعّل (قواعد)' },
      { label: 'كشف التحيز في 360', value: 'مفعّل' },
      { label: 'توليد ملخص البطاقة القيادية', value: 'مفعّل' },
    ],
  },
  {
    icon: Globe,
    title: 'اللغة والمنطقة',
    items: [
      { label: 'اللغة الافتراضية', value: 'العربية (RTL)' },
      { label: 'تنسيق التاريخ', value: 'هجري + ميلادي' },
      { label: 'المنطقة الزمنية', value: 'Asia/Riyadh' },
    ],
  },
  {
    icon: Database,
    title: 'قاعدة البيانات',
    items: [
      { label: 'مزود قاعدة البيانات', value: 'Supabase Postgres' },
      { label: 'النسخ الاحتياطي', value: 'يومي تلقائي' },
      { label: 'صلاحية رابط 360', value: 'استخدام واحد فقط — 14 يوماً' },
    ],
  },
];

export default function AdminSettingsPage() {
  const cookieStore = cookies();
  const bypassCookie = cookieStore.get('exec_center_bypass');
  const bypassActive = bypassCookie?.value === 'granted' || process.env.EXEC_CENTER_NO_PASSWORD === 'true';

  return (
    <div dir="rtl">
      <PageHeader
        title="إعدادات النظام"
        description="إعدادات المنصة. التعديلات تُسجَّل في سجل التدقيق."
        icon={<Settings className="h-5 w-5" />}
      />

      <div className="space-y-5">
        {/* الأمان — تفاعلي */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
              <Lock className="h-5 w-5 text-gold-700" />
            </div>
            <h3 className="text-lg font-bold text-primary-700">الأمان والوصول</h3>
          </div>

          <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-bold text-primary-700 text-sm mb-1">
                  كلمة مرور مركز العرض التنفيذي
                </div>
                <div className="text-xs text-darkgray leading-relaxed">
                  <strong>مغلق (أخضر):</strong> يطلب كلمة المرور <strong>1170</strong> للدخول.
                  <br />
                  <strong>مفتوح (أصفر):</strong> دخول مباشر بدون كلمة مرور — للعرض على القيادة.
                </div>
              </div>
              <ExecBypassToggle initialBypass={bypassActive} />
            </div>
            <div className={`mt-3 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 border ${
              bypassActive
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-sage/10 text-sage border-sage/20'
            }`}>
              <span className={`h-2 w-2 rounded-full ${bypassActive ? 'bg-amber-500' : 'bg-sage'}`} />
              {bypassActive
                ? 'العرض التنفيذي مفتوح الآن بدون كلمة مرور'
                : 'العرض التنفيذي محمي بكلمة المرور 1170'}
            </div>
          </div>
        </Card>

        {/* باقي الإعدادات */}
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
                  <span className="text-sm font-medium text-primary-700">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
