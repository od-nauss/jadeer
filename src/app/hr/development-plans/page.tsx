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

  const STATUS_LABEL: Record<string, { label: string; variant: 'sage' | 'primary' | 'wine' | 'gold' | 'gray' }> = {
    proposed: { label: 'مقترحة', variant: 'gold' },
    hr_review: { label: 'قيد المراجعة', variant: 'gold' },
    awaiting_governance: { label: 'بانتظار الحوكمة', variant: 'primary' },
    approved: { label: 'معتمدة', variant: 'sage' },
    in_progress: { label: 'جارية', variant: 'sage' },
    completed: { label: 'مكتملة', variant: 'primary' },
    delayed: { label: 'متأخرة', variant: 'wine' },
    closed: { label: 'مغلقة', variant: 'gray' },
  };

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
            const statusInfo = STATUS_LABEL[p.overall_status as string] || { label: p.overall_status || '—', variant: 'gold' as const };
            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-primary-700">{r.candidate_profiles?.users?.full_name}</h3>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-darkgray">{r.candidate_profiles?.users?.job_title}</p>
                    {p.readiness_level && (
                      <p className="text-xs text-darkgray mt-1">مستوى الجاهزية: {p.readiness_level}</p>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="text-xs text-darkgray mb-1">الإنشاء</div>
                    <div className="text-sm font-medium text-primary-700">
                      {new Date(p.created_at).toLocaleDateString('ar-SA')}
                    </div>
                    {p.target_end_date && (
                      <>
                        <div className="text-xs text-darkgray mt-1">الهدف</div>
                        <div className="text-sm text-darkgray">
                          {new Date(p.target_end_date).toLocaleDateString('ar-SA')}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Target className="h-8 w-8" />} title="لا توجد خطط تطوير" description="ستظهر الخطط بعد اعتماد البطاقات القيادية." />
      )}
    </div>
  );
}
