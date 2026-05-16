import Link from 'next/link';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

export default async function GovernanceEvaluatorsPage() {
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, users(full_name, job_title, department)')
    .eq('status', 'awaiting_evaluators');

  type PR = { id: string; users: { full_name: string; job_title?: string; department?: string } };
  const typed = (profiles || []) as unknown as PR[];

  const nomMap: Record<string, any[]> = {};
  if (typed.length > 0) {
    const { data: noms } = await supabase
      .from('evaluator_nominees')
      .select('id, candidate_profile_id, full_name, job_title, relationship_type, can_verify_initiatives, can_verify_kpis')
      .in('candidate_profile_id', typed.map(p => p.id))
      .order('created_at');
    (noms || []).forEach((n: any) => {
      if (!nomMap[n.candidate_profile_id]) nomMap[n.candidate_profile_id] = [];
      nomMap[n.candidate_profile_id].push(n);
    });
  }

  return (
    <div dir="rtl">
      <PageHeader title="اعتماد المقيمين"
        description="مراجعة قوائم المقيمين المقترحة. اعتمد 7-10 مقيمين مع ضمان 60%+ من اختيار اللجنة."
        icon={<Users className="h-5 w-5" />} />

      <div className="institutional-card p-5 bg-gold-50 border-r-4 border-gold-400 mb-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-darkgray leading-relaxed">
          <strong className="text-primary-700">قاعدة الحوكمة:</strong> الموظف يقترح 15 مقيماً، اللجنة تعتمد 7-10، و60%+ يجب أن يكونوا من اختيار اللجنة لضمان الحيادية.
        </div>
      </div>

      {typed.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="لا توجد قوائم بانتظار الاعتماد" description="ستظهر القوائم هنا فور إرسال المرشحين لمقترحاتهم." />
      ) : (
        <div className="space-y-6">
          {typed.map((p) => {
            const noms = nomMap[p.id] || [];
            return (
              <Card key={p.id}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gold-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold">{p.users?.full_name?.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-primary-700">{p.users?.full_name}</div>
                      <div className="text-xs text-darkgray">{p.users?.job_title} · {p.users?.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="gold">{noms.length} مقيّم مقترح</Badge>
                    <Link href={"/governance/evaluators/" + p.id}
                      className="inline-flex items-center gap-1.5 text-xs bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition font-bold">
                      اعتماد القائمة <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                {noms.length > 0 ? (
                  <div>
                    <div className="text-xs font-bold text-primary-700 mb-2">المقيمون المقترحون ({noms.length}/15):</div>
                    <div className="grid md:grid-cols-3 gap-2">
                      {noms.map((n: any, i: number) => (
                        <div key={n.id} className="flex items-start gap-2 p-2.5 bg-gold-50 border border-gold-200 rounded-xl">
                          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">{i+1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-primary-700 truncate">{n.full_name}</div>
                            <div className="text-xs text-darkgray">{REL_LABELS[n.relationship_type] || n.relationship_type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-darkgray">لم يُضف المرشح مقيمين بعد.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
