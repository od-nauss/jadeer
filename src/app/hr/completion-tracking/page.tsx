import { Activity, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function HRCompletionTrackingPage() {
  const supabase = createClient();

  // مرشحون لم يكتمل ملفهم وتأخروا
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('*, users(full_name, job_title, email, last_login_at)')
    .lt('completion_score', 80)
    .order('updated_at', { ascending: true });

  return (
    <div>
      <PageHeader
        title="متابعة استكمال الملفات"
        description="المرشحون الذين بدأوا ولم يكتملوا. تستطيع تذكيرهم برسالة أو إشعار. مرتبة من الأقدم تحديثاً."
        example="إذا لم يدخل مرشح منذ أكثر من 14 يوماً وملفه أقل من 80% أكتمل، أرسل تذكيراً."
        icon={Activity}
      />

      {profiles && profiles.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {profiles.map((p) => {
              type Row = { users: { full_name: string; job_title?: string; email: string; last_login_at?: string } };
              const r = p as unknown as Row;
              const lastLogin = r.users?.last_login_at ? new Date(r.users.last_login_at) : null;
              const daysAgo = lastLogin
                ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-4 bg-gold-50 border border-gold-100 rounded-lg"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {r.users?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary-700">{r.users?.full_name}</div>
                    <div className="text-xs text-darkgray">{r.users?.job_title}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gold-700">{p.completion_score || 0}%</div>
                      <div className="text-xs text-darkgray">اكتمال</div>
                    </div>
                    {daysAgo !== null && daysAgo > 14 && (
                      <Badge variant="wine">متأخر {daysAgo} يوم</Badge>
                    )}
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-xs">
                      <Mail className="h-3 w-3" />
                      تذكير
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Activity className="h-8 w-8" />} title="جميع المرشحين أكملوا ملفاتهم" description="عمل ممتاز، لا حاجة لتذكير أحد." />
      )}
    </div>
  );
}
