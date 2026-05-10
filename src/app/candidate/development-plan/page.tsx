import { Target, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function CandidateDevelopmentPlanPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data: plan } = await supabase
    .from('development_plans')
    .select('*')
    .eq('candidate_profile_id', profile?.id || '')
    .maybeSingle();

  const items = (plan?.items as Array<{
    skill: string;
    program: string;
    duration: string;
    priority: string;
    status: string;
  }> | null) || [];

  return (
    <div>
      <PageHeader
        title="خطة التطوير الفردية"
        description="خطة مولّدة من المنصة بناءً على فجواتك في البطاقة القيادية، تراجعها الموارد البشرية وتعتمدها اللجنة. تابع تنفيذها بانتظام."
        example="إذا كانت فجوتك 'إدارة الأزمات'، ستجد هنا برنامج 'القيادة في الأزمات' مع مدة 8 أسابيع وأولوية عالية."
        icon={<Target className="h-5 w-5" />}
      />

      {!plan ? (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gold-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-700 mb-2">لا توجد خطة تطوير بعد</h3>
            <p className="text-darkgray text-sm leading-relaxed max-w-md mx-auto">
              ستظهر خطتك التطويرية هنا بعد اعتماد بطاقتك القيادية من لجنة الحوكمة.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {plan.summary && (
            <Card title="ملخص الخطة" className="mb-5">
              <p className="text-darkgray leading-loose">{plan.summary}</p>
            </Card>
          )}

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-primary-700">{item.skill}</h3>
                      <p className="text-sm text-darkgray mt-0.5">{item.program}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge
                        variant={
                          item.priority === 'high' ? 'wine' :
                          item.priority === 'medium' ? 'gold' : 'sage'
                        }
                      >
                        {item.priority === 'high' ? 'أولوية عالية' :
                         item.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية عادية'}
                      </Badge>
                      <Badge variant={item.status === 'completed' ? 'sage' : 'primary'}>
                        {item.status === 'completed' ? 'مكتمل' :
                         item.status === 'in_progress' ? 'قيد التنفيذ' : 'لم يبدأ'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-darkgray pt-2 border-t border-gold-100">
                    المدة المقترحة: {item.duration}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="الخطة لا تحتوي على بنود بعد"
              description="ستضاف بنود التطوير من فريق الموارد البشرية."
            />
          )}
        </>
      )}
    </div>
  );
}
