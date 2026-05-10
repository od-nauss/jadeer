import { Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';
import { DemoDataActions } from './demo-actions';

export default async function AdminDemoDataPage() {
  const supabase = createClient();

  // جمع أعداد البيانات التجريبية
  const tables = ['users', 'candidate_profiles', 'initiatives', 'kpis', 'evaluations_360', 'leadership_cards'];
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('is_demo', true);
    counts[table] = count || 0;
  }

  const { data: flagRow } = await supabase.from('demo_data_flags').select('*').single();

  const totalDemoRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader
        title="إدارة البيانات التجريبية"
        description="عرض ومتابعة البيانات التجريبية في المنصة. تستطيع حذف كامل البيانات التجريبية بنقرة واحدة بعد تأكيد مزدوج."
        example="عند الانتقال للإنتاج، احذف البيانات التجريبية لتبدأ بنظام نظيف."
        icon={Database}
      />

      <Card title="ملخص البيانات التجريبية" subtitle="جميع السجلات المعلّمة كبيانات تجريبية">
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {Object.entries(counts).map(([table, count]) => (
            <div key={table} className="bg-gold-50 border border-gold-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-primary-700 font-medium">{table}</span>
              <span className="text-lg font-bold text-gold-700">{count}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-l from-gold-50 to-white rounded-lg border border-gold-200">
          <div>
            <div className="text-sm text-darkgray">إجمالي السجلات التجريبية</div>
            <div className="text-2xl font-bold text-primary-700">{totalDemoRecords}</div>
          </div>
          <div>
            {flagRow?.is_demo_active ? (
              <Badge variant="gold">البيانات التجريبية مفعّلة</Badge>
            ) : (
              <Badge variant="sage">تم حذف البيانات التجريبية</Badge>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <DemoDataActions
          totalRecords={totalDemoRecords}
          isActive={flagRow?.is_demo_active || false}
        />
      </div>
    </div>
  );
}
