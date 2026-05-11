import Link from 'next/link';
import { Users, ArrowLeft, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export default async function ExecutiveCandidatesPage() {
  const supabase = createClient();
  const { data: cards } = await supabase
    .from('leadership_cards')
    .select('id, total_score, trust_score, readiness_level, leadership_type, primary_strengths, candidate_profiles(user_id, users(full_name, job_title, department))')
    .eq('is_published', true)
    .order('total_score', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المرشحون"
        description="جميع المرشحين الذين اعتمدت لجنة الحوكمة بطاقاتهم القيادية. الترتيب بالدرجة الكلية."
        example="انقر على أي مرشح لرؤية بطاقته الكاملة: نقاط القوة، الفجوات، الملاءمة التنظيمية، التوصية."
        icon={Users}
      />

      {cards && cards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            type CardWithUser = {
              candidate_profiles: {
                user_id: string;
                users: { full_name: string; job_title?: string; department?: string };
              };
            };
            const cwu = card as unknown as CardWithUser;
            const user = cwu.candidate_profiles?.users;
            if (!user) return null;
            const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
            const strengths = (card.primary_strengths as string[] | null) || [];
            return (
              <Link
                key={card.id}
                href={`/executive/cards/${card.id}`}
                className="institutional-card p-5 hover:border-gold-400 transition group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary-700 truncate">{user.full_name}</div>
                    <div className="text-xs text-darkgray truncate">{user.job_title}</div>
                    <div className="text-xs text-darkgray truncate">{user.department}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gold-50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-gold-700">{Number(card.total_score).toFixed(0)}%</div>
                    <div className="text-[10px] text-darkgray">الجاهزية</div>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-primary-700">{Number(card.trust_score).toFixed(0)}%</div>
                    <div className="text-[10px] text-darkgray">الثقة</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {level && (
                    <span className={`text-xs px-2 py-0.5 rounded ${level.bg} ${level.color}`}>
                      {level.label_ar}
                    </span>
                  )}
                  {card.leadership_type === 'hidden' && (
                    <Badge variant="primary">قيادة مخفية</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold-100">
                  <div className="text-xs text-darkgray">
                    {strengths.slice(0, 2).join(' · ')}
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gold-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="لا توجد بطاقات معتمدة"
          description="ستظهر البطاقات هنا فور اعتماد لجنة الحوكمة."
        />
      )}
    </div>
  );
}
