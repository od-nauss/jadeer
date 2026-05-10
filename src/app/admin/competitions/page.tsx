import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export default async function AdminCompetitionsPage() {
  const supabase = createClient();
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*, organization_units(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المسابقات الوظيفية"
        description="عرض جميع المسابقات الوظيفية في المنظمة وحالتها. المسابقة قناة منظمة لاكتشاف الكفاءات لشاغر محدد."
        example="مسابقة لشاغر 'مدير إدارة العمليات' تُفتح للموظفين ذوي الجاهزية 75%+ في تصنيف 'قائد تشغيلي'."
        icon={Trophy}
      />

      {competitions && competitions.length > 0 ? (
        <div className="space-y-3">
          {competitions.map((c) => {
            const unit = (c.organization_units as { name?: string } | null)?.name;
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-primary-700">{c.title}</h3>
                      <Badge variant={c.status === 'open' ? 'sage' : c.status === 'closed' ? 'gray' : 'gold'}>
                        {c.status === 'open' ? 'مفتوحة' : c.status === 'closed' ? 'مغلقة' : c.status}
                      </Badge>
                    </div>
                    {unit && <p className="text-sm text-darkgray">{unit}</p>}
                    {c.description && <p className="text-sm text-darkgray mt-2">{c.description}</p>}
                  </div>
                  <div className="text-left flex-shrink-0 text-xs text-darkgray">
                    {c.deadline && <div>الموعد النهائي: {new Date(c.deadline).toLocaleDateString('ar-SA')}</div>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          title="لا توجد مسابقات حالياً"
          description="ستظهر هنا المسابقات الوظيفية عند إنشائها."
        />
      )}
    </div>
  );
}
