import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';
export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="hr">{children}</DashboardLayout>;
}
