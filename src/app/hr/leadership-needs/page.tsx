import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card } from '@/components/ui';
import { TrendingUp, Brain, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HRLeadershipNeedsPage() {
  const supabase = createServiceClient();

  const [{ data: cards }, { data: units }] = await Promise.all([
    supabase.from('leadership_cards').select('readiness_level, leadership_type, development_gaps, axis_scores, candidate_profiles(users(department))').eq('is_published', true).limit(200),
    supabase.from('organization_units').select('id, name, unit_type, is_critical, has_vacancy, needs_successor'),
  ]);

  // تحليل الفجوات المتكررة
  const gapFrequency: Record<string, number> = {};
  (cards || []).forEach((c: any) => {
    const gaps = (c.development_gaps as string[] | null) || [];
    gaps.forEach(g => { gapFrequency[g] = (gapFrequency[g] || 0) + 1; });
  });
  const sortedGaps = Object.entries(gapFrequency).sort(([, a], [, b]) => b - a).slice(0, 8);

  // توزيع حسب تصنيف الجاهزية
  const levelDistrib: Record<string, number> = {};
  (cards || []).forEach((c: any) => { levelDistrib[c.readiness_level] = (levelDistrib[c.readiness_level] || 0) + 1; });

  // متوسط المحاور
  const axisTotal: Record<string, number[]> = {};
  (cards || []).forEach((c: any) => {
    const scores = (c.axis_scores as Record<string, number> | null) || {};
    Object.entries(scores).forEach(([axis, score]) => {
      if (!axisTotal[axis]) axisTotal[axis] = [];
      axisTotal[axis].push(Number(score));
    });
  });
  const axisAverages = Object.entries(axisTotal).map(([axis, vals]) => ({
    axis, avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  })).sort((a, b) => a.avg - b.avg);

  // الإدارات بدون مرشحين جاهزين
  const readyDepts = new Set((cards || []).filter((c: any) => c.readiness_level === 'ready_now').map((c: any) => c.candidate_profiles?.users?.department).filter(Boolean));
  const criticalUnitsNoReady = (units || []).filter(u => u.is_critical && u.needs_successor);

  const LEVEL_LABELS: Record<string, string> = {
    ready_now: 'جاهز الآن', ready_within_year: 'خلال سنة', promising: 'واعد',
    specialist: 'متخصص جيد', not_suitable: 'غير مناسب حالياً',
    high_performance_low_satisfaction: 'أداء عالٍ/رضا منخفض', human_leader: 'قائد إنساني',
  };

  const AXIS_LABELS: Record<string, string> = {
    leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
    performance: 'الأداء والإنجاز', innovation: 'الابتكار',
    team: 'رضا الفريق', technology: 'التقنية', integrity: 'النزاهة',
  };

  // اقتراحات برامج بناءً على أضعف المحاور
  const weakestAxes = axisAverages.slice(0, 3);
  const programSuggestions: string[] = [];
  weakestAxes.forEach(({ axis }) => {
    if (axis === 'team') programSuggestions.push('برنامج القيادة الإنسانية وإدارة الفرق');
    if (axis === 'strategic') programSuggestions.push('برنامج التخطيط الاستراتيجي للقادة');
    if (axis === 'technology') programSuggestions.push('برنامج القيادة الرقمية والذكاء الاصطناعي');
    if (axis === 'performance') programSuggestions.push('برنامج إدارة الأداء ومؤشرات القياس');
    if (axis === 'innovation') programSuggestions.push('برنامج قيادة الابتكار والمبادرات');
    if (axis === 'leadership') programSuggestions.push('برنامج القيادة التحويلية والتأثير المؤسسي');
  });

  return (
    <div dir="rtl">
      <PageHeader
        title="تحليل الاحتياجات القيادية"
        description="تحليل شامل للفجوات القيادية واحتياجات التطوير على مستوى المنظمة بناءً على بيانات منصة جدير."
        example="إذا ظهرت فجوة 'إدارة الأزمات' متكررة، يُقترح برنامج تطوير جماعي في هذا المجال."
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* توزيع الجاهزية */}
        <Card title="توزيع تصنيفات الجاهزية">
          <div className="space-y-2">
            {Object.entries(levelDistrib).map(([level, count]) => (
              <div key={level}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-darkgray">{LEVEL_LABELS[level] || level}</span>
                  <span className="font-bold text-primary-700">{count}</span>
                </div>
                <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: `${Math.min(100, (count / (cards?.length || 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* الفجوات الأكثر تكراراً */}
        <Card title="الفجوات الأكثر تكراراً">
          {sortedGaps.length === 0 ? (
            <div className="text-sm text-darkgray">لا توجد بيانات فجوات بعد.</div>
          ) : (
            <div className="space-y-2">
              {sortedGaps.map(([gap, count]) => (
                <div key={gap}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-darkgray">{gap}</span>
                    <span className="font-bold text-wine">{count} مرشح</span>
                  </div>
                  <div className="h-2 bg-rose-50 rounded-full overflow-hidden">
                    <div className="h-full bg-wine rounded-full" style={{ width: `${Math.min(100, (count / (cards?.length || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* متوسط المحاور */}
        <Card title="متوسط المحاور (أضعفها أولاً)">
          <div className="space-y-2">
            {axisAverages.map(({ axis, avg }) => (
              <div key={axis}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-darkgray">{AXIS_LABELS[axis] || axis}</span>
                  <span className={`font-bold ${avg >= 70 ? 'text-sage' : avg >= 55 ? 'text-gold-700' : 'text-wine'}`}>{avg}٪</span>
                </div>
                <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${avg >= 70 ? 'bg-sage' : avg >= 55 ? 'bg-gold-500' : 'bg-wine'}`} style={{ width: `${avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* توصيات البرامج */}
        <Card title="برامج تطوير مقترحة" className="bg-primary-50 border-primary-200">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-primary-700">
            <Brain className="h-4 w-4 text-gold-600" />بناءً على أضعف المحاور
          </div>
          <div className="space-y-2">
            {programSuggestions.length > 0 ? programSuggestions.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-gold-600 flex-shrink-0">•</span>
                <span className="text-primary-800">{p}</span>
              </div>
            )) : <div className="text-sm text-darkgray">لا توجد بيانات كافية للاقتراح.</div>}
          </div>
        </Card>

        {/* وحدات حرجة بدون بديل */}
        {criticalUnitsNoReady.length > 0 && (
          <Card title="وحدات حرجة تحتاج بديلاً قيادياً" className="md:col-span-2 bg-rose-50 border-rose-200">
            <div className="flex items-start gap-2 mb-3 text-sm text-wine">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{criticalUnitsNoReady.length} وحدة حرجة لا تملك مرشحاً جاهزاً — يحتاج إجراء استباقي.</span>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {criticalUnitsNoReady.map(u => (
                <div key={u.id} className="p-3 bg-white border border-rose-200 rounded-xl text-sm">
                  <div className="font-medium text-primary-700">{u.name}</div>
                  <div className="text-xs text-darkgray">{u.unit_type}</div>
                  {u.has_vacancy && <div className="text-xs text-wine mt-1">شاغر</div>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
