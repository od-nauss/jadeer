import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { AppealForm } from '@/components/candidate/AppealForm';

export const dynamic = 'force-dynamic';

const APPEAL_TYPE_LABELS: Record<string, string> = {
  classification_objection: 'اعتراض على التصنيف',
  reassessment_request: 'طلب إعادة تقييم',
  data_correction: 'تصحيح بيانات',
  evidence_addition: 'إضافة شواهد',
  evaluation_completion: 'اعتراض على اكتمال التقييم',
  other: 'أخرى',
};

const STATUS_INFO: Record<string, { label: string; variant: 'gold' | 'primary' | 'sage' | 'wine' | 'gray' }> = {
  new:          { label: 'جديد', variant: 'gold' },
  under_review: { label: 'قيد المراجعة', variant: 'primary' },
  needs_info:   { label: 'يحتاج معلومات', variant: 'gold' },
  accepted:     { label: 'مقبول', variant: 'sage' },
  rejected:     { label: 'مرفوض', variant: 'wine' },
  closed:       { label: 'مغلق', variant: 'gray' },
};

export default async function CandidateAppealsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase.from('candidate_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
  const { data: appeals } = await supabase.from('appeals').select('*').eq('candidate_profile_id', profile?.id || '').order('created_at', { ascending: false });

  return (
    <div dir="rtl">
      <PageHeader
        title="التظلمات"
        description="إذا رأيت خطأً في بياناتك أو نتيجتك، يمكنك تقديم طلب مراجعة. لجنة الحوكمة ستراجعه وفق ضوابط المنصة."
        example="مثال: بيانات خاطئة في الملف، نتيجة لا تعكس ملفك الفعلي، أو مؤشرات لم تُأخذ بعين الاعتبار."
        icon={<AlertCircle className="h-5 w-5" />}
      />

      {/* نموذج التظلم */}
      {profile ? (
        <div className="mb-8"><AppealForm /></div>
      ) : (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          أكمل ملفك القيادي أولاً لتتمكن من تقديم تظلم.
        </div>
      )}

      {/* قائمة التظلمات */}
      <h3 className="text-lg font-bold text-primary-700 mb-4">تظلماتي السابقة</h3>
      {!appeals || appeals.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="h-8 w-8" />}
          title="لا توجد تظلمات"
          description="لم تقدم أي تظلم حتى الآن."
        />
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => {
            const si = STATUS_INFO[appeal.status] || STATUS_INFO.new;
            return (
              <Card key={appeal.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={si.variant}>{si.label}</Badge>
                      <span className="text-sm font-medium text-primary-700">
                        {APPEAL_TYPE_LABELS[appeal.appeal_type] || appeal.appeal_type}
                      </span>
                    </div>
                    <p className="text-sm text-darkgray leading-relaxed">{appeal.appeal_text}</p>
                    <div className="text-xs text-darkgray mt-2">
                      {new Date(appeal.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
                {(appeal.committee_decision || appeal.committee_notes) && (
                  <div className="mt-3 pt-3 border-t border-gold-100">
                    <div className="text-xs font-semibold text-primary-600 mb-1">قرار اللجنة</div>
                    <p className="text-sm text-darkgray">{appeal.committee_decision || appeal.committee_notes}</p>
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
