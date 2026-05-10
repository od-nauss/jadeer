import { Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function AdminOrganizationPage() {
  const supabase = createClient();
  const { data: units } = await supabase
    .from('organization_units')
    .select('*')
    .order('unit_type')
    .order('name');

  return (
    <div>
      <PageHeader
        title="إدارة الهيكل التنظيمي"
        description="بناء وإدارة الهيكل التنظيمي للمنظمة. يستخدم الهيكل لقياس الملاءمة التنظيمية فقط، ولا يستخدم كأساس للتصنيف القيادي."
        example="يمكنك إضافة قطاعات، وكالات، إدارات، أقسام، وحدات، لجان، ومشاريع استراتيجية."
        icon={<Building2 className="h-5 w-5" />}
      />

      {units && units.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">الوحدة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">النوع</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">عدد الموظفين</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحساسية</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">شواغر</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} className="border-b border-gold-100 hover:bg-gold-50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-primary-800">{u.name}</div>
                      {u.description && (
                        <div className="text-xs text-darkgray">{u.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="primary">{u.unit_type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-darkgray">{u.employee_count || 0}</td>
                    <td className="py-3 px-3">
                      {u.is_critical ? (
                        <Badge variant="wine">حرجة</Badge>
                      ) : (
                        <Badge variant="gray">{u.sensitivity_level || 'عادية'}</Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {u.has_vacancy ? <Badge variant="gold">شاغر</Badge> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title="لا توجد وحدات تنظيمية"
          description="شغّل ملف seed لإنشاء الهيكل التنظيمي التجريبي."
        />
      )}
    </div>
  );
}
