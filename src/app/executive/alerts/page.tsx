import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { Bell, AlertTriangle, CheckCircle2, ArrowLeft, Brain } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ALERT_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  ready_now: { label: 'مرشح جاهز الآن', icon: <CheckCircle2 className="h-4 w-4" /> },
  hidden_leadership: { label: 'قيادة مخفية محتملة', icon: <Bell className="h-4 w-4" /> },
  high_performance_low_satisfaction: { label: 'أداء عالٍ / رضا منخفض', icon: <AlertTriangle className="h-4 w-4" /> },
  low_trust: { label: 'درجة عالية / ثقة منخفضة', icon: <AlertTriangle className="h-4 w-4" /> },
  no_successor: { label: 'وحدة بدون بديل جاهز', icon: <AlertTriangle className="h-4 w-4" /> },
  extreme_evaluation: { label: 'تقييم 360 متطرف', icon: <AlertTriangle className="h-4 w-4" /> },
  delayed_development: { label: 'خطة تطوير متأخرة', icon: <Bell className="h-4 w-4" /> },
  human_leader: { label: 'قائد إنساني محتمل', icon: <Bell className="h-4 w-4" /> },
  competition_result: { label: 'نتيجة مسابقة مهمة', icon: <Bell className="h-4 w-4" /> },
};

const SEVERITY_INFO: Record<string, { color: string; variant: 'wine' | 'gold' | 'sage' }> = {
  high:   { color: 'border-wine bg-rose-50',    variant: 'wine' },
  medium: { color: 'border-gold-500 bg-gold-50', variant: 'gold' },
  low:    { color: 'border-sage bg-green-50',    variant: 'sage' },
};

export default async function ExecutiveAlertsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();

  // جلب التنبيهات من الجدول الصحيح
  const { data: alerts } = await supabase
    .from('executive_alerts')
    .select('*, candidate_profiles(users(full_name, job_title)), organization_units(name)')
    .in('status', ['new', 'acknowledged'])
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  // توليد تنبيهات ذكية تلقائية من البيانات
  const aiAlerts: Array<{ type: string; severity: 'high' | 'medium' | 'low'; title: string; message: string; recommended_action: string; candidate?: string }> = [];

  // التحقق من الحالات التي تستحق تنبيه
  const [{ count: readyNow }, { count: hiddenCount }, { count: lowSat }, { data: unitsNoSuccessor }] = await Promise.all([
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'ready_now').eq('is_published', true),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('leadership_type', 'hidden').eq('is_published', true),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'high_performance_low_satisfaction').eq('is_published', true),
    supabase.from('organization_units').select('name').eq('needs_successor', true).limit(3),
  ]);

  if ((readyNow || 0) > 0) aiAlerts.push({ type: 'ready_now', severity: 'high', title: 'مرشحون جاهزون للتكليف', message: `يوجد ${readyNow} مرشح مصنف "جاهز الآن" باعتماد لجنة الحوكمة.`, recommended_action: 'راجع قائمة المرشحين لاتخاذ قرار التكليف المناسب.' });
  if ((hiddenCount || 0) > 0) aiAlerts.push({ type: 'hidden_leadership', severity: 'medium', title: 'قيادات مخفية', message: `رُصد ${hiddenCount} حالة قيادة مخفية محتملة بين الموظفين.`, recommended_action: 'راجع بطاقاتهم للنظر في فرص التطوير والتكليف.' });
  if ((lowSat || 0) > 0) aiAlerts.push({ type: 'high_performance_low_satisfaction', severity: 'medium', title: 'أداء عالٍ مع رضا منخفض', message: `${lowSat} مرشح يحقق نتائج قوية لكن رضا فريقه منخفض.`, recommended_action: 'يُنصح بمراجعة نمط قيادتهم قبل أي تكليف مباشر.' });
  if (unitsNoSuccessor && unitsNoSuccessor.length > 0) aiAlerts.push({ type: 'no_successor', severity: 'high', title: 'وحدات بدون بدائل جاهزة', message: `وحدات تشغيلية بدون بديل قيادي: ${unitsNoSuccessor.map(u => u.name).join('، ')}.`, recommended_action: 'راجع خريطة الملاءمة وخطط التعاقب.' });

  const hasAnyAlert = (alerts && alerts.length > 0) || aiAlerts.length > 0;

  return (
    <div dir="rtl">
      <PageHeader
        title="التنبيهات القيادية"
        description="تنبيهات ذكية موجهة للقيادة العليا بناءً على بيانات الجاهزية القيادية."
        icon={<Bell className="h-5 w-5" />}
      />

      {!hasAnyAlert ? (
        <EmptyState icon={<Bell className="h-10 w-10" />} title="لا توجد تنبيهات حالياً" description="ستظهر التنبيهات تلقائياً بناءً على بيانات الجاهزية." />
      ) : (
        <div className="space-y-4">
          {/* التنبيهات الذكية المولَّدة */}
          {aiAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-primary-700 mb-3">
                <Brain className="h-4 w-4 text-gold-600" />
                تنبيهات الذكاء الاصطناعي
              </div>
              <div className="space-y-2">
                {aiAlerts.map((alert, i) => {
                  const si = SEVERITY_INFO[alert.severity];
                  const ti = ALERT_TYPE_LABELS[alert.type];
                  return (
                    <div key={i} className={`p-4 rounded-xl border-r-4 ${si.color}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`flex-shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-wine' : alert.severity === 'medium' ? 'text-gold-700' : 'text-sage'}`}>
                            {ti?.icon}
                          </div>
                          <div>
                            <div className="font-bold text-primary-700">{alert.title}</div>
                            <div className="text-sm text-darkgray mt-0.5">{alert.message}</div>
                            <div className="text-xs text-primary-600 mt-1 font-medium">الإجراء: {alert.recommended_action}</div>
                          </div>
                        </div>
                        <Badge variant={si.variant}>
                          {alert.severity === 'high' ? 'عالية' : alert.severity === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* التنبيهات المحفوظة */}
          {alerts && alerts.length > 0 && (
            <div>
              <div className="text-sm font-bold text-primary-700 mb-3">تنبيهات موجهة</div>
              <div className="space-y-2">
                {alerts.map((a: any) => {
                  const si = SEVERITY_INFO[a.severity || 'medium'];
                  const ti = ALERT_TYPE_LABELS[a.alert_type];
                  return (
                    <div key={a.id} className={`p-4 rounded-xl border-r-4 ${si.color}`}>
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-0.5 ${a.severity === 'high' ? 'text-wine' : 'text-gold-700'}`}>
                          {ti?.icon || <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-primary-700">{a.title}</div>
                          {a.candidate_profiles?.users && (
                            <div className="text-xs text-gold-700 font-medium">{a.candidate_profiles.users.full_name}</div>
                          )}
                          {a.organization_units && (
                            <div className="text-xs text-darkgray">{a.organization_units.name}</div>
                          )}
                          {a.message && <div className="text-sm text-darkgray mt-1">{a.message}</div>}
                          {a.recommended_action && <div className="text-xs text-primary-600 mt-1 font-medium">الإجراء: {a.recommended_action}</div>}
                          <div className="text-xs text-darkgray mt-1">{new Date(a.created_at).toLocaleDateString('ar-SA')}</div>
                        </div>
                        <Badge variant={si.variant}>
                          {a.severity === 'high' ? 'عالية' : a.severity === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* رابط للبطاقات */}
          <div className="pt-2">
            <Link href="/executive/candidates" className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline">
              عرض قائمة المرشحين الكاملة <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
