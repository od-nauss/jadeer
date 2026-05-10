import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';
const ALLOWED_ROLES = ['admin', 'president', 'governance', 'hr', 'advisor'];

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const hasAccess = user.roles.some((r) => ALLOWED_ROLES.includes(r));
  if (!hasAccess) redirect('/unauthorized');

  // اختر دور بأولوية لتخصيص السايدبار
  const priority = ['admin', 'president', 'governance', 'hr', 'advisor'];
  const primaryRole = (priority.find((r) => user.roles.includes(r)) || 'president') as
    | 'admin'
    | 'president'
    | 'governance'
    | 'hr'
    | 'advisor';

  return <DashboardLayout expectedRole={primaryRole}>{children}</DashboardLayout>;
}
