import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function CandidateNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="الإشعارات"
        description="جميع الإشعارات الخاصة بك. تذكيرات إكمال الملف، حالة المراجعة، اعتماد البطاقة، وأي مستجدات."
        icon={Bell}
      />

      {notifications && notifications.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-lg border-r-4 ${
                  n.priority === 'high' ? 'border-wine bg-rose-50' :
                  n.priority === 'medium' ? 'border-gold-500 bg-gold-50' :
                  'border-sage bg-sage/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Bell className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    n.priority === 'high' ? 'text-wine' :
                    n.priority === 'medium' ? 'text-gold-700' : 'text-sage'
                  }`} />
                  <div className="flex-1">
                    <div className="font-bold text-primary-700">{n.title}</div>
                    {n.body && <div className="text-sm text-darkgray mt-1">{n.body}</div>}
                    <div className="mt-2 text-xs text-darkgray">
                      {new Date(n.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                  {!n.is_read && <Badge variant="gold">جديد</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon={Bell} title="لا توجد إشعارات" description="ستظهر إشعاراتك هنا تلقائياً." />
      )}
    </div>
  );
}
