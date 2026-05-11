import { Route, Users, Trophy, GitBranch, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const TRACK_CONFIG: Record<string, { label: string; icon: string; description: string; color: string }> = {
  individual: { label: 'تقييم فردي', icon: '👤', description: 'تقييم مستقل لمرشح خارج أي مسابقة', color: 'border-primary-200 bg-primary-50' },
  competition: { label: 'مسابقة وظيفية', icon: '🏆', description: 'مرشح ضمن مسابقة لمنصب محدد', color: 'border-gold-200 bg-gold-50' },
  succession: { label: 'تعاقب وظيفي', icon: '🔄', description: 'مرشح لخلافة منصب قيادي حرج', color: 'border-amber-200 bg-amber-50' },
  development: { label: 'تطوير قيادي', icon: '📈', description: 'مسار تطوير بدون ارتباط بوظيفة محددة', color: 'border-sage/30 bg-sage/10' },
};

const STATUS_LABELS: Record<string, { label: string; variant: 'primary' | 'gold' | 'sage' | 'wine' }> = {
  new: { label: 'جديد', variant: 'gold' },
  in_progress: { label: 'قيد الاستكمال', variant: 'primary' },
  submitted: { label: 'مُقدَّم', variant: 'primary' },
  under_review: { label: 'تحت المراجعة', variant: 'gold' },
  approved: { label: 'معتمد', variant: 'sage' },
  returned_for_completion: { label: 'معاد للاستكمال', variant: 'wine' },
  awaiting_360: { label: 'في انتظار 360', variant: 'gold' },
  completed: { label: 'مكتمل', variant: 'sage' },
};

export default async function HREvaluationTracksPage() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, evaluation_track, completion_score, updated_at, users(full_name, job_title, department)')
    .order('evaluation_track', { ascending: true });

  // توزيع المرشحين على المسارات
  const byTrack: Record<string, any[]> = { individual: [], competition: [], succession: [], development: [] };
  (profiles || []).forEach(p => {
    const track = p.evaluation_track || 'individual';
    if (!byTrack[track]) byTrack[track] = [];
    byTrack[track].push(p);
  });

  const totalCount = (profiles || []).length;

  return (
    <div dir="rtl">
      <PageHeader
        title="مسارات التقييم"
        description="توزيع المرشحين على مسارات التقييم: فردي، مسابقة، تعاقب وظيفي، تطوير قيادي. كل مسار له متطلباته ومعاييره."
        example="مرشح في مسار التعاقب يحتاج بطاقة قيادية جاهزة قبل نهاية الربع القادم."
        icon={<Route className="h-5 w-5" />}
      />

      {/* ملخص توزيعي */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(TRACK_CONFIG).map(([key, cfg]) => {
          const count = byTrack[key]?.length || 0;
          const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return (
            <div key={key} className={`p-4 border rounded-xl ${cfg.color}`}>
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="text-xl font-bold text-primary-700">{count}</div>
              <div className="text-xs font-medium text-primary-700">{cfg.label}</div>
              <div className="text-xs text-darkgray">{pct}% من الإجمالي</div>
            </div>
          );
        })}
      </div>

      {/* المسارات التفصيلية */}
      <div className="space-y-6">
        {Object.entries(TRACK_CONFIG).map(([key, cfg]) => {
          const trackProfiles = byTrack[key] || [];
          if (trackProfiles.length === 0) return null;

          const avgCompletion = trackProfiles.length > 0
            ? Math.round(trackProfiles.reduce((s, p) => s + (p.completion_score || 0), 0) / trackProfiles.length)
            : 0;
          const approvedCount = trackProfiles.filter(p => p.status === 'approved' || p.status === 'completed').length;

          return (
            <Card key={key} className={`border ${cfg.color.split(' ')[0]}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cfg.icon}</span>
                  <div>
                    <h3 className="font-bold text-primary-700">{cfg.label}</h3>
                    <p className="text-xs text-darkgray">{cfg.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary-700">{avgCompletion}%</div>
                    <div className="text-xs text-darkgray">متوسط الاكتمال</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-sage">{approvedCount}</div>
                    <div className="text-xs text-darkgray">مكتملون/معتمدون</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold-200 text-right">
                      <th className="py-2 px-3 font-medium text-darkgray">المرشح</th>
                      <th className="py-2 px-3 font-medium text-darkgray">الإدارة</th>
                      <th className="py-2 px-3 font-medium text-darkgray">الاكتمال</th>
                      <th className="py-2 px-3 font-medium text-darkgray">الحالة</th>
                      <th className="py-2 px-3 font-medium text-darkgray"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackProfiles.map((p) => {
                      const r = p as any;
                      const score = p.completion_score || 0;
                      const st = STATUS_LABELS[p.status] || { label: p.status, variant: 'primary' as const };
                      const barColor = score >= 80 ? 'bg-sage' : score >= 60 ? 'bg-gold-500' : 'bg-wine';
                      return (
                        <tr key={p.id} className="border-b border-gold-100 hover:bg-white/60">
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-primary-800">{r.users?.full_name}</div>
                            <div className="text-xs text-darkgray">{r.users?.job_title}</div>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-darkgray">{r.users?.department || '—'}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
                                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                              </div>
                              <span className="text-xs font-medium">{score}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <Link href={`/hr/development-plans/${p.id}`} className="text-xs text-primary-600 hover:underline">
                              خطة التطوير ←
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {totalCount === 0 && (
          <Card>
            <div className="text-center py-8 text-darkgray text-sm">لا توجد ملفات بعد.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
