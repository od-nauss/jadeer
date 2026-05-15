import Link from 'next/link';
import { Map, AlertTriangle, CheckCircle, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  general_department: 'إدارة عامة', department: 'إدارة', division: 'قسم',
  unit: 'وحدة', committee: 'لجنة', strategic_project: 'مشروع استراتيجي',
  executive_office: 'مكتب تنفيذي',
};

const FIT_LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'ملاءمة عالية', color: 'text-sage', bg: 'bg-sage/10 border-sage/30' },
  good: { label: 'ملاءمة جيدة', color: 'text-primary-700', bg: 'bg-primary-50 border-primary-200' },
  conditional: { label: 'ملاءمة مشروطة', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  low: { label: 'ملاءمة منخفضة', color: 'text-gold-700', bg: 'bg-gold-50 border-gold-200' },
  not_suitable: { label: 'غير مناسب', color: 'text-wine', bg: 'bg-rose-50 border-rose-200' },
};

const READINESS_LABELS: Record<string, string> = {
  ready_now: 'جاهز الآن', ready_within_year: 'خلال سنة', promising: 'واعد',
};

export default async function OrganizationMapPage({ searchParams }: { searchParams: { view?: string; filter?: string; type?: string } }) {
  const view = searchParams.view || 'cards';
  const filter = searchParams.filter || 'all';
  const typeFilter = searchParams.type || '';

  const supabase = createServiceClient();

  const [{ data: units }, { data: fitScores }, { data: successionMaps }] = await Promise.all([
    supabase.from('organization_units').select('*, organization_unit_requirements(*)').eq('is_active', true).order('unit_type').order('name'),
    supabase.from('position_fit_scores')
      .select('organization_unit_id, candidate_profile_id, fit_score, fit_level, confidence_score, fit_reason, ai_summary, candidate_profiles(id, users(full_name, job_title, department))')
      .order('fit_score', { ascending: false }),
    supabase.from('succession_maps').select('organization_unit_id, risk_level, status'),
  ]);

  // تنظيم بيانات الملاءمة
  const fitByUnit: Record<string, any[]> = {};
  (fitScores || []).forEach((fs: any) => {
    if (!fitByUnit[fs.organization_unit_id]) fitByUnit[fs.organization_unit_id] = [];
    fitByUnit[fs.organization_unit_id].push(fs);
  });

  const successionByUnit: Record<string, any> = {};
  (successionMaps || []).forEach((s: any) => { successionByUnit[s.organization_unit_id] = s; });

  // إحصاءات الخريطة
  const withCandidate = (units || []).filter(u => (fitByUnit[u.id] || []).length > 0).length;
  const noCandidate = (units || []).filter(u => u.is_critical && !(fitByUnit[u.id] || []).length).length;
  const highFit = (fitScores || []).filter(f => f.fit_level === 'high').length;

  // فلترة الوحدات
  let filteredUnits = [...(units || [])];
  if (typeFilter) filteredUnits = filteredUnits.filter(u => u.unit_type === typeFilter);
  if (filter === 'critical') filteredUnits = filteredUnits.filter(u => u.is_critical);
  if (filter === 'vacancy') filteredUnits = filteredUnits.filter(u => u.has_vacancy);
  if (filter === 'no_candidate') filteredUnits = filteredUnits.filter(u => !(fitByUnit[u.id] || []).length);
  if (filter === 'has_candidate') filteredUnits = filteredUnits.filter(u => (fitByUnit[u.id] || []).length > 0);
  if (filter === 'needs_successor') filteredUnits = filteredUnits.filter(u => u.needs_successor);

  return (
    <div dir="rtl">
      <PageHeader
        title="خريطة الملاءمة التنظيمية"
        description="رؤية بانورامية للعلاقة بين الوحدات التنظيمية وجاهزية المرشحين. التصنيف القيادي مستقل — الخريطة تجيب: أين يناسب هذا المرشح؟"
        example="الوحدة الحمراء لا تملك بديلاً قيادياً — تحتاج إجراءً استباقياً. اضغط على أي وحدة لعرض تفاصيلها."
        icon={<Map className="h-5 w-5" />}
      />

      {/* إحصاءات */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-center">
          <div className="text-xl font-bold text-primary-700">{(units || []).length}</div>
          <div className="text-xs text-darkgray">وحدة تنظيمية</div>
        </div>
        <div className="p-3 bg-sage/10 border border-sage/30 rounded-xl text-center">
          <div className="text-xl font-bold text-sage">{withCandidate}</div>
          <div className="text-xs text-darkgray">لديها مرشحون</div>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-xl font-bold text-wine">{noCandidate}</div>
          <div className="text-xs text-darkgray">حرجة بلا بديل</div>
        </div>
        <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl text-center">
          <div className="text-xl font-bold text-gold-700">{highFit}</div>
          <div className="text-xs text-darkgray">ملاءمة عالية</div>
        </div>
      </div>

      {/* فلاتر وطرق العرض */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* طريقة العرض */}
        <div className="flex rounded-xl border border-gold-200 overflow-hidden">
          {[['cards','بطاقات'], ['table','جدول']].map(([v, l]) => (
            <Link key={v} href={`?view=${v}&filter=${filter}&type=${typeFilter}`}
              className={`px-3 py-1.5 text-sm ${view === v ? 'bg-primary-700 text-white' : 'text-primary-700 hover:bg-gold-50'}`}>
              {l}
            </Link>
          ))}
        </div>

        {/* فلاتر */}
        {[
          ['all','الكل'], ['critical','حرجة'], ['vacancy','شواغر'],
          ['no_candidate','بلا مرشح'], ['has_candidate','لديها مرشح'], ['needs_successor','تحتاج تعاقب'],
        ].map(([v, l]) => (
          <Link key={v} href={`?view=${view}&filter=${v}&type=${typeFilter}`}
            className={`px-3 py-1.5 rounded-xl border text-sm transition ${filter === v ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}>
            {l}
          </Link>
        ))}

        {/* فلتر النوع */}
        <select
          onChange={e => window.location.href = `?view=${view}&filter=${filter}&type=${e.target.value}`}
          value={typeFilter}
          className="border border-gold-200 rounded-xl px-3 py-1.5 text-sm text-primary-700 focus:outline-none">
          <option value="">كل الأنواع</option>
          {Object.entries(UNIT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <form action="/api/organization/fit" method="POST" className="mr-auto">
          <button type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sage/40 text-sage hover:bg-sage/10 rounded-xl text-sm transition">
            <RefreshCw className="h-3.5 w-3.5" />تحديث الملاءمة
          </button>
        </form>
      </div>

      {/* عرض البطاقات */}
      {view === 'cards' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map(u => {
            const fits = (fitByUnit[u.id] || []).sort((a: any, b: any) => b.fit_score - a.fit_score);
            const best = fits[0];
            const bestConfig = best ? FIT_LEVEL_CONFIG[best.fit_level] : null;
            const succession = successionByUnit[u.id];
            const reqs = Array.isArray(u.organization_unit_requirements) ? u.organization_unit_requirements[0] : u.organization_unit_requirements;

            return (
              <Link key={u.id} href={`/organization/units/${u.id}`}
                className={`block p-5 rounded-2xl border hover:shadow-md transition group ${
                  !best && u.is_critical ? 'border-rose-300 bg-rose-50/40' :
                  best?.fit_level === 'high' ? 'border-sage/30 bg-sage/5' :
                  'border-gold-200 bg-white'
                }`}>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary-700 leading-tight mb-1">{u.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded">{UNIT_TYPE_LABELS[u.unit_type] || u.unit_type}</span>
                      {u.is_critical && <span className="text-xs px-1.5 py-0.5 bg-rose-50 text-wine rounded border border-rose-200">حرجة</span>}
                      {u.has_vacancy && <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">شاغر</span>}
                    </div>
                  </div>
                  {u.employee_count > 0 && (
                    <div className="text-xs text-darkgray flex items-center gap-1 flex-shrink-0 mt-1">
                      <Users className="h-3 w-3" />{u.employee_count}
                    </div>
                  )}
                </div>

                {/* أفضل مرشح */}
                {best ? (
                  <div className={`p-3 rounded-xl border ${bestConfig?.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-darkgray mb-0.5">أفضل ملاءمة</div>
                        <div className={`text-sm font-bold truncate ${bestConfig?.color}`}>
                          {(best.candidate_profiles as any)?.users?.full_name}
                        </div>
                        <div className="text-xs text-darkgray">{bestConfig?.label}</div>
                      </div>
                      <div className={`text-2xl font-bold flex-shrink-0 ${bestConfig?.color}`}>
                        {Number(best.fit_score).toFixed(0)}%
                      </div>
                    </div>
                    {fits.length > 1 && (
                      <div className="text-xs text-darkgray mt-1">{fits.length} مرشح محلل</div>
                    )}
                  </div>
                ) : u.is_critical ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-wine flex-shrink-0" />
                    <div className="text-xs text-wine">وحدة حرجة — لا يوجد مرشح محلل بعد</div>
                  </div>
                ) : (
                  <div className="p-3 bg-gold-50 border border-gold-100 rounded-xl text-xs text-darkgray">
                    لا توجد بيانات ملاءمة — قم بتشغيل التحليل
                  </div>
                )}

                {/* متطلبات القيادة */}
                {reqs?.required_leadership_type && (
                  <div className="mt-2 text-xs text-darkgray">
                    النمط المطلوب: <span className="text-primary-700 font-medium">{reqs.required_leadership_type}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* عرض الجدول */}
      {view === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">الوحدة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">النوع</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">أفضل مرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الملاءمة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">مؤشرات</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(u => {
                  const fits = (fitByUnit[u.id] || []).sort((a: any, b: any) => b.fit_score - a.fit_score);
                  const best = fits[0];
                  const fitCfg = best ? FIT_LEVEL_CONFIG[best.fit_level] : null;
                  return (
                    <tr key={u.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-primary-800">{u.name}</div>
                        {u.description && <div className="text-xs text-darkgray truncate max-w-xs">{u.description}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded">{UNIT_TYPE_LABELS[u.unit_type] || u.unit_type}</span>
                      </td>
                      <td className="py-3 px-3">
                        {best ? (
                          <div>
                            <div className="font-medium text-primary-700">{(best.candidate_profiles as any)?.users?.full_name}</div>
                            <div className="text-xs text-darkgray">{(best.candidate_profiles as any)?.users?.job_title}</div>
                          </div>
                        ) : <span className="text-xs text-darkgray">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        {best ? (
                          <div>
                            <div className={`text-lg font-bold ${fitCfg?.color}`}>{Number(best.fit_score).toFixed(0)}%</div>
                            <div className={`text-xs px-1.5 py-0.5 rounded ${fitCfg?.bg || ''}`}>{fitCfg?.label}</div>
                          </div>
                        ) : <span className="text-xs text-darkgray">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1 flex-wrap">
                          {u.is_critical && <span className="text-xs text-wine">⚠ حرجة</span>}
                          {u.has_vacancy && <span className="text-xs text-amber-700">🔴 شاغر</span>}
                          {u.needs_successor && <span className="text-xs text-steelblue">↩ تعاقب</span>}
                          {fits.length > 1 && <span className="text-xs text-darkgray">{fits.length} مرشح</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Link href={`/organization/units/${u.id}`} className="text-xs text-primary-600 hover:underline">تفاصيل ←</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredUnits.length === 0 && (
        <Card>
          <div className="text-center py-10 text-darkgray text-sm">لا توجد وحدات مطابقة لهذا الفلتر.</div>
        </Card>
      )}
    </div>
  );
}
