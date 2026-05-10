import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Award,
  ArrowRight,
  Star,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Users,
  ScrollText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { READINESS_LEVELS, leadershipTypeLabel } from '@/lib/utils';

export default async function LeadershipCardDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: card } = await supabase
    .from('leadership_cards')
    .select(
      '*, candidate_profiles(user_id, users(full_name, job_title, department, employee_number))'
    )
    .eq('id', params.id)
    .single();

  if (!card) notFound();

  type CardData = {
    candidate_profiles: {
      users: {
        full_name: string;
        job_title?: string;
        department?: string;
        employee_number?: string;
      };
    };
  };
  const user = (card as unknown as CardData).candidate_profiles?.users;
  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
  const strengths = (card.primary_strengths as string[] | null) || [];
  const gaps = (card.development_gaps as string[] | null) || [];
  const axisScores = (card.axis_scores as Record<string, number> | null) || {};
  const fitMap = (card.organization_fit as Record<string, number> | null) || {};

  return (
    <div>
      <Link
        href="/advisor/cards"
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للبطاقات
      </Link>

      {/* رأس البطاقة */}
      <div className="bg-gradient-to-l from-primary-700 to-primary-800 text-white rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gold-500 flex items-center justify-center text-primary-900 font-bold text-2xl flex-shrink-0">
              {user?.full_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.full_name}</h1>
              <p className="text-gold-200">
                {user?.job_title} {user?.department && `· ${user.department}`}
              </p>
              {user?.employee_number && (
                <p className="text-xs text-gold-200/70 mt-1">رقم الموظف: {user.employee_number}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400">
                {Number(card.total_score).toFixed(0)}%
              </div>
              <div className="text-xs text-gold-200">الجاهزية</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400">
                {Number(card.trust_score).toFixed(0)}%
              </div>
              <div className="text-xs text-gold-200">مستوى الثقة</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gold-500/30">
          {level && (
            <span className={`px-3 py-1 rounded text-sm font-bold ${level.bg} ${level.color}`}>
              {level.label_ar}
            </span>
          )}
          <span className="px-3 py-1 rounded bg-gold-500/20 border border-gold-400/40 text-gold-100 text-sm">
            {leadershipTypeLabel(card.leadership_type)}
          </span>
          {card.is_hidden_leader && (
            <span className="px-3 py-1 rounded bg-purple-500/20 border border-purple-400/40 text-purple-200 text-sm">
              قيادة مخفية
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* العمود الرئيسي */}
        <div className="lg:col-span-2 space-y-5">
          {/* الملخص */}
          {card.executive_summary && (
            <Card title="الملخص التنفيذي" subtitle="مولّد بالذكاء الاصطناعي ومعتمَد من اللجنة">
              <p className="text-darkgray leading-loose">{card.executive_summary}</p>
            </Card>
          )}

          {/* المحاور السبعة */}
          <Card title="المحاور السبعة" subtitle="درجة المرشح في كل محور">
            <div className="space-y-3">
              {Object.entries(axisScores).length > 0 ? (
                Object.entries(axisScores).map(([axis, score]) => (
                  <div key={axis}>
                    <div className="flex justify-between mb-1.5 text-sm">
                      <span className="font-medium text-primary-700">{axis}</span>
                      <span className="font-bold text-gold-700">{Number(score).toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 bg-gold-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                        style={{ width: `${Number(score)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-darkgray">سيتم عرض درجات المحاور بعد اعتماد اللجنة.</div>
              )}
            </div>
          </Card>

          {/* نقاط القوة والفجوات */}
          <div className="grid md:grid-cols-2 gap-5">
            <Card title="نقاط القوة" subtitle="المميزات التي تميّز المرشح">
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />
                      <span className="text-darkgray">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-darkgray">لم يتم تحديد نقاط قوة بعد.</div>
              )}
            </Card>

            <Card title="فجوات التطوير" subtitle="ما يحتاج تطويراً قبل المرحلة التالية">
              {gaps.length > 0 ? (
                <ul className="space-y-2">
                  {gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-wine flex-shrink-0 mt-0.5" />
                      <span className="text-darkgray">{g}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-darkgray">لم يتم تحديد فجوات بعد.</div>
              )}
            </Card>
          </div>

          {/* التوصية */}
          {card.recommendation && (
            <Card title="التوصية" subtitle="ما تقترحه المنصة بناءً على البيانات">
              <div className="bg-gold-50 border-r-4 border-gold-500 p-4 rounded-lg">
                <p className="text-darkgray leading-loose">{card.recommendation}</p>
              </div>
            </Card>
          )}
        </div>

        {/* العمود الجانبي */}
        <div className="space-y-5">
          {/* الملاءمة التنظيمية */}
          {Object.keys(fitMap).length > 0 && (
            <Card title="الملاءمة التنظيمية">
              <div className="space-y-2.5">
                {Object.entries(fitMap)
                  .sort(([, a], [, b]) => Number(b) - Number(a))
                  .slice(0, 5)
                  .map(([unit, score]) => (
                    <div key={unit}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-darkgray">{unit}</span>
                        <span className="font-bold text-primary-700">{Number(score).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-gold-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600"
                          style={{ width: `${Number(score)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* مصادر التحقق */}
          <Card title="مصادر التحقق">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage" />
                <span className="text-darkgray">الملف القيادي</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage" />
                <span className="text-darkgray">المبادرات والإنجازات</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage" />
                <span className="text-darkgray">مؤشرات الأداء</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage" />
                <span className="text-darkgray">الاختبارات الذكية</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage" />
                <span className="text-darkgray">تقييم 360</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage" />
                <span className="text-darkgray">قرار لجنة الحوكمة</span>
              </li>
            </ul>
          </Card>

          {/* القرار */}
          <Card title="قرار اللجنة">
            <div className="text-sm space-y-2">
              <div>
                <span className="text-darkgray">تاريخ الاعتماد: </span>
                <span className="font-medium text-primary-700">
                  {card.approved_at
                    ? new Date(card.approved_at).toLocaleDateString('ar-SA')
                    : 'لم يُعتمد بعد'}
                </span>
              </div>
              <div>
                <span className="text-darkgray">حالة البطاقة: </span>
                <Badge variant={card.is_published ? 'sage' : 'gold'}>
                  {card.is_published ? 'منشورة للقيادة' : 'مسودة'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
