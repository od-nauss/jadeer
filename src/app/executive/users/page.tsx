import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function ExecutiveUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, job_title, department, email, user_roles(roles(code, name_ar))')
    .eq('is_active', true);

  return (
    <div>
      <PageHeader
        title="مستخدمو المنصة"
        description="عرض جميع مستخدمي المنصة. يمكنك مراقبة من يستخدم النظام وأدوارهم."
        icon={Users}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-200 text-right">
                <th className="py-3 px-3 font-semibold text-primary-700">الاسم</th>
                <th className="py-3 px-3 font-semibold text-primary-700">المسمى</th>
                <th className="py-3 px-3 font-semibold text-primary-700">الإدارة</th>
                <th className="py-3 px-3 font-semibold text-primary-700">الدور</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u) => {
                type RoleRow = { roles: { code: string; name_ar: string } };
                const userRoles = (u.user_roles || []) as RoleRow[];
                return (
                  <tr key={u.id} className="border-b border-gold-100 hover:bg-gold-50">
                    <td className="py-3 px-3 font-medium text-primary-800">{u.full_name}</td>
                    <td className="py-3 px-3 text-darkgray">{u.job_title || '—'}</td>
                    <td className="py-3 px-3 text-darkgray">{u.department || '—'}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {userRoles.map((ur, i) => (
                          <Badge key={i} variant="gold">{ur.roles.name_ar}</Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
