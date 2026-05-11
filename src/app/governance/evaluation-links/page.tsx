import { Link2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function GovernanceLinksPage() {
  const supabase = createClient();
  const { data: links } = await supabase
    .from('evaluation_links')
    .select('*, approved_evaluators(evaluator_name, candidate_profile_id)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader
        title="روابط تقييم 360"
        description="جميع روابط التقييم المُصدَرة. كل رابط فردي ويستخدم مرة واحدة فقط، ومرتبط بمقيم واحد ومرشح واحد."
        icon={<Link2 className="h-5 w-5" />}
      />

      {links && links.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المقيم</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الرابط</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الإصدار</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الانتهاء</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l) => {
                  type Row = { approved_evaluators?: { evaluator_name?: string } };
                  const r = l as unknown as Row;
                  return (
                    <tr key={l.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3 font-medium text-primary-800">
                        {r.approved_evaluators?.evaluator_name || '—'}
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray font-mono" dir="ltr">
                        {l.token?.substring(0, 12)}...
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={l.status === 'used' ? 'sage' : l.status === 'expired' ? 'gray' : 'gold'}>
                          {l.status === 'active' ? 'نشط' : l.status === 'used' ? 'مستخدم' : l.status === 'expired' ? 'منتهي' : l.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray">
                        {new Date(l.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray">
                        {l.expires_at ? new Date(l.expires_at).toLocaleDateString('ar-SA') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Link2 className="h-8 w-8" />} title="لا توجد روابط مُصدَرة" description="سيتم إصدار الروابط فور اعتماد قوائم المقيمين." />
      )}
    </div>
  );
}
