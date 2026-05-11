import Link from 'next/link';
import { Map, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, EmptyState, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  department: 'إدارة', division: 'قسم', unit: 'وحدة',
  committee: 'لجنة', project: 'مشروع',
};

export default async function OrganizationMapPage() {
  const supabase = createClient();

  const { data: units } = await supabase
    .from('organization_units')
    .select('id, name, unit_type, employee_count, has_vacancy, is_critical, needs_successor')
    .order('unit_type').order('name');

  const { data: fitScores } = await supabase
    .from('position_fit_scores')
    .select('organization_unit_id, fit_score, candidate_profiles(id, users(full_name, job_title))')
    .order('fit_score', { ascending: false });

  const bestByUnit: Record<string, { name: string; score: number; job: string }> = {};
  (fitScores || []).forEach((fs: any) => {
    const uid = fs.organization_unit_id;
    if (!bestByUnit[uid] || fs.fit_score > bestByUnit[uid].score) {
      bestByUnit[uid] = { name: fs.candidate_profiles?.users?.full_name || '—', score: Number(fs.fit_score), job: fs.candidate_profiles?.users?.job_title || '—' };
    }
  });

  const { data: readyCards } = await supabase
    .from('leadership_cards').select('total_score, candidate_profiles(users(full_name, department))')
    .eq('is_published', true).in('readiness_level', ['ready_now', 'ready_within_year']).order('total_score', { ascending: false });

  const readyByDept: Record<string, Array<{ name: string; score: number }>> = {};
  (readyCards || []).forEach((c: any) => {
    const dept = c.candidate_profiles?.users?.department;
    if (dept) { if (!readyByDept[dept]) readyByDept[dept] = []; readyByDept[dept].push({ name: c.candidate_profiles.users.full_name, score: Number(c.total_score) }); }
  });

  return (
    <div dir="rtl">
      <PageHeader
        title="خريطة الكفاءات والملاءمة التنظيمية"
        description="رؤية بانورامية للوحدات التنظيمية والمرشحين الأكثر ملاءمة. التصنيف القيادي مستقل عن الهيكل."
        example="الوحدة الحمراء تحتاج بديلاً قيادياً جاهزاً. الرقم يعبر عن درجة الملاءمة."
        icon={<Map className="h-5 w-5" />}
      />

      {units && units.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {units.map((u) => {
            const best = bestByUnit[u.id];
            const deptReady = readyByDept[u.name] || [];
            const hasCandidate = !!best || deptReady.length > 0;
            return (
              <Link key={u.id} href={`/organization/units/${u.id}`}
                className={`institutional-card p-5 hover:border-gold-400 transition group ${!hasCandidate && u.is_critical ? 'border-rose-200 bg-rose-50/30' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-700 leading-tight">{u.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary">{UNIT_TYPE_LABELS[u.unit_type] || u.unit_type}</Badge>
                      {u.is_critical && <Badge variant="wine">حرجة</Badge>}
                    </div>
                  </div>
                  {u.employee_count && <div className="text-xs text-darkgray flex-shrink-0">{u.employee_count} موظف</div>}
                </div>

                {best ? (
                  <div className="mt-3 p-2.5 bg-sage/5 border border-sage/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs text-darkgray mb-0.5">أفضل ملاءمة</div><div className="text-sm font-medium text-primary-700 truncate">{best.name}</div></div>
                      <div className={`text-xl font-bold ${best.score >= 80 ? 'text-sage' : best.score >= 60 ? 'text-gold-700' : 'text-wine'}`}>{best.score.toFixed(0)}٪</div>
                    </div>
                  </div>
                ) : deptReady.length > 0 ? (
                  <div className="mt-3 p-2.5 bg-gold-50 border border-gold-200 rounded-lg">
                    <div className="text-xs text-darkgray mb-0.5">مرشح جاهز (نفس الإدارة)</div>
                    <div className="text-sm font-medium text-primary-700 truncate">{deptReady[0].name}</div>
                    <div className="text-xs text-gold-700">{deptReady[0].score.toFixed(0)}٪</div>
                  </div>
                ) : u.is_critical ? (
                  <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-wine flex-shrink-0" />
                    <div className="text-xs text-wine">لا يوجد بديل — وحدة حرجة</div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-darkgray">لا توجد بيانات ملاءمة</div>
                )}

                <div className="flex gap-1.5 mt-2">
                  {u.has_vacancy && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">شاغر</span>}
                  {u.needs_successor && <span className="text-xs bg-rose-50 text-wine border border-rose-200 px-1.5 py-0.5 rounded">يحتاج تعاقب</span>}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Map className="h-10 w-10" />} title="لا يوجد هيكل تنظيمي" description="أضف الوحدات من لوحة الإدارة." />
      )}
    </div>
  );
}
