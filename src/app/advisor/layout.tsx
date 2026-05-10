import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';
export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="advisor">{children}</DashboardLayout>;
}
