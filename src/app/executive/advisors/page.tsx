import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function ExecutiveAdvisorsPage() {
  const supabase = createClient();
  const { data: advisors } = await supabase
    .from('users')
    .select('*, user_roles!inner(roles!inner(code))')
    .eq('user_roles.roles.code', 'advisor')
    .eq('is_active', true);

  return (
    <div>
      <PageHeader
        title="المستشارون"
        description="قائمة المستشارين الذين منحتهم صلاحية الاطلاع على البطاقات القيادية. كل صلاحية موثقة في سجل التدقيق."
        example="المستشار يرى البطاقات والتقارير لكنه لا يستطيع تعديل أي قرار."
        icon={<Users className="h-5 w-5" />}
      />

      {advisors && advisors.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {advisors.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold">
                  {a.full_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-primary-700">{a.full_name}</div>
                  <div className="text-xs text-darkgray">{a.job_title}</div>
                </div>
                <Badge variant="sage">مفعّل</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Users className="h-8 w-8" />} title="لا يوجد مستشارون مضافون" description="تواصل مع مدير النظام لإضافة مستشار." />
      )}
    </div>
  );
}
