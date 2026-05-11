'use client';

import { useState, useCallback, useEffect } from 'react';
import { GitCompare, Plus, X, Brain, ArrowRight } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { READINESS_LEVELS } from '@/lib/utils';
import Link from 'next/link';

const AXIS_LABELS: Record<string, string> = {
  leadership: 'القيادة والتأثير', strategic: 'التفكير الاستراتيجي',
  performance: 'الأداء والإنجاز', innovation: 'الابتكار والمبادرات',
  team: 'رضا الفريق', technology: 'استخدام التقنية', integrity: 'النزاهة',
};

export default function ExecutiveComparePage() {
  const [allCards, setAllCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('leadership_cards')
      .select('id, total_score, trust_score, readiness_level, leadership_type, primary_strengths, development_gaps, axis_scores, candidate_profiles(id, users(full_name, job_title, department))')
      .eq('is_published', true)
      .order('total_score', { ascending: false });
    setAllCards(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleSelect(cardId: string) {
    setSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
      if (prev.length >= 4) return prev;
      return [...prev, cardId];
    });
  }

  useEffect(() => {
    setCompareData(allCards.filter(c => selected.includes(c.id)));
  }, [selected, allCards]);

  // تحليل مقارنة ذكي
  function generateAISummary(): string[] {
    if (compareData.length < 2) return [];
    const sorted = [...compareData].sort((a, b) => b.total_score - a.total_score);
    const insights: string[] = [];
    insights.push(`أعلى درجة جاهزية: ${sorted[0]?.candidate_profiles?.users?.full_name} (${Number(sorted[0]?.total_score).toFixed(0)}٪)`);
    const axes = Object.keys(AXIS_LABELS);
    for (const axis of axes) {
      const scores = compareData.map(c => ({ name: (c.candidate_profiles?.users?.full_name || '').split(' ')[0], val: (c.axis_scores as any)?.[axis] ?? 0 }));
      const maxScore = Math.max(...scores.map(s => s.val));
      const minScore = Math.min(...scores.map(s => s.val));
      if (maxScore - minScore > 20) {
        const leader = scores.find(s => s.val === maxScore);
        insights.push(`${leader?.name} أقوى في "${AXIS_LABELS[axis]}" (${maxScore}٪).`);
      }
    }
    const highLow = compareData.find(c => c.readiness_level === 'high_performance_low_satisfaction');
    if (highLow) insights.push(`تنبيه: ${(highLow.candidate_profiles?.users?.full_name || '').split(' ')[0]} أداؤه مرتفع لكن رضا فريقه منخفض.`);
    return insights.slice(0, 5);
  }

  const insights = compareData.length >= 2 ? generateAISummary() : [];

  return (
    <div dir="rtl">
      <PageHeader
        title="مقارنة المرشحين"
        description="اختر من 2 إلى 4 مرشحين لمقارنة جاهزيتهم القيادية جنباً إلى جنب."
        icon={<GitCompare className="h-5 w-5" />}
      />

      {/* اختيار المرشحين */}
      <Card title="اختر المرشحين للمقارنة (بحد أقصى 4)" className="mb-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gold-50 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {allCards.map(card => {
              const cu = card.candidate_profiles?.users;
              const isSelected = selected.includes(card.id);
              const isDisabled = !isSelected && selected.length >= 4;
              const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
              return (
                <button key={card.id} onClick={() => !isDisabled && toggleSelect(card.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                    isSelected ? 'bg-primary-700 text-white border-primary-700' :
                    isDisabled ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' :
                    'bg-white border-gold-200 text-primary-700 hover:border-gold-400'
                  }`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{cu?.full_name}</div>
                    <div className="text-xs opacity-70 truncate">{cu?.job_title}</div>
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${isSelected ? 'text-gold-300' : 'text-gold-700'}`}>
                    {Number(card.total_score).toFixed(0)}٪
                  </div>
                  {isSelected && <X className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* المقارنة */}
      {compareData.length >= 2 ? (
        <div className="space-y-5">
          {/* التحليل الذكي */}
          {insights.length > 0 && (
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-primary-700">
                <Brain className="h-4 w-4 text-gold-600" />التحليل الذكي للمقارنة
              </div>
              <ul className="space-y-1">
                {insights.map((ins, i) => <li key={i} className="text-sm text-primary-800 flex items-start gap-2"><span className="text-gold-600 flex-shrink-0">•</span>{ins}</li>)}
              </ul>
            </div>
          )}

          {/* جدول المقارنة */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-200">
                    <th className="py-2 px-3 text-right text-darkgray font-medium w-40">المؤشر</th>
                    {compareData.map(c => (
                      <th key={c.id} className="py-2 px-3 text-center font-bold text-primary-700">
                        {c.candidate_profiles?.users?.full_name?.split(' ').slice(0, 2).join(' ')}
                        <div className="text-xs text-darkgray font-normal">{c.candidate_profiles?.users?.job_title}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* الدرجات الأساسية */}
                  {[
                    { label: 'درجة الجاهزية', key: 'total_score', suffix: '٪' },
                    { label: 'مستوى الثقة', key: 'trust_score', suffix: '٪' },
                  ].map(({ label, key, suffix }) => (
                    <tr key={label} className="border-b border-gold-100">
                      <td className="py-2 px-3 text-darkgray font-medium">{label}</td>
                      {compareData.map(c => {
                        const val = Number(c[key] || 0);
                        const isMax = Math.max(...compareData.map(x => Number(x[key] || 0))) === val;
                        return (
                          <td key={c.id} className="py-2 px-3 text-center">
                            <span className={`text-xl font-bold ${isMax ? 'text-sage' : 'text-primary-700'}`}>
                              {val.toFixed(0)}{suffix}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* مستوى الجاهزية */}
                  <tr className="border-b border-gold-100">
                    <td className="py-2 px-3 text-darkgray font-medium">تصنيف الجاهزية</td>
                    {compareData.map(c => {
                      const level = READINESS_LEVELS[c.readiness_level as keyof typeof READINESS_LEVELS];
                      return <td key={c.id} className="py-2 px-3 text-center"><span className={`text-xs px-2 py-1 rounded-lg ${level?.bg || 'bg-gold-50'} ${level?.color || 'text-gold-700'}`}>{level?.label_ar || c.readiness_level}</span></td>;
                    })}
                  </tr>

                  {/* المحاور */}
                  {Object.entries(AXIS_LABELS).map(([axis, label]) => (
                    <tr key={axis} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-2 px-3 text-darkgray">{label}</td>
                      {compareData.map(c => {
                        const score = (c.axis_scores as any)?.[axis] ?? 0;
                        const scores = compareData.map(x => (x.axis_scores as any)?.[axis] ?? 0);
                        const isMax = Math.max(...scores) === score && score > 0;
                        const isMin = Math.min(...scores) === score && scores.filter(s => s > 0).length > 1;
                        return (
                          <td key={c.id} className="py-2 px-3 text-center">
                            <div className={`text-sm font-bold ${isMax ? 'text-sage' : isMin ? 'text-wine' : 'text-primary-700'}`}>
                              {score}٪
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* نقطة القوة الأولى */}
                  <tr className="border-b border-gold-100">
                    <td className="py-2 px-3 text-darkgray font-medium">أبرز قوة</td>
                    {compareData.map(c => {
                      const strengths = (c.primary_strengths as string[] | null) || [];
                      return <td key={c.id} className="py-2 px-3 text-center text-xs text-sage">{strengths[0] || '—'}</td>;
                    })}
                  </tr>

                  {/* الفجوة الأولى */}
                  <tr>
                    <td className="py-2 px-3 text-darkgray font-medium">أكبر فجوة</td>
                    {compareData.map(c => {
                      const gaps = (c.development_gaps as string[] | null) || [];
                      return <td key={c.id} className="py-2 px-3 text-center text-xs text-wine">{gaps[0] || '—'}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* روابط للبطاقات */}
          <div className="flex gap-3 flex-wrap">
            {compareData.map(c => (
              <Link key={c.id} href={`/executive/candidates/${c.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gold-300 rounded-xl text-sm text-primary-700 hover:bg-gold-50 transition">
                <ArrowRight className="h-3.5 w-3.5" />
                بطاقة {c.candidate_profiles?.users?.full_name?.split(' ').slice(0, 2).join(' ')}
              </Link>
            ))}
          </div>
        </div>
      ) : selected.length === 1 ? (
        <div className="text-center py-8 text-darkgray text-sm">اختر مرشحاً آخر للمقارنة.</div>
      ) : (
        <div className="text-center py-8 text-darkgray text-sm">اختر مرشحين اثنين على الأقل من القائمة أعلاه.</div>
      )}
    </div>
  );
}
