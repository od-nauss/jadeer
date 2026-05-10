import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from('users')
    .select('*, user_roles(roles(code, name_ar))')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader
        title="إدارة المستخدمين"
        description="إدارة جميع مستخدمي المنصة: إضافة، تعديل، تعطيل، تغيير الأدوار، إعادة تعيين كلمات المرور."
        example="يمكنك تعطيل مستخدم لمنعه من الدخول دون حذف بياناته، أو تغيير دوره ليعرض البوابة المناسبة."
        icon={<Users className="h-5 w-5" />}
      />

      <Card>
        {users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">الاسم</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">البريد</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الإدارة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الدور</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">آخر دخول</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  type RoleRow = { roles: { code: string; name_ar: string } };
                  const userRoles = (u.user_roles || []) as RoleRow[];
                  return (
                    <tr key={u.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3 font-medium text-primary-800">{u.full_name}</td>
                      <td className="py-3 px-3 text-darkgray text-xs" dir="ltr">{u.email}</td>
                      <td className="py-3 px-3 text-darkgray">{u.department || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map((ur, i) => (
                            <Badge key={i} variant="gold">{ur.roles.name_ar}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {u.is_active ? <Badge variant="sage">مفعّل</Badge> : <Badge variant="wine">معطّل</Badge>}
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('ar-SA') : 'لم يسجل دخول'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<Users className="h-5 w-5" />} title="لا توجد مستخدمون" description="ابدأ بتشغيل seed لإنشاء الحسابات التجريبية." />
        )}
      </Card>
    </div>
  );
}
