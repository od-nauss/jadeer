import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';
export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout expectedRole="candidate">{children}</DashboardLayout>;
}
