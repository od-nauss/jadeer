import { ClipboardCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function CandidateAssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const [assessmentsRes, resultsRes] = await Promise.all([
    supabase.from('assessments').select('*').order('order_index'),
    supabase.from('assessment_results').select('*').eq('candidate_profile_id', profile?.id || ''),
  ]);

  const completedIds = new Set((resultsRes.data || []).map((r) => r.assessment_id));
  const resultsMap = new Map((resultsRes.data || []).map((r) => [r.assessment_id, r.score]));

  return (
    <div>
      <PageHeader
        title="الاختبارات الذكية"
        description="ثمانية اختبارات تكشف جوانب مختلفة من قدراتك القيادية. خذ وقتك في كل اختبار واجب بصدق - الإجابات الصحيحة هي الإجابات الواقعية."
        example="بعض الاختبارات سيناريوهات قصيرة تختار منها أنسب رد قيادي. لا توجد إجابات صحيحة تماماً، فقط إجابات تعكس نمطك القيادي."
        icon={<ClipboardCheck className="h-5 w-5" />}
      />

      {assessmentsRes.data && assessmentsRes.data.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {assessmentsRes.data.map((a) => {
            const completed = completedIds.has(a.id);
            const score = resultsMap.get(a.id);
            return (
              <Card key={a.id}>
                <div className="flex items-start gap-3">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      completed ? 'bg-sage/20 text-sage' : 'bg-gold-100 text-gold-700'
                    }`}
                  >
                    {completed ? <CheckCircle2 className="h-6 w-6" /> : <ClipboardCheck className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-primary-700">{a.name}</h3>
                      {completed && (
                        <Badge variant="sage">{Number(score).toFixed(0)}%</Badge>
                      )}
                    </div>
                    <p className="text-xs text-darkgray mb-3 leading-relaxed">{a.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-darkgray">
                        {a.duration_minutes} دقيقة · {a.questions_count} سؤال
                      </span>
                      <Link
                        href={`/candidate/assessments/${a.id}`}
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                          completed ? 'text-sage hover:text-sage/80' : 'text-primary-700 hover:text-primary-800'
                        }`}
                      >
                        {completed ? 'مراجعة النتيجة' : 'بدء الاختبار'}
                        <ArrowLeft className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="لا توجد اختبارات حالياً"
          description="ستظهر الاختبارات هنا بعد إعداد المنصة."
        />
      )}
    </div>
  );
}
