import { Trophy, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function HRCompetitionsPage() {
  const supabase = createClient();
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*, organization_units(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المسابقات الوظيفية"
        description="إنشاء وإدارة المسابقات الوظيفية. كل مسابقة تربط بشاغر محدد ومعايير ملاءمة معينة."
        example="مسابقة 'مدير وحدة دعم الفرق' للمرشحين بتصنيف 'قائد إنساني' وجاهزية 70%+."
        icon={<Trophy className="h-5 w-5" />}
      />

      <div className="mb-4">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold">
          <Plus className="h-4 w-4" />
          إنشاء مسابقة جديدة
        </button>
      </div>

      {competitions && competitions.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {competitions.map((c) => {
            type Row = { organization_units?: { name?: string } };
            const r = c as unknown as Row;
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-primary-700">{c.title}</h3>
                  <Badge variant={c.status === 'open' ? 'sage' : 'gray'}>
                    {c.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </Badge>
                </div>
                {r.organization_units?.name && (
                  <p className="text-sm text-darkgray mb-2">{r.organization_units.name}</p>
                )}
                {c.description && <p className="text-xs text-darkgray leading-relaxed">{c.description}</p>}
                {c.deadline && (
                  <div className="mt-3 pt-3 border-t border-gold-100 text-xs text-darkgray">
                    الموعد النهائي: {new Date(c.deadline).toLocaleDateString('ar-SA')}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Trophy className="h-8 w-8" />} title="لا توجد مسابقات" description="ابدأ بإنشاء أول مسابقة وظيفية." />
      )}
    </div>
  );
}
