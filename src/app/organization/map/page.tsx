import Link from 'next/link';
import { Map, ArrowLeft, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function OrganizationMapPage() {
  const supabase = createClient();

  const { data: units } = await supabase
    .from('organization_units')
    .select('id, name, unit_type, employee_count, has_vacancy, is_critical')
    .order('unit_type')
    .order('name');

  // جمع المرشحين الجاهزين
  const { data: cards } = await supabase
    .from('leadership_cards')
    .select('id, total_score, candidate_profiles(users(full_name, department))')
    .eq('is_published', true)
    .gte('total_score', 75);

  return (
    <div>
      <PageHeader
        title="خريطة الكفاءات في المنظمة"
        description="رؤية بانورامية للوحدات التنظيمية والكفاءات المتاحة. تستطيع رؤية الوحدات بدون بدائل قيادية بسرعة."
        example="إذا ظهرت وحدة بشارة 'بدون بدائل'، فهذا تنبيه مؤسسي لبدء تطوير صف ثاني فيها."
        icon={Map}
      />

      {units && units.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {units.map((u) => {
            type CardData = { candidate_profiles: { users: { full_name: string; department?: string } } };
            const matchingCards = (cards || []).filter((c) => {
              const cd = c as unknown as CardData;
              return cd.candidate_profiles?.users?.department === u.name;
            });
            return (
              <Link
                key={u.id}
                href={`/organization/units/${u.id}`}
                className="institutional-card p-5 hover:border-gold-400 transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-700">{u.name}</h3>
                    <Badge variant="primary" className="mt-1">{u.unit_type}</Badge>
                  </div>
                  {u.has_vacancy && <Badge variant="gold">شاغر</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-gold-50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-primary-700">{u.employee_count || 0}</div>
                    <div className="text-[10px] text-darkgray">موظفين</div>
                  </div>
                  <div className="bg-sage/10 rounded p-2 text-center">
                    <div className="text-lg font-bold text-sage">{matchingCards.length}</div>
                    <div className="text-[10px] text-darkgray">كفاءات</div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <ArrowLeft className="h-4 w-4 text-gold-600 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Map} title="لا توجد وحدات" description="شغّل seed لإنشاء الهيكل التجريبي." />
      )}
    </div>
  );
}
