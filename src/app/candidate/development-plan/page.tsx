import { Target, AlertCircle, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const ACTION_LABELS: Record<string, string> = {
  training_program: 'برنامج تدريبي',
  practical_assignment: 'تكليف عملي',
  leadership_mentoring: 'إرشاد قيادي',
  guided_reading: 'قراءة موجهة',
  applied_project: 'مشروع تطبيقي',
  job_rotation: 'دوران وظيفي',
  performance_note: 'ملاحظة أداء',
  reassessment: 'إعادة تقييم',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'sage' | 'primary' | 'gold' | 'wine'; icon: typeof CheckCircle2 }> = {
  completed: { label: 'مكتمل', variant: 'sage', icon: CheckCircle2 },
  in_progress: { label: 'قيد التنفيذ', variant: 'primary', icon: Clock },
  delayed: { label: 'متأخر', variant: 'wine', icon: AlertCircle },
  not_started: { label: 'لم يبدأ', variant: 'gold', icon: BookOpen },
};

export default async function CandidateDevelopmentPlanPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: plan } = await supabase
    .from('development_plans')
    .select('id, overall_status, readiness_level, ai_recommendations_json, start_date, target_end_date')
    .eq('candidate_profile_id', profile?.id || '')
    .maybeSingle();

  const { data: items } = plan ? await supabase
    .from('development_plan_items')
    .select('id, skill_gap, reason, action_type, action_description, responsible_party, success_indicator, target_date, status, notes')
    .eq('development_plan_id', plan.id)
    .order('status', { ascending: true }) : { data: [] };

  const aiRec = (plan?.ai_recommendations_json as any);

  const completedCount = (items || []).filter(i => i.status === 'completed').length;
  const inProgressCount = (items || []).filter(i => i.status === 'in_progress').length;
  const progress = items?.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div dir="rtl">
      <PageHeader
        title="خطة التطوير الفردية"
        description="خطة مولّدة بناءً على فجواتك القيادية، مراجَعة من الموارد البشرية ومعتمَدة من لجنة الحوكمة. تابع تنفيذ كل بند بانتظام."
        example="إذا كانت فجوتك 'إدارة الأزمات'، ستجد برنامج تطوير مخصص مع جدول زمني وشروط نجاح واضحة."
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
          {/* ملخص الخطة */}
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-primary-700">{items?.length || 0}</div>
              <div className="text-xs text-darkgray">إجمالي البنود</div>
            </div>
            <div className="p-4 bg-sage/10 border border-sage/30 rounded-xl text-center">
              <div className="text-2xl font-bold text-sage">{completedCount}</div>
              <div className="text-xs text-darkgray">مكتملة</div>
            </div>
            <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-gold-700">{inProgressCount}</div>
              <div className="text-xs text-darkgray">قيد التنفيذ</div>
            </div>
          </div>

          {/* شريط التقدم */}
          {items && items.length > 0 && (
            <Card className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-primary-700">التقدم الكلي</span>
                <span className="text-sm font-bold text-primary-700">{progress}%</span>
              </div>
              <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-sage to-primary-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }} />
              </div>
            </Card>
          )}

          {/* التوصية الذكية */}
          {aiRec?.summary && (
            <Card title="توصية الذكاء الاصطناعي" className="mb-5 bg-primary-50 border-primary-200">
              <p className="text-darkgray leading-loose text-sm">{aiRec.summary}</p>
            </Card>
          )}

          {/* بنود الخطة */}
          {items && items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, i) => {
                const statusCfg = STATUS_CONFIG[item.status || 'not_started'] || STATUS_CONFIG.not_started;
                const Icon = statusCfg.icon;
                const isOverdue = item.target_date && new Date(item.target_date) < new Date() && item.status !== 'completed';
                return (
                  <Card key={item.id || i}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          item.status === 'completed' ? 'text-sage' :
                          item.status === 'in_progress' ? 'text-primary-600' :
                          item.status === 'delayed' ? 'text-wine' : 'text-gold-600'
                        }`} />
                        <div className="min-w-0">
                          <h3 className="font-bold text-primary-700">{item.skill_gap}</h3>
                          {item.action_type && (
                            <span className="text-xs text-gold-700 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded mt-1 inline-block">
                              {ACTION_LABELS[item.action_type] || item.action_type}
                            </span>
                          )}
                          {item.action_description && (
                            <p className="text-sm text-darkgray mt-1.5 leading-relaxed">{item.action_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end flex-shrink-0">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                        {isOverdue && <Badge variant="wine">متأخر</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-darkgray pt-2 border-t border-gold-100">
                      {item.responsible_party && (
                        <span><strong>المسؤول:</strong> {item.responsible_party}</span>
                      )}
                      {item.target_date && (
                        <span><strong>الهدف:</strong> {item.target_date}</span>
                      )}
                      {item.success_indicator && (
                        <span><strong>مؤشر النجاح:</strong> {item.success_indicator}</span>
                      )}
                    </div>
                    {item.notes && (
                      <div className="mt-2 p-2 bg-gold-50 rounded-lg text-xs text-darkgray">{item.notes}</div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Target className="h-8 w-8" />}
              title="الخطة لا تحتوي على بنود بعد"
              description="ستضاف بنود التطوير من فريق الموارد البشرية قريباً."
            />
          )}
        </>
      )}
    </div>
  );
}
