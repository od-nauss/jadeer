import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function ExecutiveAlertsPage() {
  const supabase = createClient();
  const { data: alerts } = await supabase
    .from('notifications')
    .select('*')
    .or('target_role.eq.president,target_role.is.null')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="الإشعارات الذكية"
        description="جميع التنبيهات الموجهة للقيادة العليا. الأولوية حسب الأهمية."
        icon={<Bell className="h-5 w-5" />}
      />

      {alerts && alerts.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-lg border-r-4 ${
                  a.priority === 'high' ? 'border-wine bg-rose-50' :
                  a.priority === 'medium' ? 'border-gold-500 bg-gold-50' :
                  'border-sage bg-sage/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Bell className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    a.priority === 'high' ? 'text-wine' :
                    a.priority === 'medium' ? 'text-gold-700' :
                    'text-sage'
                  }`} />
                  <div className="flex-1">
                    <div className="font-bold text-primary-700">{a.title}</div>
                    {a.body && <div className="text-sm text-darkgray mt-1">{a.body}</div>}
                    <div className="mt-2 text-xs text-darkgray">
                      {new Date(a.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                  <Badge variant={a.priority === 'high' ? 'wine' : a.priority === 'medium' ? 'gold' : 'sage'}>
                    {a.priority === 'high' ? 'عالية' : a.priority === 'medium' ? 'متوسطة' : 'عادية'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Bell className="h-5 w-5" />} title="لا توجد إشعارات حالياً" description="ستظهر التنبيهات الذكية هنا تلقائياً." />
      )}
    </div>
  );
}
