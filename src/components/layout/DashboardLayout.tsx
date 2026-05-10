import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { RoleCode } from '@/lib/auth/roles';

interface DashboardLayoutProps {
  children: React.ReactNode;
  expectedRole: RoleCode;
}

export async function DashboardLayout({
  children,
  expectedRole,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // مدير النظام مسموح له بالوصول لأي دور (للمعاينة)
  // غير ذلك: تأكد من تطابق الدور
  if (!user.isAdmin && !user.roles.includes(expectedRole)) {
    redirect('/unauthorized');
  }

  // الدور المعروض في السايدبار = الدور المتوقع للصفحة
  const displayRole = expectedRole;

  return (
    <div className="min-h-screen institutional-bg">
      <Sidebar role={displayRole} />

      <div className="md:mr-72">
        <Topbar
          fullName={user.fullName}
          email={user.email}
          role={displayRole}
          isAdmin={user.isAdmin}
        />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="px-4 md:px-8 py-6 text-center text-xs text-darkgray border-t border-gold-200 mt-12">
          © 2026 جامعة نايف العربية للعلوم الأمنية - منصة جدير
        </footer>
      </div>
    </div>
  );
}
