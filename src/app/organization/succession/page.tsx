import Link from 'next/link';
import { Users, AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'حرج', color: 'text-wine', bg: 'bg-rose-50 border-rose-200' },
  high: { label: 'مرتفع', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  medium: { label: 'متوسط', color: 'text-gold-700', bg: 'bg-gold-50 border-gold-200' },
  low: { label: 'منخفض', color: 'text-sage', bg: 'bg-sage/10 border-sage/30' },
};

const READINESS_AR: Record<string, string> = {
  ready_now: 'جاهز الآن', ready_within_year: 'خلال سنة', promising: 'واعد',
  specialist: 'متخصص', not_suitable: 'غير مناسب', human_leader: 'قائد إنساني',
};

export default async function OrganizationSuccessionPage() {
  const supabase = createClient();

  const { data: successions } = await supabase
    .from('succession_maps')
    .select(`
      *, organization_units(id, name, unit_type, is_critical, employee_count),
      succession_candidates(*, candidate_profiles(id, users(full_name, job_title, department)))
    `)
    .order('risk_level', { ascending: false });

  // الوحدات الحرجة بلا تعاقب
  const { data: allCritical } = await supabase
    .from('organization_units')
    .select('id, name, unit_type')
    .eq('is_critical', true)
    .eq('is_active', true);

  const mappedUnitIds = new Set((successions || []).map((s: any) => s.organization_unit_id));
  const unmappedCritical = (allCritical || []).filter(u => !mappedUnitIds.has(u.id));

  // إحصاءات
  const criticalCount = (successions || []).filter((s: any) => s.risk_level === 'critical').length;
  const highCount = (successions || []).filter((s: any) => s.risk_level === 'high').length;
  const readyCount = (successions || []).filter((s: any) => {
    const cands = (s.succession_candidates as any[] || []);
    return cands.some(c => c.rank_order === 1 && c.readiness_level === 'ready_now');
  }).length;

  return (
    <div dir="rtl">
      <PageHeader
        title="خريطة التعاقب الوظيفي"
        description="تعرض الصف القيادي الثاني والثالث لكل وحدة. تجيب عن: ماذا لو غادر القائد الحالي؟"
        example="وحدة حرجة بلا بديل جاهز = خطر عالٍ. اضغط على أي وحدة لعرض تفاصيلها ومرشحيها."
        icon={<Users className="h-5 w-5" />}
      />

      {/* إحصاءات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-wine">{criticalCount}</div>
          <div className="text-xs text-darkgray">مخاطر حرجة</div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-700">{highCount}</div>
          <div className="text-xs text-darkgray">مخاطر مرتفعة</div>
        </div>
        <div className="p-4 bg-sage/10 border border-sage/30 rounded-xl text-center">
          <div className="text-2xl font-bold text-sage">{readyCount}</div>
          <div className="text-xs text-darkgray">بديل جاهز الآن</div>
        </div>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-wine">{unmappedCritical.length}</div>
          <div className="text-xs text-darkgray">حرجة بلا خطة تعاقب</div>
        </div>
      </div>

      {/* تنبيه وحدات حرجة بلا تعاقب */}
      {unmappedCritical.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 mb-5">
          <AlertTriangle className="h-4 w-4 text-wine flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-wine mb-1">{unmappedCritical.length} وحدة حرجة بلا خطة تعاقب</div>
            <div className="flex flex-wrap gap-2">
              {unmappedCritical.map(u => (
                <Link key={u.id} href={`/organization/units/${u.id}`}
                  className="text-xs px-2 py-1 bg-white border border-rose-200 text-wine rounded-lg hover:opacity-80">
                  {u.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* قوائم التعاقب */}
      {(successions || []).length > 0 ? (
        <div className="space-y-4">
          {(successions || []).map((s: any) => {
            const unit = s.organization_units as any;
            const risk = RISK_CONFIG[s.risk_level] || RISK_CONFIG.medium;
            const candidates = (s.succession_candidates as any[] || []).sort((a: any, b: any) => a.rank_order - b.rank_order);
            const ranks = [1, 2, 3];

            return (
              <Card key={s.id} className={`border ${risk.bg.split(' ')[1]}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link href={`/organization/units/${unit.id}`}
                      className="text-lg font-bold text-primary-700 hover:underline">
                      {unit.name}
                    </Link>
                    <div className="text-xs text-darkgray mt-0.5">{unit.unit_type}</div>
                    {s.summary && <p className="text-xs text-darkgray mt-1 max-w-lg">{s.summary}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-lg border ${risk.bg} ${risk.color} font-bold`}>
                      خطر: {risk.label}
                    </span>
                    {unit.is_critical && <Badge variant="wine">حرجة</Badge>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  {ranks.map(rank => {
                    const cand = candidates.find(c => c.rank_order === rank);
                    const rankLabels = { 1: 'البديل المباشر', 2: 'الصف الثاني (خلال سنة)', 3: 'الصف الثالث (3 سنوات)' };
                    const rankColors = { 1: 'border-rose-200 bg-rose-50/50', 2: 'border-amber-200 bg-amber-50/50', 3: 'border-gold-200 bg-gold-50/50' };
                    return (
                      <div key={rank} className={`p-4 rounded-xl border ${cand ? rankColors[rank as keyof typeof rankColors] : 'border-gray-200 bg-gray-50'}`}>
                        <div className={`text-xs font-bold mb-2 ${cand ? (rank === 1 ? 'text-wine' : rank === 2 ? 'text-amber-700' : 'text-gold-700') : 'text-gray-400'}`}>
                          {rankLabels[rank as keyof typeof rankLabels]}
                        </div>
                        {cand ? (
                          <div>
                            <div className="font-bold text-primary-700 text-sm">
                              {(cand.candidate_profiles as any)?.users?.full_name}
                            </div>
                            <div className="text-xs text-darkgray">{(cand.candidate_profiles as any)?.users?.job_title}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm font-bold text-primary-600">{cand.fit_score || 0}%</span>
                              <span className="text-xs text-darkgray">ملاءمة</span>
                            </div>
                            <div className="text-xs text-primary-600 mt-0.5">{READINESS_AR[cand.readiness_level] || cand.readiness_level}</div>
                            {cand.time_to_ready && (
                              <div className="text-xs text-steelblue mt-0.5">وقت التجهيز: {cand.time_to_ready}</div>
                            )}
                            {(cand.development_needs_json as string[] || []).length > 0 && (
                              <div className="mt-1 text-xs text-darkgray">
                                يحتاج: {(cand.development_needs_json as string[]).slice(0, 2).join('، ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">لم يُحدد بعد</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="لا توجد خطط تعاقب"
          description="ستُبنى خريطة التعاقب بعد اعتماد البطاقات القيادية وحساب الملاءمة."
        />
      )}
    </div>
  );
}
