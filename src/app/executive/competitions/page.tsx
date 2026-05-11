import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function ExecutiveCompetitionsPage() {
  const supabase = createClient();
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*, organization_units(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المسابقات الوظيفية"
        description="جميع المسابقات الوظيفية في المنظمة وحالتها. اختر مرشحاً من نتائج المسابقة لرؤية بطاقته القيادية."
        icon={Trophy}
      />

      {competitions && competitions.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {competitions.map((c) => {
            const unit = (c.organization_units as { name?: string } | null)?.name;
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-primary-700">{c.title}</h3>
                  <Badge variant={c.status === 'open' ? 'sage' : 'gray'}>
                    {c.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </Badge>
                </div>
                {unit && <p className="text-sm text-darkgray mb-2">{unit}</p>}
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
        <EmptyState icon={Trophy} title="لا توجد مسابقات حالياً" description="ستظهر المسابقات هنا عند إنشائها." />
      )}
    </div>
  );
}
