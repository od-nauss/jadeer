import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="advisor">{children}</DashboardLayout>;
}
