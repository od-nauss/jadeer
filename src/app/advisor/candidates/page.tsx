import Link from 'next/link';
import { Users, Star, TrendingUp, Award } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { READINESS_LEVELS, leadershipTypeLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة', strategic: 'الاستراتيجي',
  performance: 'الأداء', innovation: 'الابتكار',
  team: 'الفريق', technology: 'التقنية', integrity: 'النزاهة',
};

export default async function AdvisorCandidatesPage() {
  const svc = createServiceClient();

  const { data: cards } = await svc
    .from('leadership_cards')
    .select(`
      id, total_score, trust_score, readiness_level, leadership_type,
      strengths_json, gaps_json, axis_scores_json, ai_summary, is_published,
      candidate_profiles!inner(
        id, status,
        users!inner(full_name, job_title, department)
      )
    `)
    .eq('is_published', true)
    .order('total_score', { ascending: false });

  type CardRow = {
    candidate_profiles: { id: string; status: string; users: { full_name: string; job_title?: string; department?: string } };
  };

  return (
    <div dir="rtl">
      <PageHeader
        title="المرشحون القياديون"
        description="البطاقات القيادية المعتمدة لجميع المرشحين. للاطلاع والتحليل الاستشاري فقط — لا يمكن تعديل أي نتيجة."
        icon={<Users className="h-5 w-5" />}
      />

      {/* إحصاءات سريعة */}
      {cards && cards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'إجمالي البطاقات', val: cards.length, color: 'text-primary-700', bg: 'bg-primary-50' },
            { label: 'جاهز الآن', val: cards.filter(c => c.readiness_level === 'ready_now').length, color: 'text-sage', bg: 'bg-green-50' },
            { label: 'جاهز خلال سنة', val: cards.filter(c => c.readiness_level === 'ready_within_year').length, color: 'text-gold-700', bg: 'bg-gold-50' },
            { label: 'متوسط الجاهزية', val: `${Math.round(cards.reduce((s, c) => s + Number(c.total_score || 0), 0) / cards.length)}٪`, color: 'text-steelblue', bg: 'bg-blue-50' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-darkgray mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {(!cards || cards.length === 0) ? (
        <EmptyState
          icon={<Award className="h-10 w-10" />}
          title="لا توجد بطاقات معتمدة بعد"
          description="ستظهر البطاقات القيادية هنا بعد اعتمادها من لجنة الحوكمة."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(cards as unknown as (typeof cards[0] & CardRow)[]).map((card) => {
            const candidateUser = card.candidate_profiles?.users;
            if (!candidateUser) return null;
            const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
            const strengths = (card.strengths_json as string[] | null) || [];
            const gaps = (card.gaps_json as string[] | null) || [];
            const axisScores = (card.axis_scores_json as Record<string, number> | null) || {};
            const score = Number(card.total_score || 0);
            const scoreColor = score >= 80 ? 'text-sage' : score >= 65 ? 'text-primary-700' : 'text-gold-700';

            return (
              <Link
                key={card.id}
                href={`/advisor/cards/${card.id}`}
                className="institutional-card p-5 hover:border-gold-400 hover:shadow-md transition-all"
              >
                {/* رأس البطاقة */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {candidateUser.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary-700 truncate">{candidateUser.full_name}</div>
                    <div className="text-xs text-darkgray truncate">{candidateUser.job_title}</div>
                    <div className="text-xs text-darkgray/70">{candidateUser.department}</div>
                  </div>
                </div>

                {/* الدرجة والتصنيف */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className={`text-3xl font-bold ${scoreColor}`}>{score.toFixed(0)}</span>
                    <span className={`text-sm ${scoreColor}`}>٪</span>
                  </div>
                  <div className="text-left">
                    {level && (
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${level.bg} ${level.color}`}>
                        {level.label_ar}
                      </span>
                    )}
                    <div className="text-xs text-darkgray mt-1">{leadershipTypeLabel(card.leadership_type)}</div>
                  </div>
                </div>

                {/* شريط الجاهزية */}
                <div className="h-2 bg-gold-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${score >= 80 ? 'bg-sage' : score >= 65 ? 'bg-primary-600' : 'bg-gold-500'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* محاور مختصرة */}
                {Object.keys(axisScores).length > 0 && (
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {Object.entries(axisScores).slice(0, 3).map(([axis, val]) => (
                      <div key={axis} className="bg-gold-50 rounded-lg p-1.5 text-center">
                        <div className={`text-xs font-bold ${Number(val) >= 80 ? 'text-sage' : Number(val) >= 60 ? 'text-primary-600' : 'text-gold-700'}`}>
                          {Number(val).toFixed(0)}٪
                        </div>
                        <div className="text-[10px] text-darkgray">{AXIS_LABELS[axis] || axis}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* نقطة قوة واحدة */}
                {strengths.length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-darkgray">
                    <Star className="h-3 w-3 text-gold-500 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{strengths[0]}</span>
                  </div>
                )}

                {/* فجوة أولى */}
                {gaps.length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-darkgray mt-1">
                    <TrendingUp className="h-3 w-3 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{gaps[0]}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
