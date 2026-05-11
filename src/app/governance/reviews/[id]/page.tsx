import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Award,
  Activity,
  Users,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function GovernanceReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*, users(full_name, job_title, department, employee_number, email)')
    .eq('id', params.id)
    .single();

  if (!profile) notFound();

  const [initiatives, kpis, assessments, nominees] = await Promise.all([
    supabase.from('initiatives').select('*').eq('candidate_profile_id', params.id),
    supabase.from('kpis').select('*').eq('candidate_profile_id', params.id),
    supabase.from('assessment_results').select('*, assessments(title)').eq('candidate_profile_id', params.id),
    supabase.from('evaluator_nominees').select('*').eq('candidate_profile_id', params.id),
  ]);

  type UserType = { full_name: string; job_title?: string; department?: string; employee_number?: string; email?: string };
  const user = (profile as { users?: UserType }).users;

  return (
    <div>
      <Link
        href="/governance/reviews"
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4"
      >
        <ArrowRight className="h-4 w-4" />
        العودة لقائمة الملفات
      </Link>

      {/* رأس الملف */}
      <div className="institutional-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {user?.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-700">{user?.full_name}</h1>
            <p className="text-darkgray">{user?.job_title}</p>
            <p className="text-sm text-darkgray">{user?.department}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="gold">{profile.status}</Badge>
              <Badge variant="primary">اكتمال {profile.completion_score || 0}%</Badge>
              {user?.employee_number && (
                <span className="text-xs text-darkgray bg-gold-50 px-2 py-0.5 rounded">
                  رقم: {user.employee_number}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* المبادرات */}
        <Card title="المبادرات" subtitle={`${initiatives.data?.length || 0} مبادرة`}>
          {initiatives.data && initiatives.data.length > 0 ? (
            <div className="space-y-2">
              {initiatives.data.slice(0, 5).map((ini) => (
                <div key={ini.id} className="bg-gold-50 p-3 rounded-lg text-sm">
                  <div className="font-medium text-primary-700">{ini.title}</div>
                  {ini.role && <div className="text-xs text-darkgray mt-0.5">دوره: {ini.role}</div>}
                  {ini.impact && <div className="text-xs text-darkgray mt-1">الأثر: {ini.impact}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-darkgray text-center py-4">لا توجد مبادرات.</div>
          )}
        </Card>

        {/* المؤشرات */}
        <Card title="مؤشرات الأداء" subtitle={`${kpis.data?.length || 0} مؤشر`}>
          {kpis.data && kpis.data.length > 0 ? (
            <div className="space-y-2">
              {kpis.data.slice(0, 5).map((kpi) => (
                <div key={kpi.id} className="bg-gold-50 p-3 rounded-lg text-sm">
                  <div className="font-medium text-primary-700">{kpi.name}</div>
                  {kpi.target && <div className="text-xs text-darkgray">المستهدف: {kpi.target}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-darkgray text-center py-4">لا توجد مؤشرات.</div>
          )}
        </Card>

        {/* الاختبارات */}
        <Card title="الاختبارات الذكية" subtitle={`${assessments.data?.length || 0} اختبار`}>
          {assessments.data && assessments.data.length > 0 ? (
            <div className="space-y-2">
              {assessments.data.map((a) => {
                type AT = { assessments: { name: string } };
                const at = a as unknown as AT;
                return (
                  <div key={a.id} className="bg-gold-50 p-3 rounded-lg text-sm flex justify-between">
                    <span className="text-primary-700">{at.assessments?.name}</span>
                    <span className="font-bold text-gold-700">{Number(a.score).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-darkgray text-center py-4">لم يكمل اختبارات.</div>
          )}
        </Card>
      </div>

      {/* المقيمون المقترحون */}
      <Card title="المقيمون المقترحون" subtitle={`${nominees.data?.length || 0} مقترح من 15 مطلوبين`} className="mb-6">
        {nominees.data && nominees.data.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-2">
            {nominees.data.map((n) => (
              <div key={n.id} className="bg-gold-50 p-3 rounded-lg text-sm flex justify-between items-center">
                <div>
                  <div className="font-medium text-primary-700">{n.full_name}</div>
                  <div className="text-xs text-darkgray">{n.relationship_type}</div>
                </div>
                <Badge variant={n.status === 'approved' ? 'sage' : n.status === 'rejected' ? 'wine' : 'gold'}>
                  {n.status === 'approved' ? 'معتمد' : n.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-darkgray text-center py-4">لم يقترح المرشح مقيمين بعد.</div>
        )}
      </Card>

      {/* قرار اللجنة */}
      <Card title="قرار اللجنة" subtitle="كل قرار يحتاج توثيقاً ولا يقبل التراجع إلا بصلاحية موثقة">
        <div className="grid md:grid-cols-3 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-sage hover:bg-sage/90 text-white font-bold rounded-lg transition">
            <CheckCircle2 className="h-5 w-5" />
            اعتماد للمتابعة
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gold-600 hover:bg-gold-700 text-white font-bold rounded-lg transition">
            <RotateCcw className="h-5 w-5" />
            إعادة للمرشح للاستكمال
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-wine hover:bg-wine/90 text-white font-bold rounded-lg transition">
            <XCircle className="h-5 w-5" />
            رفض الملف
          </button>
        </div>
        <p className="text-xs text-darkgray mt-4 leading-relaxed">
          <strong>ملاحظة:</strong> أي قرار يتطلب: سبب القرار + ملاحظة حوكمية + توقيع رقمي. القرار يُسجَّل في
          سجل التدقيق ولا يُحذَف من الواجهة.
        </p>
      </Card>
    </div>
  );
}
