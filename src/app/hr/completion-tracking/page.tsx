import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';
import { RemindButton } from './RemindButton';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد', in_progress: 'قيد الاستكمال', submitted: 'مُقدَّم',
  under_review: 'تحت المراجعة', approved: 'معتمد', rejected: 'مرفوض',
  returned_for_completion: 'معاد للاستكمال', awaiting_360: 'في انتظار 360',
};

export default async function HRCompletionTrackingPage() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, completion_score, updated_at, users(full_name, job_title, department, email)')
    .lt('completion_score', 80)
    .in('status', ['new', 'in_progress', 'returned_for_completion'])
    .order('completion_score', { ascending: true });

  const { data: allProfiles } = await supabase
    .from('candidate_profiles')
    .select('id, completion_score')
    .gte('completion_score', 80);

  const stalled = (profiles || []).filter(p => {
    const daysSince = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  });

  const groups = {
    critical: (profiles || []).filter(p => (p.completion_score || 0) < 40),
    medium: (profiles || []).filter(p => (p.completion_score || 0) >= 40 && (p.completion_score || 0) < 60),
    near: (profiles || []).filter(p => (p.completion_score || 0) >= 60 && (p.completion_score || 0) < 80),
  };

  return (
    <div dir="rtl">
      <PageHeader
        title="متابعة استكمال الملفات"
        description="المرشحون الذين لم يكتمل ملفهم بعد. مرتبة من الأضعف اكتمالاً. يمكنك إرسال تذكير فوري لكل مرشح."
        example="مرشح لم يحدّث ملفه منذ 14 يوماً وإكتماله أقل من 40% — أولوية للتذكير."
        icon={<Activity className="h-5 w-5" />}
      />

      {/* إحصاءات سريعة */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-wine">{groups.critical.length}</div>
          <div className="text-xs text-darkgray mt-1">أقل من 40% — حرج</div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-700">{groups.medium.length}</div>
          <div className="text-xs text-darkgray mt-1">40% – 59% — يحتاج متابعة</div>
        </div>
        <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-gold-700">{groups.near.length}</div>
          <div className="text-xs text-darkgray mt-1">60% – 79% — قريب من الاكتمال</div>
        </div>
      </div>

      {stalled.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-5">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{stalled.length} مرشح لم يحدّث ملفه منذ أكثر من 7 أيام — يُنصح بالتذكير.</span>
        </div>
      )}

      {(profiles || []).length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-10 gap-3">
            <CheckCircle className="h-10 w-10 text-sage" />
            <p className="text-sm text-darkgray">جميع المرشحين أكملوا ملفاتهم — عمل ممتاز.</p>
            <p className="text-xs text-darkgray">{allProfiles?.length || 0} ملف مكتمل بنسبة 80% وأعلى.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="space-y-2">
            {(profiles || []).map((p) => {
              const r = p as any;
              const score = p.completion_score || 0;
              const daysSince = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24));
              const isStalled = daysSince >= 7;
              const barColor = score < 40 ? 'bg-wine' : score < 60 ? 'bg-amber-500' : 'bg-gold-500';
              const bgColor = score < 40 ? 'bg-rose-50 border-rose-200' : score < 60 ? 'bg-amber-50 border-amber-100' : 'bg-gold-50 border-gold-100';

              return (
                <div key={p.id} className={`flex items-center gap-4 p-4 border rounded-xl ${bgColor}`}>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    {r.users?.full_name?.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-primary-800 text-sm">{r.users?.full_name}</span>
                      {isStalled && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                          لم يتحرك منذ {daysSince} يوم
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-darkgray">{r.users?.job_title} · {r.users?.department}</div>
                    <div className="text-xs text-darkgray">{r.users?.email}</div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center w-24">
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-1 border border-gold-100">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${score < 40 ? 'text-wine' : score < 60 ? 'text-amber-700' : 'text-gold-700'}`}>
                        {score}%
                      </span>
                    </div>
                    <Badge variant={p.status === 'returned_for_completion' ? 'wine' : 'gold'}>
                      {STATUS_LABELS[p.status] || p.status}
                    </Badge>
                    <RemindButton candidateId={p.id} candidateName={r.users?.full_name || ''} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
