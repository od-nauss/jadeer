import Link from 'next/link';
import { TrendingUp, ArrowLeft, Award, AlertTriangle, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function ExecutiveRecommendationsPage() {
  const supabase = createClient();

  // مرشحون جاهزون الآن
  const { data: readyNow } = await supabase
    .from('leadership_cards')
    .select('id, total_score, candidate_profiles(users(full_name, job_title))')
    .eq('readiness_level', 'ready_now')
    .order('total_score', { ascending: false })
    .limit(5);

  // قيادات مخفية
  const { data: hidden } = await supabase
    .from('leadership_cards')
    .select('id, total_score, candidate_profiles(users(full_name, job_title))')
    .eq('leadership_type', 'hidden')
    .order('total_score', { ascending: false })
    .limit(5);

  // إنجاز عالٍ ورضا منخفض
  const { data: lowSat } = await supabase
    .from('leadership_cards')
    .select('id, total_score, candidate_profiles(users(full_name, job_title))')
    .eq('readiness_level', 'high_performance_low_satisfaction')
    .order('total_score', { ascending: false })
    .limit(5);

  type Section = {
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    cards: typeof readyNow;
  };

  const sections: Section[] = [
    {
      title: 'مرشحون جاهزون للتكليف الآن',
      desc: 'جاهزية 85%+ ومعتمدون من اللجنة',
      icon: Award,
      color: 'sage',
      cards: readyNow,
    },
    {
      title: 'قيادات مخفية يستحقّ اكتشافها',
      desc: 'كفاءات قيادية ظهرت دون منصب رسمي',
      icon: Eye,
      color: 'gold',
      cards: hidden,
    },
    {
      title: 'إنجاز عالٍ يحتاج تطويراً قياديّاً',
      desc: 'أداء قوي لكن رضا الفريق منخفض',
      icon: AlertTriangle,
      color: 'wine',
      cards: lowSat,
    },
  ];

  return (
    <div>
      <PageHeader
        title="توصيات النظام"
        description="ما تقترحه المنصة بناءً على تحليل البطاقات. هذه التوصيات أداة دعم قرار، ولا تستبدل القرار القيادي."
        icon={TrendingUp}
      />

      <div className="space-y-6">
        {sections.map((s, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                s.color === 'sage' ? 'bg-sage/15 text-sage' :
                s.color === 'gold' ? 'bg-gold-100 text-gold-700' :
                'bg-wine/15 text-wine'
              }`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-700">{s.title}</h3>
                <p className="text-xs text-darkgray">{s.desc}</p>
              </div>
            </div>

            {s.cards && s.cards.length > 0 ? (
              <div className="space-y-2">
                {s.cards.map((card) => {
                  type Row = { candidate_profiles: { users: { full_name: string; job_title?: string } } };
                  const r = card as unknown as Row;
                  return (
                    <Link
                      key={card.id}
                      href={`/executive/cards/${card.id}`}
                      className="flex items-center justify-between p-3 bg-gold-50 hover:bg-gold-100 rounded-lg transition"
                    >
                      <div>
                        <div className="font-medium text-primary-700 text-sm">
                          {r.candidate_profiles?.users?.full_name}
                        </div>
                        <div className="text-xs text-darkgray">
                          {r.candidate_profiles?.users?.job_title}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gold-700">
                          {Number(card.total_score).toFixed(0)}%
                        </span>
                        <ArrowLeft className="h-4 w-4 text-gold-600" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-darkgray text-sm">
                لا توجد توصيات في هذه الفئة حالياً.
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
