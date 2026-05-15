import { Activity, Database, Shield, Brain, Key, Users, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

async function checkTable(supabase: any, table: string): Promise<{ ok: boolean; count: number }> {
  try {
    const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    if (error) return { ok: false, count: 0 };
    return { ok: true, count: count || 0 };
  } catch {
    return { ok: false, count: 0 };
  }
}

function StatusIcon({ ok, warn }: { ok: boolean; warn?: boolean }) {
  if (!ok) return <XCircle className="h-5 w-5 text-wine flex-shrink-0" />;
  if (warn) return <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
  return <CheckCircle2 className="h-5 w-5 text-sage flex-shrink-0" />;
}

export default async function SystemHealthPage() {
  const supabase = createClient();
  const startTime = Date.now();

  const CORE_TABLES = [
    'users', 'user_roles', 'candidate_profiles', 'organization_units',
    'leadership_cards', 'position_fit_scores', 'development_plans',
    'governance_reviews', 'evaluations_360', 'notifications',
    'audit_logs', 'competitions', 'appeals',
  ];

  const TABLE_NAMES_AR: Record<string, string> = {
    users: 'المستخدمون',
    user_roles: 'أدوار المستخدمين',
    candidate_profiles: 'ملفات المرشحين',
    organization_units: 'الوحدات التنظيمية',
    leadership_cards: 'البطاقات القيادية',
    position_fit_scores: 'درجات الملاءمة',
    development_plans: 'خطط التطوير',
    governance_reviews: 'مراجعات الحوكمة',
    evaluations_360: 'تقييمات 360°',
    notifications: 'الإشعارات',
    audit_logs: 'سجل التدقيق',
    competitions: 'المسابقات الوظيفية',
    appeals: 'التظلمات',
  };

  const tableCounts: Record<string, { ok: boolean; count: number }> = {};
  await Promise.all(CORE_TABLES.map(async (t) => {
    tableCounts[t] = await checkTable(supabase, t);
  }));

  const dbOk = Object.values(tableCounts).every(t => t.ok);
  const responseMs = Date.now() - startTime;

  // فحص متغيرات البيئة
  const envChecks = [
    { key: 'رابط قاعدة البيانات (Supabase URL)', value: !!process.env.NEXT_PUBLIC_SUPABASE_URL, critical: true },
    { key: 'مفتاح العميل العام (Anon Key)', value: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, critical: true },
    { key: 'مفتاح الخدمة (Service Role Key)', value: !!process.env.SUPABASE_SERVICE_ROLE_KEY, critical: true },
    { key: 'مفتاح Anthropic AI', value: !!process.env.ANTHROPIC_API_KEY, critical: false },
    { key: 'مفتاح OpenAI', value: !!process.env.OPENAI_API_KEY, critical: false },
    { key: 'مفتاح البريد الإلكتروني (Resend)', value: !!process.env.RESEND_API_KEY, critical: false },
  ];
  const criticalEnvOk = envChecks.filter(e => e.critical).every(e => e.value);
  const aiConfigured = envChecks.find(e => e.key === 'ANTHROPIC_API_KEY')?.value ||
                       envChecks.find(e => e.key === 'OPENAI_API_KEY')?.value;

  // إحصاءات سريعة
  const { count: userCount } = await supabase.from('users').select('id', { count: 'exact', head: true });
  const { count: candidateCount } = await supabase.from('candidate_profiles').select('id', { count: 'exact', head: true });
  const { count: demoCount } = await supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('is_demo', true);
  const { count: cardCount } = await supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('is_published', true);
  const { count: auditCount } = await supabase.from('audit_logs').select('id', { count: 'exact', head: true });

  const { data: lastAudit } = await supabase.from('audit_logs').select('created_at, action').order('created_at', { ascending: false }).limit(1).single();
  const { data: demoFlag } = await supabase.from('demo_data_flags').select('*').maybeSingle();

  const overallOk = dbOk && criticalEnvOk;

  return (
    <div dir="rtl">
      <PageHeader
        title="صحة النظام"
        description="مراقبة شاملة لحالة المنصة: قاعدة البيانات، متغيرات البيئة، خدمات الذكاء الاصطناعي، والإحصاءات."
        icon={<Activity className="h-5 w-5" />}
      />

      {/* الحالة العامة */}
      <div className={`p-5 rounded-2xl border-2 mb-6 flex items-center gap-4 ${overallOk ? 'bg-sage/10 border-sage/30' : 'bg-rose-50 border-rose-300'}`}>
        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${overallOk ? 'bg-sage/20' : 'bg-rose-100'}`}>
          {overallOk ? <CheckCircle2 className="h-8 w-8 text-sage" /> : <XCircle className="h-8 w-8 text-wine" />}
        </div>
        <div>
          <div className={`text-xl font-bold ${overallOk ? 'text-sage' : 'text-wine'}`}>
            {overallOk ? 'المنصة تعمل بشكل سليم' : 'يوجد مشكلة تحتاج مراجعة'}
          </div>
          <div className="text-sm text-darkgray">زمن استجابة قاعدة البيانات: {responseMs}ms</div>
        </div>
        <div className="mr-auto text-xs text-darkgray">{new Date().toLocaleString('ar-SA')}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* قاعدة البيانات */}
        <Card title="قاعدة البيانات" subtitle={`Supabase — ${responseMs}ms`}>
          <div className="space-y-2">
            {CORE_TABLES.map(table => {
              const info = tableCounts[table];
              return (
                <div key={table} className="flex items-center gap-2 text-sm">
                  <StatusIcon ok={info.ok} />
                  <span className="flex-1 text-xs text-primary-700">{TABLE_NAMES_AR[table] || table}</span>
                  <span className={`text-xs font-bold ${info.ok ? 'text-sage' : 'text-wine'}`}>
                    {info.ok ? `${info.count} سجل` : 'خطأ'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* متغيرات البيئة */}
        <Card title="متغيرات البيئة">
          <div className="space-y-2">
            {envChecks.map(env => (
              <div key={env.key} className="flex items-center gap-2 text-sm">
                <StatusIcon ok={env.value} warn={!env.value && !env.critical} />
                <span className="flex-1 font-mono text-xs text-primary-700">{env.key}</span>
                <span className={`text-xs font-bold ${env.value ? 'text-sage' : env.critical ? 'text-wine' : 'text-amber-600'}`}>
                  {env.value ? '✓ موجود' : env.critical ? '✗ مطلوب' : '— اختياري'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* إحصاءات المنصة */}
        <Card title="إحصاءات المنصة">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'إجمالي المستخدمين', value: userCount || 0, icon: Users, color: 'text-primary-700' },
              { label: 'ملفات مرشحين', value: candidateCount || 0, icon: FileText, color: 'text-gold-700' },
              { label: 'بيانات تجريبية', value: demoCount || 0, icon: Database, color: 'text-amber-700' },
              { label: 'بطاقات معتمدة', value: cardCount || 0, icon: Shield, color: 'text-sage' },
              { label: 'سجلات تدقيق', value: auditCount || 0, icon: Activity, color: 'text-steelblue' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-3 bg-gold-50 border border-gold-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs text-darkgray">{label}</span>
                </div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* خدمات الذكاء الاصطناعي */}
        <Card title="خدمات الذكاء الاصطناعي">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusIcon ok={true} />
              <span className="text-sm text-primary-700">محركات التحليل (قواعد)</span>
              <span className="text-xs text-sage mr-auto">5 محركات نشطة</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon ok={!!aiConfigured} warn={!aiConfigured} />
              <span className="text-sm text-primary-700">مزود LLM خارجي</span>
              <span className={`text-xs mr-auto ${aiConfigured ? 'text-sage' : 'text-amber-600'}`}>
                {aiConfigured ? 'متصل' : 'غير مفعّل — اختياري'}
              </span>
            </div>
            <div className="p-3 bg-gold-50 border border-gold-100 rounded-xl text-xs text-darkgray leading-relaxed">
              <strong>المحركات النشطة:</strong> تحليل الملف، المبادرات، المؤشرات، التناسق، الملاءمة التنظيمية، تقييم 360، الحوكمة
              <br />
              <strong>لتفعيل LLM:</strong> أضف <code className="bg-white px-1 rounded">ANTHROPIC_API_KEY</code> أو <code className="bg-white px-1 rounded">OPENAI_API_KEY</code> في البيئة
            </div>
          </div>
        </Card>

        {/* حالة البيانات التجريبية */}
        <Card title="البيانات التجريبية" className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon ok={demoFlag?.is_demo_active || false} warn={!demoFlag?.is_demo_active} />
              <div>
                <div className="font-medium text-primary-700 text-sm">
                  {demoFlag?.is_demo_active ? 'البيانات التجريبية مفعّلة' : 'لا توجد بيانات تجريبية'}
                </div>
                {demoFlag?.last_seeded_at && (
                  <div className="text-xs text-darkgray">
                    آخر تهيئة: {new Date(demoFlag.last_seeded_at).toLocaleString('ar-SA')}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-darkgray">
              {demoCount || 0} مرشح تجريبي مسجل
            </div>
          </div>
          {lastAudit && (
            <div className="mt-3 p-2 bg-gold-50 border border-gold-100 rounded-xl text-xs text-darkgray">
              آخر نشاط في سجل التدقيق: <strong>{lastAudit.action}</strong> — {new Date(lastAudit.created_at).toLocaleString('ar-SA')}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
