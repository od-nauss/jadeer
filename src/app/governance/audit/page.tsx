import { ScrollText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function GovernanceAuditPage() {
  const supabase = createClient();
  const { data: decisions } = await supabase
    .from('governance_decisions')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader
        title="سجل قرارات اللجنة"
        description="جميع القرارات الحوكمية الصادرة. هذا السجل لا يقبل الحذف من الواجهة، وهو الضامن المؤسسي للمساءلة."
        icon={<ScrollText className="h-5 w-5" />}
      />

      {decisions && decisions.length > 0 ? (
        <Card>
          <div className="space-y-3">
            {decisions.map((d) => {
              type Row = { users: { full_name?: string } };
              const r = d as unknown as Row;
              return (
                <div
                  key={d.id}
                  className="p-4 bg-gold-50 border border-gold-100 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-primary-700">{d.decision_type}</div>
                      <div className="text-xs text-darkgray mt-0.5">
                        بواسطة {r.users?.full_name || 'النظام'} ·{' '}
                        {new Date(d.created_at).toLocaleString('ar-SA')}
                      </div>
                    </div>
                    <Badge variant="primary">{d.outcome}</Badge>
                  </div>
                  {d.reason && (
                    <div className="mt-2 pt-2 border-t border-gold-200">
                      <div className="text-xs text-gold-700 font-bold mb-1">سبب القرار:</div>
                      <p className="text-sm text-darkgray">{d.reason}</p>
                    </div>
                  )}
                  {d.notes && (
                    <div className="mt-2 pt-2 border-t border-gold-200">
                      <div className="text-xs text-gold-700 font-bold mb-1">ملاحظة حوكمية:</div>
                      <p className="text-sm text-darkgray">{d.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <EmptyState icon={<ScrollText className="h-5 w-5" />} title="لا توجد قرارات مسجلة بعد" description="ستظهر هنا أول قرار حوكمي." />
      )}
    </div>
  );
}
