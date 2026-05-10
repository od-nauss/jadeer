import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';
export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="president">{children}</DashboardLayout>;
}
