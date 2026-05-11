import Link from 'next/link';
import { Award, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export default async function AdvisorCardsPage() {
  const supabase = createClient();
  const { data: cards } = await supabase
    .from('leadership_cards')
    .select('*, candidate_profiles(users(full_name, job_title))')
    .eq('is_published', true)
    .order('total_score', { ascending: false });

  return (
    <div>
      <PageHeader
        title="البطاقات القيادية"
        description="عرض كافة البطاقات القيادية المعتمدة. لا يمكنك التعديل، فقط المراجعة والملاحظات."
        icon={Award}
      />

      {cards && cards.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الجاهزية</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الثقة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">التصنيف</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => {
                  type Row = { candidate_profiles: { users: { full_name: string; job_title?: string } } };
                  const r = card as unknown as Row;
                  const user = r.candidate_profiles?.users;
                  if (!user) return null;
                  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
                  return (
                    <tr key={card.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3 font-medium text-primary-800">{user.full_name}</td>
                      <td className="py-3 px-3 font-bold text-gold-700">{Number(card.total_score).toFixed(0)}%</td>
                      <td className="py-3 px-3 text-darkgray">{Number(card.trust_score).toFixed(0)}%</td>
                      <td className="py-3 px-3">
                        {level && (
                          <span className={`text-xs px-2 py-1 rounded ${level.bg} ${level.color}`}>
                            {level.label_ar}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Link href={`/advisor/cards/${card.id}`} className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-800 text-sm font-medium">
                          عرض <ArrowLeft className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState icon={Award} title="لا توجد بطاقات معتمدة" description="ستظهر البطاقات هنا بعد الاعتماد." />
      )}
    </div>
  );
}
