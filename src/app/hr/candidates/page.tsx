'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter, ArrowRight } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; variant: 'primary' | 'gold' | 'sage' | 'wine' }> = {
  new: { label: 'جديد', variant: 'gold' },
  in_progress: { label: 'قيد الاستكمال', variant: 'primary' },
  submitted: { label: 'مُقدَّم', variant: 'primary' },
  under_review: { label: 'تحت المراجعة', variant: 'gold' },
  approved: { label: 'معتمد', variant: 'sage' },
  rejected: { label: 'مرفوض', variant: 'wine' },
  returned_for_completion: { label: 'معاد للاستكمال', variant: 'wine' },
  awaiting_360: { label: 'في انتظار 360', variant: 'gold' },
  completed: { label: 'مكتمل', variant: 'sage' },
};

const READINESS_LABELS: Record<string, string> = {
  ready_now: 'جاهز الآن',
  ready_within_year: 'خلال سنة',
  promising: 'واعد',
  specialist: 'متخصص',
  not_suitable: 'غير مناسب حالياً',
  high_performance_low_satisfaction: 'أداء عالٍ/رضا منخفض',
  human_leader: 'قائد إنساني',
};

const TRACK_LABELS: Record<string, string> = {
  individual: 'فردي',
  competition: 'مسابقة',
  succession: 'تعاقب',
  development: 'تطوير',
};

export default function HRCandidatesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [completionFilter, setCompletionFilter] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('candidate_profiles')
      .select(`
        id, status, completion_score, evaluation_track, updated_at,
        users(full_name, job_title, department, email),
        leadership_cards(readiness_level, total_score, is_published)
      `)
      .order('updated_at', { ascending: false });
    setProfiles(data || []);
    setFiltered(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let result = [...profiles];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.users?.full_name || '').toLowerCase().includes(q) ||
        (p.users?.department || '').toLowerCase().includes(q) ||
        (p.users?.job_title || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (trackFilter) result = result.filter(p => p.evaluation_track === trackFilter);
    if (completionFilter === 'low') result = result.filter(p => (p.completion_score || 0) < 60);
    if (completionFilter === 'medium') result = result.filter(p => (p.completion_score || 0) >= 60 && (p.completion_score || 0) < 80);
    if (completionFilter === 'high') result = result.filter(p => (p.completion_score || 0) >= 80);
    if (readinessFilter) {
      result = result.filter(p => {
        const cards = Array.isArray(p.leadership_cards) ? p.leadership_cards : [p.leadership_cards];
        return cards.some((c: any) => c?.readiness_level === readinessFilter && c?.is_published);
      });
    }
    setFiltered(result);
  }, [search, statusFilter, trackFilter, completionFilter, readinessFilter, profiles]);

  const statuses = [...new Set(profiles.map(p => p.status).filter(Boolean))];

  return (
    <div dir="rtl">
      <PageHeader
        title="قائمة المتقدمين"
        description="جميع المرشحين مع إمكانية الفلترة حسب الحالة، المسار، نسبة الاكتمال، ومستوى الجاهزية."
        icon={<Users className="h-5 w-5" />}
      />

      {/* فلاتر */}
      <Card className="mb-5">
        <div className="grid md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-darkgray" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الإدارة..."
              className="w-full pr-9 pl-3 py-2 border border-gold-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="">كل الحالات</option>
            {statuses.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
            ))}
          </select>
          <select
            value={trackFilter}
            onChange={e => setTrackFilter(e.target.value)}
            className="border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="">كل المسارات</option>
            {Object.entries(TRACK_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={completionFilter}
            onChange={e => setCompletionFilter(e.target.value)}
            className="border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="">كل نسب الاكتمال</option>
            <option value="low">أقل من 60%</option>
            <option value="medium">60% – 79%</option>
            <option value="high">80% وأعلى</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-darkgray flex items-center gap-1"><Filter className="h-3 w-3" />جاهزية:</span>
          {Object.entries(READINESS_LABELS).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setReadinessFilter(readinessFilter === v ? '' : v)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition ${readinessFilter === v ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}
            >
              {l}
            </button>
          ))}
          {(search || statusFilter || trackFilter || completionFilter || readinessFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setTrackFilter(''); setCompletionFilter(''); setReadinessFilter(''); }}
              className="px-2.5 py-1 text-xs rounded-lg border border-rose-200 text-wine hover:bg-rose-50"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </Card>

      {/* النتائج */}
      <div className="text-xs text-darkgray mb-3 px-1">{filtered.length} مرشح</div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gold-50 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><div className="text-center py-8 text-darkgray text-sm">لا توجد نتائج مطابقة.</div></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-200 text-right">
                  <th className="py-3 px-3 font-semibold text-primary-700">المرشح</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الإدارة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">المسار</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الاكتمال</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الحالة</th>
                  <th className="py-3 px-3 font-semibold text-primary-700">الجاهزية</th>
                  <th className="py-3 px-3 font-semibold text-primary-700"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = STATUS_LABELS[p.status] || { label: p.status, variant: 'primary' as const };
                  const cards = Array.isArray(p.leadership_cards) ? p.leadership_cards : (p.leadership_cards ? [p.leadership_cards] : []);
                  const publishedCard = cards.find((c: any) => c?.is_published);
                  const score = p.completion_score || 0;
                  const barColor = score >= 80 ? 'bg-sage' : score >= 60 ? 'bg-gold-500' : 'bg-wine';
                  return (
                    <tr key={p.id} className="border-b border-gold-100 hover:bg-gold-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-primary-800">{p.users?.full_name}</div>
                        <div className="text-xs text-darkgray">{p.users?.job_title || '—'}</div>
                      </td>
                      <td className="py-3 px-3 text-darkgray text-xs">{p.users?.department || '—'}</td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-lg">
                          {TRACK_LABELS[p.evaluation_track || 'individual'] || 'فردي'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gold-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${score >= 80 ? 'text-sage' : score >= 60 ? 'text-gold-700' : 'text-wine'}`}>{score}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        {publishedCard ? (
                          <span className="text-xs text-primary-700">
                            {READINESS_LABELS[publishedCard.readiness_level] || publishedCard.readiness_level}
                            {publishedCard.total_score ? ` · ${Number(publishedCard.total_score).toFixed(0)}%` : ''}
                          </span>
                        ) : <span className="text-xs text-darkgray">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/hr/development-plans/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800"
                        >
                          <ArrowRight className="h-3 w-3" />خطة التطوير
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
