import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { UsersClient } from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, department, job_title, is_active, last_login_at, created_at, user_roles(roles(code, name_ar))')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div dir="rtl">
      <PageHeader
        title="إدارة المستخدمين"
        description="عرض وإدارة جميع مستخدمي المنصة. يمكنك تغيير الدور أو تفعيل/تعطيل المستخدم من هنا مباشرة."
        icon={<Users className="h-5 w-5" />}
      />

      <Card>
        {users && users.length > 0 ? (
          <UsersClient initialUsers={users as any} />
        ) : (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="لا يوجد مستخدمون"
            description="استخدم زر 'إضافة مستخدم' أو اطلب من المستخدمين التسجيل عبر صفحة التسجيل."
          />
        )}
      </Card>
    </div>
  );
}
