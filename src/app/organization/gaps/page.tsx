import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export default async function OrganizationGapsPage() {
  const supabase = createClient();

  // الوحدات الحرجة
  const { data: critical } = await supabase
    .from('organization_units')
    .select('*')
    .eq('is_critical', true);

  // الوحدات بشواغر
  const { data: vacancies } = await supabase
    .from('organization_units')
    .select('*')
    .eq('has_vacancy', true);

  return (
    <div>
      <PageHeader
        title="الفجوات القيادية"
        description="رصد الوحدات التي تحتاج اهتماماً قيادياً عاجلاً: شواغر، عدم وجود بدائل، إدارات حرجة."
        example="إذا ظهرت إدارة حرجة دون مرشحين بنسبة ملاءمة 70%+، فهذا تنبيه استراتيجي عاجل."
        icon={AlertTriangle}
      />

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="وحدات تنظيمية حرجة" subtitle="حساسية مرتفعة، تحتاج قيادة قوية">
          {critical && critical.length > 0 ? (
            <div className="space-y-2">
              {critical.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-wine flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-primary-700">{u.name}</div>
                    <div className="text-xs text-darkgray">{u.unit_type}</div>
                  </div>
                  <Badge variant="wine">حرجة</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-darkgray text-sm">لا توجد وحدات معلّمة كحرجة.</div>
          )}
        </Card>

        <Card title="شواغر مفتوحة" subtitle="مناصب شاغرة تحتاج تكليفاً">
          {vacancies && vacancies.length > 0 ? (
            <div className="space-y-2">
              {vacancies.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-primary-700">{u.name}</div>
                    <div className="text-xs text-darkgray">{u.unit_type}</div>
                  </div>
                  <Badge variant="gold">شاغر</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-darkgray text-sm">لا توجد شواغر حالياً.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
