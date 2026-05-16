import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.registrationStatus === 'pending') {
    redirect('/pending-approval');
  }

  if (user.registrationStatus === 'rejected') {
    redirect('/pending-approval?status=rejected');
  }

  // Use the primary role for the sidebar/topbar
  const displayRole = user.primaryRole;

  return (
    <div className="min-h-screen institutional-bg">
      <Sidebar role={displayRole} />
      <div className="md:mr-72">
        <Topbar
          fullName={user.full_name}
          email={user.email}
          role={displayRole}
          isAdmin={user.isAdmin}
          userRoles={user.roles}
        />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
        <footer className="px-4 md:px-8 py-6 text-center text-xs text-darkgray border-t border-gold-200 mt-12">
          © 2026 جامعة نايف العربية للعلوم الأمنية - منصة جدير
        </footer>
      </div>
    </div>
  );
}
