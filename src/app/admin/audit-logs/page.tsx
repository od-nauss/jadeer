import { ScrollText, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export default async function AdminAuditLogsPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="سجل التدقيق"
        description="سجل جميع العمليات الحساسة في المنصة. هذا السجل لا يقبل الحذف من الواجهة، وهو الضامن الأساسي للحوكمة والمساءلة."
        example="تستطيع تصفية السجل حسب الدور، نوع العملية، أو الفترة الزمنية."
        icon={ScrollText}
      />

      <Card>
        {logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">العملية</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">المنفّذ</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الدور</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحساسية</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const userName = (log.users as { full_name?: string } | null)?.full_name;
                  return (
                    <tr key={log.id} className="border-b border-gold-100 hover:bg-gold-50/50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-primary-700">{log.description || log.operation_type}</div>
                        {log.affected_entity && (
                          <div className="text-xs text-darkgray">{log.affected_entity}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-darkgray">{userName || 'النظام'}</td>
                      <td className="py-3 px-3">
                        {log.user_role && <Badge variant="primary">{log.user_role}</Badge>}
                      </td>
                      <td className="py-3 px-3">
                        {log.sensitivity === 'critical' ? (
                          <Badge variant="wine">حرجة</Badge>
                        ) : log.sensitivity === 'sensitive' ? (
                          <Badge variant="gold">حساسة</Badge>
                        ) : (
                          <Badge variant="gray">عادية</Badge>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {log.status === 'success' ? (
                          <Badge variant="sage">ناجحة</Badge>
                        ) : (
                          <Badge variant="wine">{log.status}</Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-darkgray whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('ar-SA', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="لا توجد عمليات مسجلة"
            description="ستظهر هنا أول عملية حساسة فور تنفيذها."
          />
        )}
      </Card>

      <div className="mt-6 institutional-card p-5 bg-gold-50 border-r-4 border-gold-400">
        <p className="text-sm text-darkgray leading-relaxed">
          <strong className="text-primary-700">قاعدة الحوكمة:</strong> سجل التدقيق لا يُحذف من
          الواجهة. للحذف القانوني للسجلات القديمة (بعد 7 سنوات مثلاً)، يجب التواصل مع مدير قاعدة
          البيانات وفق سياسة الاحتفاظ بالبيانات في المنظمة.
        </p>
      </div>
    </div>
  );
}
