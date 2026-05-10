import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="hr">{children}</DashboardLayout>;
}
