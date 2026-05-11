import Link from 'next/link';
import { ClipboardCheck, ArrowLeft, CheckCircle2, Play, Clock, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const ASSESSMENT_COLORS = [
  'from-primary-600 to-primary-800',
  'from-gold-600 to-gold-800',
  'from-sage to-green-700',
  'from-steelblue to-blue-800',
  'from-wine to-rose-800',
  'from-primary-500 to-steelblue',
  'from-gold-500 to-primary-700',
  'from-sage to-primary-700',
];

export default async function CandidateAssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const [assessmentsRes, resultsRes] = await Promise.all([
    supabase.from('assessments').select('id, title, description, estimated_duration_minutes, question_count').eq('is_active', true).order('created_at'),
    profile ? supabase.from('assessment_results').select('assessment_id, status, score, thinking_pattern').eq('candidate_profile_id', profile.id) : { data: [] },
  ]);

  const assessments = assessmentsRes.data || [];
  const results = resultsRes.data || [];
  const resultsMap = new Map(results.map(r => [r.assessment_id, r]));

  const completedCount = results.filter(r => r.status === 'completed').length;
  const inProgressCount = results.filter(r => r.status === 'in_progress').length;

  return (
    <div dir="rtl">
      <PageHeader
        title="الاختبارات الذكية"
        description="ثمانية اختبارات تكشف قدراتك القيادية من خلال مواقف عملية وأسئلة تحليلية. لا توجد إجابة مثالية — النظام يقيس طريقة تفكيرك واتخاذ قرارك."
        example="بعض الاختبارات سيناريوهات قصيرة، وبعضها ترتيب أولويات أو تحليل حالة. كن صادقاً في إجاباتك."
        icon={<ClipboardCheck className="h-5 w-5" />}
      />

      {/* إحصاء */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="institutional-card p-4 text-center">
          <div className="text-3xl font-bold text-sage">{completedCount}</div>
          <div className="text-xs text-darkgray mt-1">مكتمل من {assessments.length}</div>
        </div>
        <div className="institutional-card p-4 text-center">
          <div className="text-3xl font-bold text-gold-700">{inProgressCount}</div>
          <div className="text-xs text-darkgray mt-1">قيد التنفيذ</div>
        </div>
        <div className="institutional-card p-4 text-center">
          <div className="text-3xl font-bold text-primary-700">{assessments.length - completedCount - inProgressCount}</div>
          <div className="text-xs text-darkgray mt-1">لم يبدأ</div>
        </div>
      </div>

      {/* شريط تقدم */}
      <div className="mb-6">
        <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-sage to-primary-600 rounded-full transition-all" style={{ width: `${(completedCount / Math.max(assessments.length, 1)) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-darkgray mt-1">
          <span>اكتمل {completedCount} اختبار</span>
          {completedCount < 4 && <span className="text-wine">الحد الأدنى 4 اختبارات للإرسال</span>}
          {completedCount >= 4 && <span className="text-sage">✓ تجاوزت الحد الأدنى</span>}
        </div>
      </div>

      {!profile && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-sm text-amber-800">
          <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>أكمل ملفك القيادي أولاً لفتح الاختبارات.</span>
        </div>
      )}

      {assessments.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-10 w-10" />}
          title="لا توجد اختبارات حالياً"
          description="سيتم إضافة الاختبارات قريباً. تواصل مع مدير النظام."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {assessments.map((a, idx) => {
            const result = resultsMap.get(a.id);
            const isDone = result?.status === 'completed';
            const isInProgress = result?.status === 'in_progress';
            const gradientClass = ASSESSMENT_COLORS[idx % ASSESSMENT_COLORS.length];

            return (
              <div key={a.id} className={`institutional-card overflow-hidden ${!profile ? 'opacity-60' : ''}`}>
                {/* Color stripe */}
                <div className={`h-1.5 -mx-5 -mt-5 mb-4 bg-gradient-to-r ${gradientClass}`} />

                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradientClass} text-white`}>
                    {isDone ? <CheckCircle2 className="h-6 w-6" /> : <ClipboardCheck className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-primary-700">{a.title}</h3>
                      {isDone && <Badge variant="sage">مكتمل</Badge>}
                      {isInProgress && <Badge variant="gold">جارٍ</Badge>}
                    </div>
                    <p className="text-xs text-darkgray mt-1 leading-relaxed line-clamp-2">{a.description}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-darkgray">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.estimated_duration_minutes} دقيقة</span>
                      <span>{a.question_count} سؤال</span>
                      {isDone && result?.score && (
                        <span className="font-bold text-gold-700">{Number(result.score).toFixed(0)}%</span>
                      )}
                    </div>

                    {isDone && result?.thinking_pattern && (
                      <div className="mt-2 text-xs bg-gold-50 border border-gold-200 rounded-lg px-2.5 py-1.5 text-gold-800">
                        نمط: {result.thinking_pattern}
                      </div>
                    )}

                    <div className="mt-3">
                      {profile ? (
                        <Link href={`/candidate/assessments/${a.id}`}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            isDone ? 'bg-gold-50 text-gold-700 border border-gold-300 hover:bg-gold-100' :
                            isInProgress ? 'bg-primary-100 text-primary-700 border border-primary-300 hover:bg-primary-200' :
                            'btn-primary'
                          }`}>
                          {isDone ? (<><ArrowLeft className="h-3.5 w-3.5" />مراجعة النتيجة</>) :
                           isInProgress ? (<><Play className="h-3.5 w-3.5" />متابعة الاختبار</>) :
                           (<><Play className="h-3.5 w-3.5" />بدء الاختبار</>)}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-100 text-gold-600 rounded-lg text-sm">
                          <Lock className="h-3.5 w-3.5" />مقفل
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
