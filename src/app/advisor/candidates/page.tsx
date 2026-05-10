import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export default async function AdvisorCandidatesPage() {
  const supabase = createClient();
  const { data: cards } = await supabase
    .from('leadership_cards')
    .select('id, total_score, trust_score, readiness_level, leadership_type, candidate_profiles(users(full_name, job_title, department))')
    .eq('is_published', true)
    .order('total_score', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المرشحون"
        description="جميع المرشحين بالبطاقات المعتمدة. للقراءة فقط."
        icon={Users}
      />

      {cards && cards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            type Row = { candidate_profiles: { users: { full_name: string; job_title?: string; department?: string } } };
            const r = card as unknown as Row;
            const user = r.candidate_profiles?.users;
            if (!user) return null;
            const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
            return (
              <Link
                key={card.id}
                href={`/advisor/cards/${card.id}`}
                className="institutional-card p-5 hover:border-gold-400 transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary-700">{user.full_name}</div>
                    <div className="text-xs text-darkgray">{user.job_title}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-2xl font-bold text-gold-700">{Number(card.total_score).toFixed(0)}%</span>
                  {level && (
                    <span className={`text-xs px-2 py-0.5 rounded ${level.bg} ${level.color}`}>
                      {level.label_ar}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="لا توجد بطاقات" description="ستظهر البطاقات بعد اعتماد اللجنة." />
      )}
    </div>
  );
}
