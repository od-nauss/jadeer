import Link from 'next/link';
import { Target, ArrowLeft, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const HR_STATUS: Record<string, { label: string; variant: 'gold' | 'primary' | 'sage' | 'wine' | 'gray' }> = {
  proposed: { label: 'مقترحة آلياً', variant: 'gold' },
  hr_review: { label: 'قيد مراجعة الموارد', variant: 'primary' },
  awaiting_governance: { label: 'بانتظار الحوكمة', variant: 'primary' },
  approved: { label: 'معتمدة', variant: 'sage' },
  in_progress: { label: 'قيد التنفيذ', variant: 'sage' },
  completed: { label: 'مكتملة', variant: 'sage' },
  delayed: { label: 'متأخرة', variant: 'wine' },
  closed: { label: 'مغلقة', variant: 'gray' },
};

export default async function HRDevelopmentPlansPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: plans } = await supabase
    .from('development_plans')
    .select('*, candidate_profiles(id, users(full_name, job_title, department))')
    .order('created_at', { ascending: false });

  // بطاقات الجاهزية
  const profileIds = (plans || []).map((p: any) => p.candidate_profile_id);
  const { data: cards } = profileIds.length > 0
    ? await supabase.from('leadership_cards').select('candidate_profile_id, total_score, readiness_level').in('candidate_profile_id', profileIds)
    : { data: [] };
  const cardMap: Record<string, any> = {};
  (cards || []).forEach((c: any) => { cardMap[c.candidate_profile_id] = c; });

  const delayedCount = plans?.filter(p => p.overall_status === 'delayed').length || 0;
  const inProgressCount = plans?.filter(p => p.overall_status === 'in_progress').length || 0;

  return (
    <div dir="rtl">
      <PageHeader
        title="خطط التطوير الفردية"
        description="متابعة خطط التطوير المنبثقة من نتائج الجاهزية القيادية. الخطة مقترحة من النظام والموارد البشرية تراجعها وتحولها لتنفيذية."
        example="مرشح تصنيفه 'جاهز خلال سنة' يحصل على خطة تطوير مركزة 6 أشهر مع إرشاد قيادي وتكليف تطبيقي."
        icon={<Target className="h-5 w-5" />}
      />

      {(delayedCount > 0 || inProgressCount > 0) && (
        <div className="mb-5 flex gap-3">
          {delayedCount > 0 && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine flex items-center gap-2">⚠ {delayedCount} خطة متأخرة تحتاج متابعة</div>}
          {inProgressCount > 0 && <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-steelblue flex items-center gap-2">📋 {inProgressCount} خطة قيد التنفيذ</div>}
        </div>
      )}

      {(!plans || plans.length === 0) ? (
        <EmptyState icon={<Target className="h-10 w-10" />} title="لا توجد خطط تطوير" description="ستظهر خطط التطوير تلقائياً بعد اعتماد لجنة الحوكمة للتصنيفات." />
      ) : (
        <div className="space-y-3">
          {plans.map((plan: any) => {
            const cu = plan.candidate_profiles?.users;
            const level = READINESS_LEVELS[plan.readiness_level as keyof typeof READINESS_LEVELS];
            const si = HR_STATUS[plan.overall_status] || HR_STATUS.proposed;
            const card = cardMap[plan.candidate_profile_id];
            return (
              <Card key={plan.id} className="hover:border-gold-400 transition">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-primary-700">{cu?.full_name}</div>
                        <div className="text-xs text-darkgray">{cu?.job_title} · {cu?.department}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant={si.variant}>{si.label}</Badge>
                          {level && <span className={`text-xs px-2 py-0.5 rounded ${level.bg} ${level.color}`}>{level.label_ar}</span>}
                          {card && <span className="text-sm font-bold text-gold-700">{Number(card.total_score).toFixed(0)}٪</span>}
                        </div>
                      </div>
                      <Link href={`/hr/development-plans/${plan.candidate_profile_id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 flex-shrink-0">
                        إدارة الخطة <ArrowLeft className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-darkgray">
                      {plan.start_date && <div>البداية: {new Date(plan.start_date).toLocaleDateString('ar-SA')}</div>}
                      {plan.target_end_date && <div>الهدف: {new Date(plan.target_end_date).toLocaleDateString('ar-SA')}</div>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
