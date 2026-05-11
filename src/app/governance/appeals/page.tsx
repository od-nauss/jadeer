import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
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

export default async function GovernanceAppealsPage() {
  const supabase = createClient();
  const { data: appeals } = await supabase
    .from('appeals')
    .select('*, candidate_profiles(users(full_name))')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="التظلمات"
        description="جميع التظلمات المُقدَّمة من المرشحين. كل تظلم يخضع لتحليل ذكي ثم قرار اللجنة. القرار يُسجَّل في سجل التدقيق."
        example="أنواع التظلم: تحيز مقيم، عدم موافقة على التصنيف، طلب تصحيح بيانات، طلب إعادة تقييم، وغيرها."
        icon={AlertTriangle}
      />

      {appeals && appeals.length > 0 ? (
        <div className="space-y-3">
          {appeals.map((a) => {
            type Row = { candidate_profiles: { users: { full_name: string } } };
            const r = a as unknown as Row;
            return (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-primary-700">{r.candidate_profiles?.users?.full_name}</h3>
                      <Badge variant="gold">{APPEAL_TYPES[a.appeal_type] || a.appeal_type}</Badge>
                    </div>
                    {a.description && <p className="text-sm text-darkgray">{a.description}</p>}
                    <div className="text-xs text-darkgray mt-2">
                      تاريخ التقديم: {new Date(a.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                  <Badge variant={a.status === 'open' ? 'gold' : a.status === 'resolved' ? 'sage' : 'wine'}>
                    {a.status === 'open' ? 'مفتوح' : a.status === 'resolved' ? 'محلول' : a.status}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={AlertTriangle} title="لا توجد تظلمات حالياً" description="ستظهر التظلمات هنا فور تقديمها." />
      )}
    </div>
  );
}
