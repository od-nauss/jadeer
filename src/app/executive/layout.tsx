import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="president">{children}</DashboardLayout>;
}
