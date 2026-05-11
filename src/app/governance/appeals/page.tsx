import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { AlertCircle } from 'lucide-react';
import { GovernanceAppealDecisionPanel } from './AppealPanel';

export const dynamic = 'force-dynamic';

const APPEAL_TYPE_LABELS: Record<string, string> = {
  classification_objection: 'اعتراض على التصنيف',
  reassessment_request: 'طلب إعادة تقييم',
  data_correction: 'تصحيح بيانات',
  evidence_addition: 'إضافة شواهد',
  evaluation_completion: 'اعتراض على التقييم',
  other: 'أخرى',
};

const STATUS_INFO: Record<string, { label: string; variant: 'gold' | 'primary' | 'sage' | 'wine' | 'gray' }> = {
  new:    { label: 'جديد', variant: 'gold' },
  open:   { label: 'قيد المراجعة', variant: 'primary' },
  accepted: { label: 'مقبول', variant: 'sage' },
  rejected: { label: 'مرفوض', variant: 'wine' },
  closed: { label: 'مغلق', variant: 'gray' },
};

export default async function GovernanceAppealsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: appeals } = await supabase
    .from('appeals')
    .select('*, candidate_profiles(users(full_name, job_title))')
    .order('created_at', { ascending: false });

  const newCount = appeals?.filter(a => a.status === 'new').length || 0;

  return (
    <div dir="rtl">
      <PageHeader
        title="التظلمات"
        description="مراجعة التظلمات المقدمة من المرشحين. كل قرار يجب توثيقه بالسبب."
        example="اقرأ نص التظلم، راجع ملف المرشح إذا لزم، ثم اتخذ القرار المناسب."
        icon={<AlertCircle className="h-5 w-5" />}
      />

      {newCount > 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium">{newCount} تظلم جديد يحتاج مراجعة.</span>
        </div>
      )}

      {(!appeals || appeals.length === 0) ? (
        <EmptyState icon={<AlertCircle className="h-10 w-10" />} title="لا توجد تظلمات" description="ستظهر التظلمات هنا فور تقديمها." />
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const a = appeal as any;
            const candidate = a.candidate_profiles?.users;
            const si = STATUS_INFO[a.status] || STATUS_INFO.new;
            return (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={si.variant}>{si.label}</Badge>
                      <span className="font-bold text-primary-700">{candidate?.full_name}</span>
                    </div>
                    <div className="text-xs text-darkgray">
                      {candidate?.job_title} · {APPEAL_TYPE_LABELS[a.appeal_type] || a.appeal_type}
                    </div>
                    <div className="text-xs text-darkgray mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gold-50 rounded-xl text-sm text-primary-800 leading-relaxed mb-3">
                  {a.appeal_text}
                </div>

                {a.decision && (
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-sm mb-3">
                    <div className="font-semibold text-primary-700 mb-1">قرار اللجنة: {a.decision}</div>
                    {a.decision_reason && <div className="text-darkgray">{a.decision_reason}</div>}
                  </div>
                )}

                {['new', 'in_review'].includes(a.status) && (
                  <div className="border-t border-gold-200 pt-3 mt-2">
                    <GovernanceAppealDecisionPanel appealId={a.id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
