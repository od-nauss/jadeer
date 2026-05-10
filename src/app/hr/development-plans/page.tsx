import { Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function HRDevelopmentPlansPage() {
  const supabase = createClient();
  const { data: plans } = await supabase
    .from('development_plans')
    .select('*, candidate_profiles(users(full_name, job_title))')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="خطط التطوير الفردية"
        description="خطط التطوير المُولَّدة بالذكاء الاصطناعي والمراجعة من الموارد. كل خطة مرتبطة ببطاقة قيادية."
        example="الخطة تتضمن: المهارة المستهدفة، البرنامج المقترح، المدة، المتابعة الدورية."
        icon={<Target className="h-5 w-5" />}
      />

      {plans && plans.length > 0 ? (
        <div className="space-y-3">
          {plans.map((p) => {
            type Row = { candidate_profiles: { users: { full_name: string; job_title?: string } } };
            const r = p as unknown as Row;
            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-primary-700">{r.candidate_profiles?.users?.full_name}</h3>
                      <Badge
                        variant={
                          p.status === 'active' ? 'sage' :
                          p.status === 'completed' ? 'primary' :
                          p.status === 'overdue' ? 'wine' : 'gold'
                        }
                      >
                        {p.status === 'active' ? 'نشطة' :
                         p.status === 'completed' ? 'مكتملة' :
                         p.status === 'overdue' ? 'متأخرة' : p.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-darkgray">{r.candidate_profiles?.users?.job_title}</p>
                    {p.summary && <p className="text-sm text-darkgray mt-2 leading-relaxed">{p.summary}</p>}
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="text-xs text-darkgray mb-1">الإطلاق</div>
                    <div className="text-sm font-medium text-primary-700">
                      {new Date(p.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Target className="h-5 w-5" />} title="لا توجد خطط تطوير" description="ستظهر الخطط بعد اعتماد البطاقات القيادية." />
      )}
    </div>
  );
}
