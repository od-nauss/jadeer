import { TrendingUp, Target, AlertTriangle, BarChart3, Brain } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز', innovation: 'الابتكار',
  team: 'رضا الفريق', technology: 'التقنية', integrity: 'النزاهة',
};

const READINESS_LABELS: Record<string, string> = {
  ready_now: 'جاهز الآن', ready_within_year: 'خلال سنة', promising: 'واعد',
  specialist: 'متخصص', not_suitable: 'غير مناسب حالياً',
  high_performance_low_satisfaction: 'أداء عالٍ/رضا منخفض', human_leader: 'قائد إنساني',
};

export default async function HRDevelopmentReportsPage() {
  const supabase = createServiceClient();

  const [
    { data: cards },
    { data: plans },
    { data: planItems },
  ] = await Promise.all([
    supabase.from('leadership_cards').select('readiness_level, development_gaps, axis_scores, candidate_profiles(users(department))').eq('is_published', true),
    supabase.from('development_plans').select('overall_status, candidate_profiles(users(department))'),
    supabase.from('development_plan_items').select('status, category, title, due_date'),
  ]);

  // 1) أكثر الفجوات تكراراً
  const gapMap: Record<string, number> = {};
  (cards || []).forEach((c: any) => {
    ((c.development_gaps as string[]) || []).forEach(g => { gapMap[g] = (gapMap[g] || 0) + 1; });
  });
  const topGaps = Object.entries(gapMap).sort(([, a], [, b]) => b - a).slice(0, 10);
  const maxGap = topGaps[0]?.[1] || 1;

  // 2) متوسط المحاور
  const axisTotal: Record<string, number[]> = {};
  (cards || []).forEach((c: any) => {
    const scores = (c.axis_scores as Record<string, number>) || {};
    Object.entries(scores).forEach(([axis, score]) => {
      if (!axisTotal[axis]) axisTotal[axis] = [];
      axisTotal[axis].push(Number(score));
    });
  });
  const axisAvgs = Object.entries(axisTotal)
    .map(([axis, vals]) => ({ axis, avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }))
    .sort((a, b) => a.avg - b.avg);

  // 3) حالة الخطط
  const planStatusMap: Record<string, number> = {};
  (plans || []).forEach((p: any) => { planStatusMap[p.overall_status] = (planStatusMap[p.overall_status] || 0) + 1; });
  const planStatusLabels: Record<string, string> = {
    proposed: 'مقترحة', approved: 'معتمدة', in_progress: 'جارية',
    completed: 'مكتملة', on_hold: 'موقوفة', delayed: 'متأخرة',
  };
  const planStatusColors: Record<string, string> = {
    proposed: 'bg-gold-400', approved: 'bg-primary-600', in_progress: 'bg-steelblue',
    completed: 'bg-sage', on_hold: 'bg-gray-400', delayed: 'bg-wine',
  };
  const totalPlans = Object.values(planStatusMap).reduce((s, v) => s + v, 0) || 1;

  // 4) بنود الخطط حسب الحالة
  const itemStatusMap: Record<string, number> = {};
  (planItems || []).forEach((i: any) => { itemStatusMap[i.status] = (itemStatusMap[i.status] || 0) + 1; });
  const itemStatusLabels: Record<string, string> = {
    pending: 'لم تبدأ', in_progress: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة', delayed: 'متأخرة',
  };

  // 5) بنود متأخرة
  const today = new Date().toISOString().split('T')[0];
  const delayedItems = (planItems || []).filter((i: any) => i.status !== 'completed' && i.due_date && i.due_date < today);

  // 6) توزيع الجاهزية
  const readinessMap: Record<string, number> = {};
  (cards || []).forEach((c: any) => { readinessMap[c.readiness_level] = (readinessMap[c.readiness_level] || 0) + 1; });
  const totalCards = (cards || []).length || 1;

  return (
    <div dir="rtl">
      <PageHeader
        title="تقارير التطوير"
        description="لوحة تحليلية شاملة: الفجوات الأكثر تكراراً، أداء المحاور، حالة الخطط، وبنود التطوير المتأخرة."
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* أكثر الفجوات تكراراً */}
        <Card title="أكثر الفجوات التطويرية تكراراً">
          {topGaps.length === 0 ? (
            <p className="text-sm text-darkgray">لا توجد بيانات.</p>
          ) : (
            <div className="space-y-2.5">
              {topGaps.map(([gap, count], idx) => (
                <div key={gap}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray flex items-center gap-1">
                      <span className="text-wine font-bold text-sm">{idx + 1}.</span> {gap}
                    </span>
                    <span className="font-bold text-wine">{count} مرشح</span>
                  </div>
                  <div className="h-2 bg-rose-50 rounded-full overflow-hidden">
                    <div className="h-full bg-wine rounded-full" style={{ width: `${(count / maxGap) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* متوسط المحاور */}
        <Card title="متوسط أداء المحاور (الأضعف أولاً)">
          {axisAvgs.length === 0 ? (
            <p className="text-sm text-darkgray">لا توجد بيانات.</p>
          ) : (
            <div className="space-y-2.5">
              {axisAvgs.map(({ axis, avg }) => (
                <div key={axis}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray">{AXIS_LABELS[axis] || axis}</span>
                    <span className={`font-bold ${avg >= 70 ? 'text-sage' : avg >= 55 ? 'text-gold-700' : 'text-wine'}`}>{avg}%</span>
                  </div>
                  <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${avg >= 70 ? 'bg-sage' : avg >= 55 ? 'bg-gold-500' : 'bg-wine'}`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* حالة خطط التطوير */}
        <Card title="توزيع خطط التطوير حسب الحالة">
          <div className="flex items-center gap-2 text-xs text-darkgray mb-3">
            <Target className="h-4 w-4 text-primary-600" />
            إجمالي الخطط: {totalPlans === 1 && Object.keys(planStatusMap).length === 0 ? 0 : totalPlans}
          </div>
          {Object.keys(planStatusMap).length === 0 ? (
            <p className="text-sm text-darkgray">لا توجد خطط تطوير بعد.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(planStatusMap).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray">{planStatusLabels[status] || status}</span>
                    <span className="font-bold text-primary-700">{count} ({Math.round((count / totalPlans) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${planStatusColors[status] || 'bg-primary-400'}`}
                      style={{ width: `${(count / totalPlans) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* توزيع الجاهزية */}
        <Card title="توزيع مستويات الجاهزية القيادية">
          <div className="flex items-center gap-2 text-xs text-darkgray mb-3">
            <Brain className="h-4 w-4 text-gold-600" />
            إجمالي البطاقات: {(cards || []).length}
          </div>
          {(cards || []).length === 0 ? (
            <p className="text-sm text-darkgray">لا توجد بطاقات قيادية بعد.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(readinessMap).map(([level, count]) => (
                <div key={level}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray">{READINESS_LABELS[level] || level}</span>
                    <span className="font-bold text-primary-700">{count} ({Math.round((count / totalCards) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(count / totalCards) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* بنود الخطط */}
        <Card title="حالة بنود خطط التطوير">
          {Object.keys(itemStatusMap).length === 0 ? (
            <p className="text-sm text-darkgray">لا توجد بنود تطوير بعد.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(itemStatusMap).map(([status, count]) => (
                <div key={status} className="p-3 bg-gold-50 rounded-xl border border-gold-100 text-center">
                  <div className="text-xl font-bold text-primary-700">{count}</div>
                  <div className="text-xs text-darkgray">{itemStatusLabels[status] || status}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* البنود المتأخرة */}
        {delayedItems.length > 0 && (
          <Card title="بنود تطوير متأخرة" className="md:col-span-2 bg-rose-50 border-rose-200">
            <div className="flex items-center gap-2 text-sm text-wine mb-3">
              <AlertTriangle className="h-4 w-4" />
              {delayedItems.length} بند تجاوز موعده — يحتاج مراجعة
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {delayedItems.slice(0, 9).map((item: any, i) => (
                <div key={i} className="p-3 bg-white border border-rose-200 rounded-xl text-xs">
                  <div className="font-medium text-primary-700 mb-1">{item.title}</div>
                  <div className="text-darkgray">الفئة: {item.category}</div>
                  <div className="text-wine">موعد الاستحقاق: {item.due_date}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
