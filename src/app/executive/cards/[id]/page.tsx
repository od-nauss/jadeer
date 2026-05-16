import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, ArrowRight, Star, Target, CheckCircle2, TrendingUp, Users, Brain } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { READINESS_LEVELS, leadershipTypeLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const AXIS_LABELS: Record<string, string> = {
  leadership:  'القيادة والتأثير',
  strategic:   'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز',
  innovation:  'الابتكار والمبادرات',
  team:        'رضا الفريق',
  technology:  'استخدام التقنية',
  integrity:   'النزاهة والحوكمة',
};

const AXIS_COLORS = [
  'bg-gold-500', 'bg-primary-600', 'bg-emerald-500',
  'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-rose-500',
];

export default async function LeadershipCardDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient();

  const [{ data: card }, { data: fitScores }] = await Promise.all([
    supabase
      .from('leadership_cards')
      .select('*, candidate_profiles!inner(user_id, users!inner(full_name, job_title, department, employee_number))')
      .eq('id', params.id)
      .single(),
    supabase
      .from('position_fit_scores')
      .select('fit_score, fit_level, organization_units(name)')
      .order('fit_score', { ascending: false })
      .limit(5),
  ]);

  if (!card) notFound();

  type CardWithUser = { candidate_profiles: { users: { full_name: string; job_title?: string; department?: string; employee_number?: string } } };
  const user = (card as unknown as CardWithUser).candidate_profiles?.users;
  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];

  // ─── الأعمدة الصحيحة من السكيما ───────────────────────────────────────────
  const strengths: string[]              = (card.strengths_json   as string[] | null) || [];
  const gaps: string[]                   = (card.gaps_json        as string[] | null) || [];
  const axisScores: Record<string, number> = (card.axis_scores_json as Record<string, number> | null) || {};
  const totalScore  = Number(card.total_score  || card.readiness_score  || 0);
  const trustScore  = Number(card.trust_score  || card.confidence_score || 0);
  const aiSummary   = (card as any).ai_summary || (card as any).governance_summary || '';

  // ترتيب المحاور
  const axisOrder = ['leadership', 'strategic', 'performance', 'innovation', 'team', 'technology', 'integrity'];
  const orderedAxes = axisOrder.filter(k => axisScores[k] !== undefined)
    .map(k => ({ key: k, label: AXIS_LABELS[k] || k, score: Number(axisScores[k]) }));

  // إذا لم يكن في الترتيب المحدد
  const remaining = Object.entries(axisScores)
    .filter(([k]) => !axisOrder.includes(k))
    .map(([k, v]) => ({ key: k, label: AXIS_LABELS[k] || k, score: Number(v) }));

  const allAxes = [...orderedAxes, ...remaining];

  return (
    <div dir="rtl">
      {/* زر العودة */}
      <Link href="/executive/cards" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowRight className="h-4 w-4" />
        العودة للبطاقات
      </Link>

      {/* ─── رأس البطاقة ─── */}
      <div className="bg-gradient-to-l from-primary-700 to-primary-900 text-white rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gold-500 flex items-center justify-center text-primary-900 font-bold text-2xl flex-shrink-0">
              {user?.full_name?.charAt(0) || '؟'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.full_name || 'مرشح'}</h1>
              <p className="text-gold-200">{user?.job_title}{user?.department && ` · ${user.department}`}</p>
              {user?.employee_number && <p className="text-xs text-gold-200/70 mt-1">رقم الموظف: {user.employee_number}</p>}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">{totalScore.toFixed(0)}</div>
              <div className="text-xs text-gold-200">درجة الجاهزية</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-300">{trustScore.toFixed(0)}%</div>
              <div className="text-xs text-gold-200">مستوى الثقة</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gold-500/30">
          {level && <span className={`px-3 py-1 rounded-lg text-sm font-bold ${level.bg} ${level.color}`}>{level.label_ar}</span>}
          <span className="px-3 py-1 rounded-lg bg-gold-500/20 border border-gold-400/40 text-gold-100 text-sm">
            {leadershipTypeLabel(card.leadership_type)}
          </span>
          <Badge variant={card.is_published ? 'sage' : 'gold'}>
            {card.is_published ? 'منشورة للقيادة' : 'قيد المراجعة'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ─── العمود الرئيسي ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ملخص الذكاء الاصطناعي */}
          {aiSummary && (
            <Card title="ملخص الذكاء الاصطناعي" subtitle="تقييم محرك التحليل">
              <div className="bg-primary-50 border-r-4 border-primary-500 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <p className="text-darkgray leading-loose text-sm">{aiSummary}</p>
                </div>
              </div>
            </Card>
          )}

          {/* ─── المحاور السبعة — مخططات بيانية ─── */}
          <Card title="المحاور السبعة" subtitle="درجة المرشح في كل محور من 100">
            {allAxes.length > 0 ? (
              <div className="space-y-4">
                {allAxes.map(({ key, label, score }, i) => {
                  const barColor = score >= 85 ? 'bg-sage' : score >= 70 ? 'bg-primary-600' : score >= 55 ? 'bg-gold-500' : 'bg-rose-400';
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${AXIS_COLORS[i % AXIS_COLORS.length]} flex-shrink-0`} />
                          <span className="text-sm font-medium text-primary-700">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${score >= 85 ? 'text-sage' : score >= 70 ? 'text-primary-700' : 'text-gold-700'}`}>
                            {score.toFixed(0)}
                          </span>
                          <span className="text-xs text-darkgray">/100</span>
                        </div>
                      </div>
                      <div className="relative h-4 bg-gold-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          {score >= 60 && <span className="text-[10px] text-white font-bold">{score.toFixed(0)}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* مقياس المرجع */}
                <div className="flex items-center gap-4 pt-2 border-t border-gold-100 text-xs text-darkgray">
                  <div className="flex items-center gap-1"><div className="h-2.5 w-5 rounded bg-sage" />85+ ممتاز</div>
                  <div className="flex items-center gap-1"><div className="h-2.5 w-5 rounded bg-primary-600" />70-84 جيد</div>
                  <div className="flex items-center gap-1"><div className="h-2.5 w-5 rounded bg-gold-500" />55-69 متوسط</div>
                  <div className="flex items-center gap-1"><div className="h-2.5 w-5 rounded bg-rose-400" />أقل من 55</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-darkgray">درجات المحاور ستُعرض بعد اكتمال التقييم.</p>
            )}
          </Card>

          {/* نقاط القوة والفجوات */}
          <div className="grid md:grid-cols-2 gap-5">
            <Card title="نقاط القوة" subtitle="المميزات التي تميّز المرشح">
              {strengths.length > 0 ? (
                <ul className="space-y-2.5">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-sage/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="h-3 w-3 text-sage" />
                      </div>
                      <span className="text-sm text-darkgray leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-darkgray">لم يتم تحديد نقاط القوة بعد.</p>
              )}
            </Card>

            <Card title="مجالات التطوير" subtitle="ما يحتاج تطويراً">
              {gaps.length > 0 ? (
                <ul className="space-y-2.5">
                  {gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="h-3 w-3 text-amber-600" />
                      </div>
                      <span className="text-sm text-darkgray leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-darkgray">لم يتم تحديد مجالات التطوير بعد.</p>
              )}
            </Card>
          </div>
        </div>

        {/* ─── العمود الجانبي ─── */}
        <div className="space-y-5">

          {/* ملخص الأرقام */}
          <Card title="ملخص الأرقام">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'درجة الجاهزية', value: `${totalScore.toFixed(0)}%`, color: 'text-primary-700' },
                { label: 'مستوى الثقة', value: `${trustScore.toFixed(0)}%`, color: 'text-gold-700' },
                { label: 'نوع القيادة', value: leadershipTypeLabel(card.leadership_type), color: 'text-primary-600' },
                { label: 'مستوى الجاهزية', value: level?.label_ar || card.readiness_level, color: level?.color?.split(' ')[0] || 'text-darkgray' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-center">
                  <div className={`font-bold text-base ${color}`}>{value}</div>
                  <div className="text-xs text-darkgray mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* الملاءمة التنظيمية من position_fit_scores */}
          {fitScores && fitScores.length > 0 && (
            <Card title="الملاءمة التنظيمية" subtitle="أفضل الوحدات المناسبة">
              <div className="space-y-3">
                {fitScores.map((fs: any, i: number) => {
                  const unitName = fs.organization_units?.name || 'وحدة تنظيمية';
                  const fitLevel = fs.fit_level;
                  const score = Number(fs.fit_score);
                  const color = score >= 85 ? 'bg-sage' : score >= 70 ? 'bg-primary-600' : 'bg-gold-500';
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-darkgray font-medium">{unitName}</span>
                        <span className="font-bold text-primary-700">{score.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* مصادر التحقق */}
          <Card title="مصادر التحقق">
            <ul className="space-y-2 text-sm">
              {['الملف القيادي', 'المبادرات والإنجازات', 'مؤشرات الأداء', 'الاختبارات الذكية', 'تقييم 360°', 'قرار لجنة الحوكمة'].map(src => (
                <li key={src} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0" />
                  <span className="text-darkgray">{src}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* قرار اللجنة */}
          <Card title="قرار اللجنة">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-darkgray">تاريخ الاعتماد</span>
                <span className="font-medium text-primary-700">
                  {card.approved_at ? new Date(card.approved_at).toLocaleDateString('ar-SA') : 'قيد المراجعة'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-darkgray">حالة البطاقة</span>
                <Badge variant={card.is_published ? 'sage' : 'gold'}>
                  {card.is_published ? 'معتمدة ومنشورة' : 'قيد المراجعة'}
                </Badge>
              </div>
              {card.is_published && (
                <div className="mt-3 p-3 bg-sage/10 border border-sage/20 rounded-xl text-xs text-sage font-medium text-center">
                  ✓ معتمدة من لجنة الحوكمة
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
