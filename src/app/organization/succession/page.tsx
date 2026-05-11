import { Users, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function OrganizationSuccessionPage() {
  const supabase = createClient();
  const { data: succession } = await supabase
    .from('succession_maps')
    .select('*, organization_units(name, unit_type)')
    .order('priority_level', { ascending: true });

  return (
    <div>
      <PageHeader
        title="خريطة التعاقب الوظيفي"
        description="استدامة القيادة تتطلب وضوح الصف الثاني والثالث لكل منصب حساس. هذه الخريطة تجيب على سؤال: ماذا لو غادر القائد؟"
        example="لكل وحدة حرجة: من البديل المباشر؟ من الصف الثاني (سنة)؟ من الصف الثالث (3 سنوات)؟"
        icon={<Users className="h-5 w-5" />}
      />

      {succession && succession.length > 0 ? (
        <div className="space-y-3">
          {succession.map((s) => {
            type Row = { organization_units: { name?: string; unit_type?: string } };
            const r = s as unknown as Row;
            const successors = (s.successors as Array<{ name: string; readiness: string; level: number }> | null) || [];
            return (
              <Card key={s.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-primary-700">{r.organization_units?.name}</h3>
                    <p className="text-xs text-darkgray">{r.organization_units?.unit_type}</p>
                  </div>
                  <Badge variant={s.priority_level === 1 ? 'wine' : s.priority_level === 2 ? 'gold' : 'sage'}>
                    {s.priority_level === 1 ? 'أولوية حرجة' : s.priority_level === 2 ? 'أولوية عالية' : 'أولوية عادية'}
                  </Badge>
                </div>

                {successors.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-2">
                    {[1, 2, 3].map((level) => {
                      const matching = successors.filter((s) => s.level === level);
                      return (
                        <div key={level} className="bg-gold-50 border border-gold-100 rounded-lg p-3">
                          <div className="text-xs text-gold-700 font-bold mb-2">
                            الصف {level === 1 ? 'الأول (مباشر)' : level === 2 ? 'الثاني (سنة)' : 'الثالث (3 سنوات)'}
                          </div>
                          {matching.length > 0 ? (
                            matching.map((m, i) => (
                              <div key={i} className="text-sm text-primary-700 font-medium">{m.name}</div>
                            ))
                          ) : (
                            <div className="text-xs text-darkgray italic">— لا يوجد —</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-darkgray italic">لم يحدد ورثة للمنصب بعد.</p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Users className="h-8 w-8" />} title="لا توجد خريطة تعاقب" description="ستُبنى الخريطة بعد اعتماد البطاقات." />
      )}
    </div>
  );
}
