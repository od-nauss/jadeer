import { Users, Plus, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function Candidate360Page() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: nominees } = await supabase
    .from('evaluator_nominees')
    .select('*')
    .eq('candidate_profile_id', profile?.id || '')
    .order('created_at', { ascending: false });

  const total = nominees?.length || 0;
  const remaining = Math.max(0, 15 - total);

  return (
    <div>
      <PageHeader
        title="دائرة الثقة القيادية (تقييم 360)"
        description="اقترح 15 مقيماً يعرفون عملك من زوايا مختلفة (مدير، زملاء، مرؤوسون، أصحاب علاقة). لجنة الحوكمة ستعتمد 7-10 منهم، و60% على الأقل من اختيار اللجنة."
        example="نوّع: 1 مدير مباشر + 3 زملاء + 3 مرؤوسين + 2 أصحاب علاقة + 1 من خارج إدارتك. التنوع يرفع جودة التقييم."
        icon={Users}
      />

      <Card className="mb-6 bg-gold-50 border-r-4 border-gold-400">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-darkgray leading-relaxed">
            <strong className="text-primary-700">قاعدة الحوكمة:</strong> أنت تقترح 15 اسماً، اللجنة
            تعتمد منهم 7-10. اللجنة تستطيع إضافة مقيمين من جهتها لضمان أن 60% على الأقل من المقيمين
            النهائيين من اختيارها (لمنع تحيز المجاملة). هذا الضمان لمصلحة عدالة تقييمك.
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-primary-700">
            {total} <span className="text-darkgray text-lg">/ 15</span>
          </div>
          <div className="text-xs text-darkgray">
            {remaining > 0 ? `يتبقى ${remaining} اسم` : 'اكتمل العدد، يمكنك الإرسال للجنة'}
          </div>
        </div>
        {remaining > 0 && (
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold">
            <Plus className="h-4 w-4" />
            إضافة مقيم
          </button>
        )}
      </div>

      {nominees && nominees.length > 0 ? (
        <div className="space-y-2">
          {nominees.map((n) => (
            <Card key={n.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-primary-700">{n.evaluator_name}</div>
                  <div className="text-xs text-darkgray">
                    {n.relationship} {n.evaluator_email && `· ${n.evaluator_email}`}
                  </div>
                </div>
                <Badge
                  variant={
                    n.status === 'approved' ? 'sage' :
                    n.status === 'rejected' ? 'wine' : 'gold'
                  }
                >
                  {n.status === 'pending' ? 'بانتظار اللجنة' :
                   n.status === 'approved' ? 'معتمد' :
                   n.status === 'rejected' ? 'مرفوض' : n.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="لم تقترح مقيمين بعد" description="ابدأ بإضافة 15 اسماً." />
      )}
    </div>
  );
}
