import { PageHeader } from '@/components/ui';
import { LayoutDashboard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="لوحة النظام"
        description="مرحباً بك في لوحة إدارة منصة جدير."
        icon={LayoutDashboard}
      />
      <p className="text-darkgray p-4">النظام يعمل بشكل صحيح.</p>
    </div>
  );
}
