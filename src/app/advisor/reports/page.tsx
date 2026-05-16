import { ScrollText, TrendingUp, Users, Award, AlertTriangle, Target, Brain } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card } from '@/components/ui';
import { READINESS_LEVELS, leadershipTypeLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز', innovation: 'الابتكار والمبادرات',
  team: 'رضا الفريق', technology: 'استخدام التقنية', integrity: 'النزاهة',
};

export default async function AdvisorReportsPage() {
  const svc = createServiceClient();

  const [{ data: cards }, { data: units }] = await Promise.all([
    svc.from('leadership_cards')
      .select('id, total_score, trust_score, readiness_level, leadership_type, strengths_json, gaps_json, axis_scores_json, candidate_profiles(users(full_name, job_title, department))')
      .eq('is_published', true)
      .order('total_score', { ascending: false }),
    svc.from('organization_units')
      .select('id, name, unit_type, is_critical, has_vacancy, needs_successor')
      .eq('is_critical', true),
  ]);

  const published = cards || [];
  const totalCards = published.length;

  // توزيع الجاهزية
  const readinessDistrib: Record<string, number> = {};
  published.forEach(c => { readinessDistrib[c.readiness_level || 'unknown'] = (readinessDistrib[c.readiness_level || 'unknown'] || 0) + 1; });

  // توزيع الأنماط القيادية
  const typeDistrib: Record<string, number> = {};
  published.forEach(c => { typeDistrib[c.leadership_type || 'other'] = (typeDistrib[c.leadership_type || 'other'] || 0) + 1; });

  // متوسط المحاور
  const axisTotal: Record<string, number[]> = {};
  published.forEach(c => {
    const scores = (c.axis_scores_json as Record<string, number> | null) || {};
    Object.entries(scores).forEach(([k, v]) => {
      if (!axisTotal[k]) axisTotal[k] = [];
      axisTotal[k].push(Number(v));
    });
  });
  const axisAvgs = Object.entries(axisTotal)
    .map(([axis, vals]) => ({ axis, avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }))
    .sort((a, b) => b.avg - a.avg);

  // أكثر الفجوات تكراراً
  const gapFreq: Record<string, number> = {};
  published.forEach(c => {
    ((c.gaps_json as string[]) || []).forEach(g => { gapFreq[g] = (gapFreq[g] || 0) + 1; });
  });
  const topGaps = Object.entries(gapFreq).sort(([, a], [, b]) => b - a).slice(0, 6);

  // أبرز نقاط القوة
  const strengthFreq: Record<string, number> = {};
  published.forEach(c => {
    ((c.strengths_json as string[]) || []).forEach(s => { strengthFreq[s] = (strengthFreq[s] || 0) + 1; });
  });
  const topStrengths = Object.entries(strengthFreq).sort(([, a], [, b]) => b - a).slice(0, 5);

  // الجاهزون الآن
  const readyNow = published.filter(c => c.readiness_level === 'ready_now');
  const avgScore = totalCards > 0 ? Math.round(published.reduce((s, c) => s + Number(c.total_score || 0), 0) / totalCards) : 0;
  const avgTrust = totalCards > 0 ? Math.round(published.reduce((s, c) => s + Number(c.trust_score || 0), 0) / totalCards) : 0;

  // وحدات حرجة بلا مرشح جاهز
  const criticalNoCandidate = (units || []).filter(u => u.has_vacancy || u.needs_successor);

  type CardRow = { candidate_profiles: { users: { full_name: string; job_title?: string; department?: string } } };

  return (
    <div dir="rtl">
      <PageHeader
        title="التقارير الاستشارية"
        description="تحليل شامل للبطاقات القيادية المعتمدة. هذه البيانات للاطلاع الاستشاري فقط."
        icon={<ScrollText className="h-5 w-5" />}
      />

      {totalCards === 0 ? (
        <div className="institutional-card p-10 text-center">
          <Award className="h-12 w-12 text-gold-400 mx-auto mb-3" />
          <p className="text-primary-700 font-bold">لا توجد بطاقات معتمدة بعد</p>
          <p className="text-sm text-darkgray mt-1">ستظهر التقارير تلقائياً بعد اعتماد لجنة الحوكمة للبطاقات.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* إحصاءات المستوى الأعلى */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'إجمالي البطاقات', val: totalCards, icon: Award, color: 'text-primary-700', bg: 'bg-primary-50 border-primary-100' },
              { label: 'جاهز الآن', val: readyNow.length, icon: Users, color: 'text-sage', bg: 'bg-green-50 border-green-100' },
              { label: 'متوسط الجاهزية', val: `${avgScore}٪`, icon: TrendingUp, color: 'text-gold-700', bg: 'bg-gold-50 border-gold-100' },
              { label: 'متوسط الثقة', val: `${avgTrust}٪`, icon: Target, color: 'text-steelblue', bg: 'bg-blue-50 border-blue-100' },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} border rounded-xl p-4`}>
                <Icon className={`h-5 w-5 ${color} mb-2`} />
                <div className={`text-2xl font-bold ${color}`}>{val}</div>
                <div className="text-xs text-darkgray mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* الجاهزون الآن */}
            <Card title="المرشحون الجاهزون للتكليف الآن">
              {readyNow.length === 0 ? (
                <p className="text-sm text-darkgray">لا يوجد مرشحون جاهزون حالياً.</p>
              ) : (
                <div className="space-y-3">
                  {(readyNow as unknown as (typeof readyNow[0] & CardRow)[]).map(c => {
                    const u = c.candidate_profiles?.users;
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-sage flex items-center justify-center text-white font-bold flex-shrink-0">
                          {u?.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-primary-700 truncate">{u?.full_name}</div>
                          <div className="text-xs text-darkgray">{u?.job_title} · {u?.department}</div>
                        </div>
                        <div className="text-xl font-bold text-sage">{Number(c.total_score).toFixed(0)}٪</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* توزيع الجاهزية */}
            <Card title="توزيع مستويات الجاهزية">
              <div className="space-y-3">
                {Object.entries(readinessDistrib).map(([level, count]) => {
                  const info = READINESS_LEVELS[level as keyof typeof READINESS_LEVELS];
                  const pct = Math.round((count / totalCards) * 100);
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-medium ${info?.color || 'text-darkgray'}`}>{info?.label_ar || level}</span>
                        <span className="font-bold text-primary-700">{count} ({pct}٪)</span>
                      </div>
                      <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${info?.bg?.replace('bg-', 'bg-') || 'bg-primary-400'}`}
                          style={{ width: `${pct}%`, backgroundColor: info ? undefined : '#a0a0a0' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* الأنماط القيادية */}
            <Card title="توزيع الأنماط القيادية">
              <div className="space-y-2">
                {Object.entries(typeDistrib)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2.5 bg-gold-50 rounded-xl">
                      <span className="text-sm text-primary-700 font-medium">{leadershipTypeLabel(type)}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: count }).map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-primary-700">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* متوسط المحاور */}
            <Card title="متوسط المحاور السبعة">
              <div className="space-y-2.5">
                {axisAvgs.map(({ axis, avg }) => (
                  <div key={axis}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-darkgray">{AXIS_LABELS[axis] || axis}</span>
                      <span className={`font-bold ${avg >= 80 ? 'text-sage' : avg >= 65 ? 'text-primary-700' : 'text-gold-700'}`}>{avg}٪</span>
                    </div>
                    <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${avg >= 80 ? 'bg-sage' : avg >= 65 ? 'bg-primary-600' : 'bg-gold-500'}`}
                        style={{ width: `${avg}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* أبرز نقاط القوة */}
            <Card title="أبرز نقاط القوة المشتركة">
              <div className="space-y-2">
                {topStrengths.length === 0 ? (
                  <p className="text-sm text-darkgray">لا توجد بيانات.</p>
                ) : topStrengths.map(([strength, count], i) => (
                  <div key={strength} className="flex items-center gap-3 p-2.5 bg-green-50 border border-green-100 rounded-xl">
                    <span className="text-lg font-bold text-sage w-6 text-center">{i + 1}</span>
                    <span className="text-sm text-primary-700 flex-1">{strength}</span>
                    <span className="text-xs font-bold text-sage bg-green-100 px-2 py-0.5 rounded-lg">{count} مرشح</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* أبرز الفجوات */}
            <Card title="أبرز الفجوات التطويرية المشتركة">
              <div className="space-y-2">
                {topGaps.length === 0 ? (
                  <p className="text-sm text-darkgray">لا توجد بيانات.</p>
                ) : topGaps.map(([gap, count], i) => (
                  <div key={gap} className="flex items-center gap-3 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="text-lg font-bold text-amber-700 w-6 text-center">{i + 1}</span>
                    <span className="text-sm text-primary-700 flex-1">{gap}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">{count} مرشح</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* وحدات حرجة */}
          {criticalNoCandidate.length > 0 && (
            <Card title="وحدات تنظيمية حرجة تحتاج خلافة قيادية" className="bg-rose-50 border-rose-200">
              <div className="flex items-start gap-2 mb-4 text-sm text-wine">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{criticalNoCandidate.length} وحدة حرجة تحتاج خلافة قيادية — يُوصى بمتابعة عاجلة.</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {criticalNoCandidate.slice(0, 6).map(u => (
                  <div key={u.id} className="p-3 bg-white border border-rose-200 rounded-xl">
                    <div className="font-medium text-primary-700 text-sm">{u.name}</div>
                    <div className="text-xs text-darkgray mt-0.5">{u.unit_type}</div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {u.has_vacancy && <span className="text-[10px] bg-rose-100 text-wine px-1.5 py-0.5 rounded">شاغر</span>}
                      {u.needs_successor && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">يحتاج خليفة</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* توصية ذكية */}
          <Card title="التوصية الاستشارية الإجمالية" className="bg-primary-50 border-primary-200">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-800 leading-relaxed">
                {readyNow.length > 0
                  ? `يوجد ${readyNow.length} مرشح جاهز للتكليف القيادي الفوري. المتوسط العام ${avgScore}٪ يشير إلى ${avgScore >= 75 ? 'جاهزية قيادية جيدة على مستوى المنظمة.' : 'حاجة لتكثيف برامج التطوير القيادي.'}`
                  : `المتوسط العام ${avgScore}٪. لا يوجد حالياً مرشحون جاهزون للتكليف الفوري — يُوصى بمراجعة برامج التطوير وتكثيفها للمرشحين الواعدين.`
                }
                {topGaps.length > 0 && ` أبرز الفجوات المشتركة: ${topGaps.slice(0, 2).map(([g]) => g).join('، ')}.`}
              </p>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}
