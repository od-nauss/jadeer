import Link from 'next/link';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function GovernanceEvaluatorsPage() {
  const supabase = createClient();

  // مرشحون لديهم مقيمون مقترحون لكن لم يكتمل اعتمادهم
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, users(full_name, job_title)')
    .eq('status', 'evaluators_pending');

  return (
    <div>
      <PageHeader
        title="اعتماد المقيمين"
        description="مراجعة قوائم المقيمين المقترحة من المرشحين. اعتمد 7-10 مقيمين، مع ضمان أن 60% على الأقل من اختيار اللجنة."
        example="اضغط على اسم المرشح لرؤية قائمته الكاملة (15 مقيماً) ثم اعتمد، استبعد، أو أضف من جهتك."
        icon={Users}
      />

      <div className="institutional-card p-5 bg-gold-50 border-r-4 border-gold-400 mb-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-darkgray leading-relaxed">
          <strong className="text-primary-700">قاعدة الحوكمة:</strong> الموظف يقترح 15 مقيماً، اللجنة
          تعتمد 7-10، و≥60% من هؤلاء يجب أن يكونوا من اختيار اللجنة (أي ليسوا فقط من قائمة المرشح).
          هذا الضامن الأساسي للعدالة.
        </div>
      </div>

      {profiles && profiles.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {profiles.map((p) => {
              type Row = { users: { full_name: string; job_title?: string } };
              const r = p as unknown as Row;
              return (
                <Link
                  key={p.id}
                  href={`/governance/evaluators/${p.id}`}
                  className="flex items-center justify-between p-4 bg-gold-50 hover:bg-gold-100 border border-gold-200 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gold-600" />
                    <div>
                      <div className="font-bold text-primary-700">{r.users?.full_name}</div>
                      <div className="text-xs text-darkgray">{r.users?.job_title}</div>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gold-600" />
                </Link>
              );
            })}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="لا توجد قوائم بانتظار الاعتماد"
          description="ستظهر القوائم هنا فور إرسال المرشحين لمقترحاتهم."
        />
      )}
    </div>
  );
}
