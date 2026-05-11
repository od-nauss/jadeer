import Link from 'next/link';
import { AlertTriangle, Brain, TrendingUp, Plus, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  general_department: 'إدارة عامة', department: 'إدارة', division: 'قسم',
  unit: 'وحدة', committee: 'لجنة', strategic_project: 'مشروع استراتيجي',
  executive_office: 'مكتب تنفيذي',
};

export default async function OrganizationGapsPage() {
  const supabase = createClient();

  const [
    { data: allUnits },
    { data: fitScores },
    { data: readyCards },
  ] = await Promise.all([
    supabase.from('organization_units').select('*, organization_unit_requirements(*)').eq('is_active', true),
    supabase.from('position_fit_scores')
      .select('organization_unit_id, candidate_profile_id, fit_score, fit_level, gaps_json, risk_flags_json, candidate_profiles(users(full_name, department))')
      .order('fit_score', { ascending: false }),
    supabase.from('leadership_cards')
      .select('readiness_level, development_gaps, leadership_type, candidate_profiles(users(department))')
      .eq('is_published', true),
  ]);

  // تجميع الملاءمات لكل وحدة
  const fitByUnit: Record<string, any[]> = {};
  (fitScores || []).forEach((f: any) => {
    if (!fitByUnit[f.organization_unit_id]) fitByUnit[f.organization_unit_id] = [];
    fitByUnit[f.organization_unit_id].push(f);
  });

  // الوحدات بلا مرشح جاهز
  const noCandidate = (allUnits || []).filter(u => !(fitByUnit[u.id] || []).length);
  const criticalNoCandidate = noCandidate.filter(u => u.is_critical);
  const criticalWithLow = (allUnits || []).filter(u => {
    const fits = fitByUnit[u.id] || [];
    return u.is_critical && fits.length > 0 && Math.max(...fits.map(f => f.fit_score)) < 70;
  });
  const needsSuccessor = (allUnits || []).filter(u => u.needs_successor);
  const hasVacancy = (allUnits || []).filter(u => u.has_vacancy);
  const onlyPromising = (allUnits || []).filter(u => {
    const fits = fitByUnit[u.id] || [];
    return fits.length > 0 && fits.every(f => f.fit_level === 'conditional' || f.fit_level === 'low');
  });

  // أكثر الفجوات شيوعاً
  const gapMap: Record<string, number> = {};
  (fitScores || []).forEach((f: any) => {
    ((f.gaps_json as string[]) || []).forEach(g => { gapMap[g] = (gapMap[g] || 0) + 1; });
  });
  const topGaps = Object.entries(gapMap).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxGap = topGaps[0]?.[1] || 1;

  // أكثر أنماط القيادة نقصاً
  const neededTypes = new Set((allUnits || [])
    .map(u => {
      const reqs = Array.isArray(u.organization_unit_requirements) ? u.organization_unit_requirements[0] : u.organization_unit_requirements;
      return reqs?.required_leadership_type;
    }).filter(Boolean));
  const availableTypes = new Set((readyCards || []).map((c: any) => c.leadership_type).filter(Boolean));
  const missingTypes = [...neededTypes].filter(t => !availableTypes.has(t));

  // اقتراحات الذكاء الاصطناعي
  const suggestions: { unit: string; action: string; reason: string }[] = [];
  criticalNoCandidate.slice(0, 3).forEach(u => {
    const reqs = Array.isArray(u.organization_unit_requirements) ? u.organization_unit_requirements[0] : u.organization_unit_requirements;
    const readinessLevel = reqs?.required_readiness_level;
    if (readinessLevel === 'ready_now') {
      suggestions.push({ unit: u.name, action: 'إنشاء مسابقة وظيفية عاجلة', reason: 'الوحدة حرجة وتحتاج مرشحاً جاهزاً فوراً' });
    } else {
      suggestions.push({ unit: u.name, action: 'تطوير داخلي مكثف + مسار تعاقب', reason: 'يمكن تجهيز مرشح في مرحلة النمو خلال سنة' });
    }
  });

  return (
    <div dir="rtl">
      <PageHeader
        title="الفجوات القيادية التنظيمية"
        description="رصد شامل للوحدات التي تعاني من فجوات قيادية: غياب مرشحين جاهزين، شواغر مفتوحة، مخاطر التعاقب."
        example="وحدة حرجة بلا مرشح ملاءمته 70%+ تحتاج إجراءً استباقياً عاجلاً."
        icon={<AlertTriangle className="h-5 w-5" />}
      />

      {/* ملخص */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-wine">{criticalNoCandidate.length}</div>
          <div className="text-xs text-darkgray">وحدة حرجة بلا مرشح</div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-700">{criticalWithLow.length}</div>
          <div className="text-xs text-darkgray">ملاءمة منخفضة في وحدات حرجة</div>
        </div>
        <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-gold-700">{hasVacancy.length}</div>
          <div className="text-xs text-darkgray">شاغر مفتوح</div>
        </div>
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary-700">{needsSuccessor.length}</div>
          <div className="text-xs text-darkgray">تحتاج بديلاً</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* وحدات حرجة بلا مرشح */}
        <Card title="وحدات حرجة بلا مرشح جاهز" className="border-rose-200 bg-rose-50/30">
          {criticalNoCandidate.length > 0 ? (
            <div className="space-y-2">
              {criticalNoCandidate.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-white border border-rose-200 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-wine flex-shrink-0" />
                  <div className="flex-1">
                    <Link href={`/organization/units/${u.id}`} className="font-medium text-primary-700 hover:underline">{u.name}</Link>
                    <div className="text-xs text-darkgray">{UNIT_TYPE_LABELS[u.unit_type] || u.unit_type}</div>
                  </div>
                  <Link href={`/hr/competitions/create?unitId=${u.id}&unitName=${encodeURIComponent(u.name)}`}
                    className="text-xs px-2 py-1 bg-wine text-white rounded-lg hover:opacity-90">
                    <Plus className="h-3 w-3 inline" /> مسابقة
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sage text-sm">✓ جميع الوحدات الحرجة لديها مرشحون</div>
          )}
        </Card>

        {/* الشواغر المفتوحة */}
        <Card title="شواغر مفتوحة تحتاج تكليفاً">
          {hasVacancy.length > 0 ? (
            <div className="space-y-2">
              {hasVacancy.map(u => {
                const fits = fitByUnit[u.id] || [];
                const best = fits[0];
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex-1">
                      <Link href={`/organization/units/${u.id}`} className="font-medium text-primary-700 hover:underline">{u.name}</Link>
                      <div className="text-xs text-darkgray">{UNIT_TYPE_LABELS[u.unit_type] || u.unit_type}</div>
                    </div>
                    {best ? (
                      <div className="text-center">
                        <div className="text-sm font-bold text-primary-700">{Number(best.fit_score).toFixed(0)}%</div>
                        <div className="text-xs text-darkgray">أفضل ملاءمة</div>
                      </div>
                    ) : <Badge variant="wine">بلا مرشح</Badge>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-sage text-sm">✓ لا توجد شواغر</div>
          )}
        </Card>

        {/* أكثر الفجوات تكراراً */}
        <Card title="أكثر الفجوات القيادية تكراراً">
          {topGaps.length > 0 ? (
            <div className="space-y-2.5">
              {topGaps.map(([gap, count]) => (
                <div key={gap}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray">{gap}</span>
                    <span className="font-bold text-wine">{count} وحدة</span>
                  </div>
                  <div className="h-2 bg-rose-50 rounded-full overflow-hidden">
                    <div className="h-full bg-wine rounded-full" style={{ width: `${(count / maxGap) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-darkgray text-sm">قم بتشغيل حساب الملاءمة أولاً</div>
          )}
        </Card>

        {/* أنماط القيادة المفقودة */}
        {missingTypes.length > 0 && (
          <Card title="أنماط قيادة مطلوبة غير متوفرة" className="border-amber-200 bg-amber-50/30">
            <div className="space-y-2">
              {missingTypes.map(type => (
                <div key={type} className="flex items-center gap-2 p-2 bg-white border border-amber-200 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-amber-700 flex-shrink-0" />
                  <span className="text-sm text-primary-700">{type}</span>
                  <span className="text-xs text-amber-700 mr-auto">لا يوجد مرشح</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* اقتراحات الذكاء الاصطناعي */}
        {suggestions.length > 0 && (
          <Card title="اقتراحات لمعالجة الفجوات" className="md:col-span-2 bg-primary-50 border-primary-200">
            <div className="flex items-center gap-2 text-sm font-bold text-primary-700 mb-3">
              <Brain className="h-4 w-4 text-gold-600" />بناءً على تحليل الفجوات والبيانات المتاحة
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {suggestions.map((s, i) => (
                <div key={i} className="p-4 bg-white border border-primary-100 rounded-xl">
                  <div className="font-bold text-primary-700 text-sm mb-1">{s.unit}</div>
                  <div className="text-xs text-gold-700 font-medium mb-1">الإجراء: {s.action}</div>
                  <div className="text-xs text-darkgray">{s.reason}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* وحدات يعتمد عليها شخص واحد */}
        {onlyPromising.length > 0 && (
          <Card title="وحدات لديها مرشحون واعدون فقط" className="border-gold-300">
            <div className="space-y-2">
              {onlyPromising.map(u => {
                const fits = fitByUnit[u.id] || [];
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                    <Users className="h-4 w-4 text-gold-700 flex-shrink-0" />
                    <div className="flex-1">
                      <Link href={`/organization/units/${u.id}`} className="font-medium text-primary-700 text-sm hover:underline">{u.name}</Link>
                      <div className="text-xs text-darkgray">{fits.length} مرشح — الأعلى: {Number(fits[0]?.fit_score || 0).toFixed(0)}%</div>
                    </div>
                    <Badge variant="gold">يحتاج تطوير</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
