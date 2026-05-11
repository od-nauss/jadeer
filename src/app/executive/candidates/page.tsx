import Link from 'next/link';
import { Users, ArrowLeft, Filter, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const LEADERSHIP_LABELS: Record<string, string> = {
  strategic: 'استراتيجي', operational: 'تشغيلي', technical: 'تقني',
  human_leader: 'إنساني', hidden: 'مخفي', emerging: 'صاعد',
};

export default async function ExecutiveCandidatesPage({
  searchParams,
}: {
  searchParams: { level?: string; flag?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from('leadership_cards')
    .select('id, total_score, trust_score, readiness_level, leadership_type, primary_strengths, special_tags, candidate_profiles(id, users(full_name, job_title, department))')
    .eq('is_published', true)
    .order('total_score', { ascending: false });

  if (searchParams.level) query = query.eq('readiness_level', searchParams.level);
  if (searchParams.flag === 'hidden') query = query.eq('leadership_type', 'hidden');
  if (searchParams.flag === 'high_low') query = query.eq('readiness_level', 'high_performance_low_satisfaction');

  const { data: cards } = await query;

  const { data: allCards } = await supabase.from('leadership_cards').select('readiness_level').eq('is_published', true);
  const countByLevel: Record<string, number> = {};
  (allCards || []).forEach(c => { countByLevel[c.readiness_level] = (countByLevel[c.readiness_level] || 0) + 1; });

  const LEVEL_FILTERS = [
    { value: 'ready_now', label: 'جاهز الآن', active: 'bg-primary-700 text-white', inactive: 'bg-sage/10 text-sage border-sage/30' },
    { value: 'ready_within_year', label: 'خلال سنة', active: 'bg-primary-700 text-white', inactive: 'bg-gold-50 text-gold-700 border-gold-300' },
    { value: 'promising', label: 'واعد', active: 'bg-primary-700 text-white', inactive: 'bg-blue-50 text-steelblue border-blue-200' },
    { value: 'high_performance_low_satisfaction', label: 'أداء عالٍ/رضا منخفض', active: 'bg-primary-700 text-white', inactive: 'bg-rose-50 text-wine border-rose-200' },
  ];

  return (
    <div dir="rtl">
      <PageHeader
        title="قائمة المرشحين"
        description="جميع المرشحين بالبطاقات المعتمدة مرتبين حسب درجة الجاهزية."
        icon={<Users className="h-5 w-5" />}
      />

      <div className="mb-5 space-y-2">
        <div className="flex items-center gap-2 text-sm text-darkgray"><Filter className="h-4 w-4" />الفلاتر:</div>
        <div className="flex flex-wrap gap-2">
          {LEVEL_FILTERS.map(f => {
            const count = countByLevel[f.value] || 0;
            if (count === 0) return null;
            const isActive = searchParams.level === f.value;
            const params = new URLSearchParams();
            if (!isActive) params.set('level', f.value);
            return (
              <Link key={f.value} href={`/executive/candidates?${params.toString()}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition ${isActive ? f.active + ' border-transparent' : f.inactive}`}>
                {f.label} <span className="font-bold">{count}</span>
              </Link>
            );
          })}
          {(searchParams.level || searchParams.flag) && (
            <Link href="/executive/candidates" className="px-3 py-1.5 rounded-xl border border-gold-200 text-sm text-darkgray hover:bg-gold-50">× مسح</Link>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={searchParams.flag === 'hidden' ? '/executive/candidates' : '/executive/candidates?flag=hidden'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm ${searchParams.flag === 'hidden' ? 'bg-primary-700 text-white border-transparent' : 'border-gold-200 text-darkgray hover:bg-gold-50'}`}>
            <Eye className="h-3.5 w-3.5" />قيادات مخفية
          </Link>
        </div>
      </div>

      {(!cards || cards.length === 0) ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="لا توجد نتائج" description="لا توجد بطاقات تطابق الفلاتر المحددة." />
      ) : (
        <>
          <div className="mb-2 text-sm text-darkgray">{cards.length} مرشح</div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-200 text-right">
                    <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                    <th className="py-3 px-3 font-semibold text-primary-700">الدرجة</th>
                    <th className="py-3 px-3 font-semibold text-primary-700">الثقة</th>
                    <th className="py-3 px-3 font-semibold text-primary-700">تصنيف الجاهزية</th>
                    <th className="py-3 px-3 font-semibold text-primary-700">نوع القيادة</th>
                    <th className="py-3 px-3 font-semibold text-primary-700">أبرز قوة</th>
                    <th className="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => {
                    type Row = { candidate_profiles: { id: string; users: { full_name: string; job_title?: string; department?: string } } };
                    const r = card as unknown as Row;
                    const cu = r.candidate_profiles?.users;
                    if (!cu) return null;
                    const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
                    const strengths = (card.primary_strengths as string[] | null) || [];
                    const tags = (card.special_tags as string[] | null) || [];
                    return (
                      <tr key={card.id} className="border-b border-gold-100 hover:bg-gold-50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-primary-800">{cu.full_name}</div>
                          <div className="text-xs text-darkgray">{cu.job_title} · {cu.department}</div>
                          {tags.length > 0 && <div className="flex gap-1 mt-1">{tags.map(t => <span key={t} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">{t}</span>)}</div>}
                        </td>
                        <td className="py-3 px-3">
                          <div className={`text-xl font-bold ${Number(card.total_score) >= 80 ? 'text-sage' : Number(card.total_score) >= 65 ? 'text-gold-700' : 'text-wine'}`}>
                            {Number(card.total_score).toFixed(0)}٪
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm font-medium text-darkgray">{Number(card.trust_score || 0).toFixed(0)}٪</td>
                        <td className="py-3 px-3">{level && <span className={`text-xs px-2 py-1 rounded-lg ${level.bg} ${level.color}`}>{level.label_ar}</span>}</td>
                        <td className="py-3 px-3 text-sm text-darkgray">{LEADERSHIP_LABELS[card.leadership_type] || card.leadership_type}</td>
                        <td className="py-3 px-3 text-xs text-darkgray">{strengths[0] || '—'}</td>
                        <td className="py-3 px-3">
                          <Link href={`/executive/candidates/${card.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 whitespace-nowrap">
                            البطاقة <ArrowLeft className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
