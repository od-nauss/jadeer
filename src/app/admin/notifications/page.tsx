import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export default async function AdminNotificationsPage() {
  const supabase = createClient();
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="الإشعارات الذكية"
        description="جميع الإشعارات المرسلة في المنصة. هذه الإشعارات موجهة حسب الدور وتساعد القيادة على عدم تفويت أي حدث مهم."
        icon={Bell}
      />

      {notifications && notifications.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg"
              >
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  n.priority === 'high' ? 'bg-wine' :
                  n.priority === 'medium' ? 'bg-gold-500' : 'bg-sage'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-primary-700 text-sm">{n.title}</div>
                  {n.body && <div className="text-xs text-darkgray mt-0.5">{n.body}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    {n.target_role && <Badge variant="primary">{n.target_role}</Badge>}
                    <span className="text-xs text-darkgray">
                      {new Date(n.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon={Bell} title="لا توجد إشعارات بعد" description="ستظهر الإشعارات الذكية هنا تلقائياً." />
      )}
    </div>
  );
}
