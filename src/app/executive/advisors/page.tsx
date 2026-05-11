import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { Users } from 'lucide-react';
import { AdvisorAccessManager } from './AdvisorAccessManager';

export const dynamic = 'force-dynamic';

export default async function ExecutiveAdvisorsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();

  // جميع المستشارين
  const { data: advisorUsers } = await supabase
    .from('users')
    .select('id, full_name, job_title, email, is_active')
    .eq('is_active', true)
    .filter('id', 'in', `(SELECT user_id FROM user_roles WHERE role_id = (SELECT id FROM roles WHERE code = 'advisor'))`);

  // صلاحيات كل مستشار
  const { data: accesses } = await supabase
    .from('advisor_access')
    .select('*, users!advisor_access_advisor_user_id_fkey(full_name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div dir="rtl">
      <PageHeader
        title="إدارة المستشارين"
        description="منح وإدارة صلاحيات الاطلاع للمستشارين. كل صلاحية موثقة في سجل التدقيق ولا تسمح بأي تعديل."
        example="المستشار يرى البطاقات والتقارير فقط لما تصرح به — لا يرى تفاصيل تقييم 360 أو سجل الحوكمة."
        icon={<Users className="h-5 w-5" />}
      />

      <AdvisorAccessManager
        advisorUsers={(advisorUsers || []) as Array<{ id: string; full_name: string; job_title?: string; email: string }>}
        accesses={(accesses || []) as any[]}
      />
    </div>
  );
}
