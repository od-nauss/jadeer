import Link from 'next/link';
import { Award, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export default async function GovernanceResultsPage() {
  const supabase = createClient();
  const { data: cards } = await supabase
    .from('leadership_cards')
    .select('*, candidate_profiles(users(full_name, job_title))')
    .eq('is_published', false)
    .order('total_score', { ascending: false });

  return (
    <div>
      <PageHeader
        title="اعتماد النتائج النهائية"
        description="بطاقات قيادية مولّدة بالذكاء الاصطناعي تنتظر اعتماد اللجنة. لا تُنشر للقيادة قبل الاعتماد."
        example="راجع البطاقة، عدّل التصنيف إذا رأت اللجنة ذلك ضرورياً، ووثّق سبب القرار قبل النشر."
        icon={Award}
      />

      {cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => {
            type Row = { candidate_profiles: { users: { full_name: string; job_title?: string } } };
            const r = card as unknown as Row;
            const user = r.candidate_profiles?.users;
            if (!user) return null;
            const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
            return (
              <Card key={card.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-primary-700">{user.full_name}</div>
                      <div className="text-xs text-darkgray">{user.job_title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gold-700">{Number(card.total_score).toFixed(0)}%</div>
                      <div className="text-xs text-darkgray">جاهزية</div>
                    </div>
                    {level && (
                      <span className={`text-xs px-2 py-1 rounded ${level.bg} ${level.color}`}>
                        {level.label_ar}
                      </span>
                    )}
                    <Badge variant="gold">بانتظار الاعتماد</Badge>
                    <Link
                      href={`/governance/results/${card.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-800 font-medium"
                    >
                      مراجعة <ArrowLeft className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Award} title="لا توجد بطاقات بانتظار الاعتماد" description="ستظهر البطاقات هنا فور اكتمال التحليل." />
      )}
    </div>
  );
}
