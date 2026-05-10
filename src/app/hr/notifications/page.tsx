import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function HRNotificationsPage() {
  const supabase = createClient();
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .or('target_role.eq.hr,target_role.is.null')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="الإشعارات"
        description="جميع التنبيهات الموجهة للموارد البشرية."
        icon={<Bell className="h-5 w-5" />}
      />

      {notifications && notifications.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="p-3 bg-gold-50 border border-gold-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-primary-700 text-sm">{n.title}</div>
                    {n.body && <div className="text-xs text-darkgray mt-0.5">{n.body}</div>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={n.priority === 'high' ? 'wine' : 'gold'}>
                        {n.priority === 'high' ? 'عالية' : 'متوسطة'}
                      </Badge>
                      <span className="text-xs text-darkgray">{new Date(n.created_at).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Bell className="h-5 w-5" />} title="لا إشعارات" description="ستظهر الإشعارات هنا تلقائياً." />
      )}
    </div>
  );
}
