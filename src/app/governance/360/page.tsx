import Link from 'next/link';
import { Eye, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Governance360Page() {
  const supabase = createClient();

  // جلب المرشحين الذين تقييم 360 جارٍ لهم
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, users(full_name, job_title, department)')
    .in('status', ['awaiting_360', 'evaluation_in_progress', 'evaluation_complete']);

  if (!profiles || profiles.length === 0) {
    return (
      <div>
        <PageHeader
          title="متابعة تقييم 360°"
          description="نسبة اكتمال تقييم 360 لكل مرشح. يمكنك تمديد الروابط أو إغلاق التقييم كمراجعة مشروطة."
          icon={<Eye className="h-5 w-5" />}
        />
        <EmptyState
          icon={<Eye className="h-8 w-8" />}
          title="لا توجد تقييمات 360 جارية"
          description="ستظهر هنا التقييمات النشطة فور اعتماد قوائم المقيمين."
        />
      </div>
    );
  }

  // جلب بيانات الاكتمال لجميع المرشحين دفعة واحدة (لا async map)
  const profileIds = profiles.map(p => p.id);

  const [{ data: approvedCounts }, { data: completedCounts }] = await Promise.all([
    supabase
      .from('approved_evaluators')
      .select('candidate_profile_id')
      .in('candidate_profile_id', profileIds),
    supabase
      .from('evaluations_360')
      .select('candidate_profile_id')
      .in('candidate_profile_id', profileIds),
  ]);

  // تجميع الأعداد per profile
  const approvedMap: Record<string, number> = {};
  const completedMap: Record<string, number> = {};
  (approvedCounts || []).forEach((r: any) => {
    approvedMap[r.candidate_profile_id] = (approvedMap[r.candidate_profile_id] || 0) + 1;
  });
  (completedCounts || []).forEach((r: any) => {
    completedMap[r.candidate_profile_id] = (completedMap[r.candidate_profile_id] || 0) + 1;
  });

  type ProfileRow = {
    id: string;
    status: string;
    users: { full_name: string; job_title?: string; department?: string };
  };

  return (
    <div>
      <PageHeader
        title="متابعة تقييم 360°"
        description="نسبة اكتمال تقييم 360 لكل مرشح. يمكن تمديد الروابط أو إغلاق التقييم كمراجعة مشروطة عند الحاجة."
        icon={<Eye className="h-5 w-5" />}
      />

      <div className="space-y-3">
        {profiles.map((p) => {
          const r = p as unknown as ProfileRow;
          const total = approvedMap[p.id] || 0;
          const completed = completedMap[p.id] || 0;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          const barColor = percent >= 80 ? 'bg-sage' : percent >= 50 ? 'bg-gold-500' : 'bg-primary-500';

          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-primary-700">{r.users?.full_name || '—'}</div>
                  <div className="text-xs text-darkgray">{r.users?.job_title} {r.users?.department ? `— ${r.users.department}` : ''}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gold-700">{percent}%</div>
                    <div className="text-xs text-darkgray">{completed} من {total} مقيّم</div>
                  </div>
                  <Link
                    href={`/governance/360/${p.id}`}
                    className="flex items-center gap-1.5 text-xs text-primary-700 hover:text-primary-900 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition"
                  >
                    التفاصيل <ArrowLeft className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="h-2.5 bg-gold-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {percent < 60 && total > 0 && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  ⚠ لم يكتمل الحد الأدنى المطلوب (60%) — يمكنك تمديد الروابط أو إرسال تذكيرات
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
