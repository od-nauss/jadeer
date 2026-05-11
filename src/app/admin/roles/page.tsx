import { Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function AdminRolesPage() {
  const supabase = createClient();
  const { data: roles } = await supabase.from('roles').select('*').order('code');

  return (
    <div>
      <PageHeader
        title="الأدوار والصلاحيات"
        description="عرض وإدارة الأدوار الستة الأساسية في منصة جدير وصلاحيات كل دور."
        icon={<Shield className="h-5 w-5" />}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {(roles || []).map((role) => (
          <Card key={role.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-primary-700">{role.name_ar}</h3>
                <p className="text-xs text-darkgray mt-0.5" dir="ltr">{role.name_en}</p>
              </div>
              {role.is_system && <Badge variant="gold">نظامي</Badge>}
            </div>
            <p className="text-sm text-darkgray leading-relaxed mt-2">{role.description}</p>
            <div className="mt-3 pt-3 border-t border-gold-100 text-xs text-darkgray">
              الكود: <span className="font-mono text-primary-700">{role.code}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 institutional-card p-6 bg-gold-50 border-r-4 border-gold-400">
        <h3 className="font-bold text-primary-700 mb-2">ملاحظة مؤسسية</h3>
        <p className="text-sm text-darkgray leading-relaxed">
          الأدوار الستة الأساسية محمية ضد الحذف. يستطيع مدير النظام إنشاء أدوار مخصصة إضافية عند
          الحاجة، مع تحديد الصلاحيات المرتبطة بكل دور. كل تعديل يُسجَّل في سجل التدقيق.
        </p>
      </div>
    </div>
  );
}
