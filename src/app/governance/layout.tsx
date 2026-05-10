import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function GovernanceLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="governance">{children}</DashboardLayout>;
}
