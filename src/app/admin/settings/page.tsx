import { Settings, Lock, Bell, Globe, Database, Cpu } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { createServiceClient } from '@/lib/supabase/server';
import { ExecBypassToggle } from './ExecBypassToggle';

export const dynamic = 'force-dynamic';

async function getBypassStatus(): Promise<boolean> {
  try {
    const service = createServiceClient();
    const { data } = await service
      .from('executive_center_access')
      .select('bypass_active')
      .limit(1)
      .single();
    return data?.bypass_active === true;
  } catch {
    return false;
  }
}

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
      { label: 'تشفير الاتصالات', value: 'TLS 1.3' },
      { label: 'صلاحية رابط 360', value: 'استخدام واحد فقط' },
      { label: 'مدة صلاحية رابط 360', value: '14 يوماً' },
    ],
  },
];

export default async function AdminSettingsPage() {
  const bypassActive = await getBypassStatus();

  return (
    <div dir="rtl">
      <PageHeader
        title="إعدادات النظام"
        description="إعدادات المنصة الرئيسية. التعديلات تُسجَّل في سجل التدقيق."
        icon={<Settings className="h-5 w-5" />}
      />

      <div className="space-y-5">
        {/* الأمان — قابل للتعديل */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
              <Lock className="h-5 w-5 text-gold-700" />
            </div>
            <h3 className="text-lg font-bold text-primary-700">الأمان والوصول</h3>
          </div>

          {/* تبديل كلمة مرور العرض التنفيذي */}
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-bold text-primary-700 text-sm mb-1">
                  كلمة مرور مركز العرض التنفيذي
                </div>
                <div className="text-xs text-darkgray leading-relaxed">
                  عند التفعيل: يحتاج الزائر إدخال كلمة المرور <strong>1170</strong> للوصول للعرض.
                  <br />
                  عند الإيقاف: يفتح العرض مباشرة بدون كلمة مرور — مناسب أثناء جلسات العرض على القيادة.
                </div>
              </div>
              <ExecBypassToggle initialBypass={bypassActive} />
            </div>
            <div className={`mt-3 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${bypassActive ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sage/10 text-sage border border-sage/20'}`}>
              <span className={`h-2 w-2 rounded-full ${bypassActive ? 'bg-amber-500' : 'bg-sage'}`} />
              {bypassActive ? 'مفتوح الآن — بدون كلمة مرور' : 'محمي بكلمة المرور 1170'}
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
