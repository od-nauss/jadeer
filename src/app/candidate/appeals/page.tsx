import { AlertTriangle, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
const APPEAL_TYPES: Record<string, string> = {
  evaluator_bias: 'تحيز مقيم',
  classification_disagreement: 'عدم موافقة على التصنيف',
  fit_disagreement: 'عدم موافقة على الملاءمة',
  development_plan_disagreement: 'عدم موافقة على خطة التطوير',
  process_complaint: 'شكوى إجرائية',
  data_correction: 'طلب تصحيح بيانات',
  reevaluation: 'طلب إعادة تقييم',
  other: 'أخرى',
};

export default async function CandidateAppealsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: appeals } = await supabase
    .from('appeals')
    .select('*')
    .eq('candidate_profile_id', profile?.id || '')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="تظلماتي"
        description="حقّك في التظلم على أي قرار جزء من ضمانات العدالة في منصة جدير. كل تظلم يُحلَّل بالذكاء الاصطناعي ثم تنظر فيه لجنة الحوكمة."
        example="ثمانية أنواع من التظلمات: تحيز مقيم، عدم موافقة على التصنيف، طلب تصحيح بيانات، طلب إعادة تقييم، وغيرها."
        icon={AlertTriangle}
      />

      <div className="mb-4">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold">
          <Plus className="h-4 w-4" />
          تقديم تظلم جديد
        </button>
      </div>

      {appeals && appeals.length > 0 ? (
        <div className="space-y-3">
          {appeals.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-primary-700">{APPEAL_TYPES[a.appeal_type] || a.appeal_type}</h3>
                    <Badge variant={a.status === 'open' ? 'gold' : a.status === 'resolved' ? 'sage' : 'wine'}>
                      {a.status === 'open' ? 'مفتوح' : a.status === 'resolved' ? 'مُعالَج' : a.status}
                    </Badge>
                  </div>
                  {a.description && <p className="text-sm text-darkgray leading-relaxed">{a.description}</p>}
                  {a.resolution && (
                    <div className="mt-3 pt-3 border-t border-gold-100 bg-gold-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                      <div className="text-xs font-bold text-gold-700 mb-1">قرار اللجنة:</div>
                      <p className="text-sm text-darkgray">{a.resolution}</p>
                    </div>
                  )}
                  <div className="text-xs text-darkgray mt-2">
                    {new Date(a.created_at).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={AlertTriangle} title="لا توجد تظلمات" description="ستظهر تظلماتك هنا فور تقديمها." />
      )}
    </div>
  );
}
