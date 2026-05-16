import { Users, Clock } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card } from '@/components/ui';
import { UsersClient } from './UsersClient';
import { PendingApprovals } from './PendingApprovals';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const [usersResult, pendingResult, candidacyResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, email, department, job_title, is_active, last_login_at, created_at, registration_status, user_roles(roles(code, name_ar))')
      .eq('registration_status', 'active')
      .order('created_at', { ascending: false })
      .limit(200),

    supabase
      .from('users')
      .select('id, full_name, email, department, job_title, created_at')
      .eq('registration_status', 'pending')
      .order('created_at', { ascending: false }),

    supabase
      .from('candidacy_requests')
      .select('id, justification, created_at, users(id, full_name, email, job_title, department)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ]);

  const activeUsers = usersResult.data || [];
  const pendingUsers = pendingResult.data || [];
  const candidacyRequests = candidacyResult.data || [];
  const totalPending = pendingUsers.length + candidacyRequests.length;

  return (
    <div dir="rtl">
      <PageHeader
        title="إدارة المستخدمين"
        description="عرض وإدارة جميع مستخدمي المنصة. يمكنك الموافقة على طلبات التسجيل، تغيير الأدوار، أو تفعيل/تعطيل المستخدمين."
        icon={<Users className="h-5 w-5" />}
      />

      {/* Pending Approvals Section */}
      {totalPending > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gold-600" />
              <h2 className="text-lg font-bold text-primary-700">الطلبات المعلقة</h2>
            </div>
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 bg-wine text-white text-xs font-bold rounded-full">
              {totalPending}
            </span>
          </div>
          <PendingApprovals
            pendingUsers={pendingUsers as any}
            candidacyRequests={candidacyRequests as any}
          />
        </Card>
      )}

      {/* Active Users Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-primary-700">المستخدمون النشطون</h2>
          <span className="text-sm text-darkgray">({activeUsers.length})</span>
        </div>
        {activeUsers.length > 0 ? (
          <UsersClient initialUsers={activeUsers as any} />
        ) : (
          <div className="text-center py-8 text-darkgray text-sm">
            لا يوجد مستخدمون نشطون حتى الآن
          </div>
        )}
      </Card>
    </div>
  );
}
