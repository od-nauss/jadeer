import Link from 'next/link';
import { Trophy, Plus, ArrowLeft, Calendar, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

const STATUS_INFO: Record<string, { label: string; variant: 'gold' | 'sage' | 'primary' | 'wine' | 'gray' | 'steelblue' }> = {
  draft: { label: 'مسودة', variant: 'gray' },
  open: { label: 'مفتوحة', variant: 'sage' },
  closed: { label: 'مغلقة', variant: 'gold' },
  under_review: { label: 'قيد المراجعة', variant: 'primary' },
  completed: { label: 'مكتملة', variant: 'sage' },
  archived: { label: 'مؤرشفة', variant: 'gray' },
};
const TYPE_LABELS: Record<string, string> = { leadership: 'قيادية', operational: 'تشغيلية', technical: 'تقنية', strategic: 'استراتيجية', development: 'تطويرية', other: 'أخرى' };

export default async function HRCompetitionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data: competitions } = await supabase.from('competitions').select('*, organization_units(name)').order('created_at', { ascending: false });
  const { data: candidateCounts } = await supabase.from('competition_candidates').select('competition_id');
  const countMap: Record<string, number> = {};
  (candidateCounts || []).forEach((cc: any) => { countMap[cc.competition_id] = (countMap[cc.competition_id] || 0) + 1; });

  return (
    <div dir="rtl">
      <PageHeader title="المسابقات الوظيفية" description="إدارة المسابقات ومسارات الاختيار القيادي." example="مسابقة قيادات الصف الثاني: مفتوحة للإدارات التشغيلية، تتطلب ملفاً مكتملاً وتقييم 360." icon={<Trophy className="h-5 w-5" />} />
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-darkgray">{competitions?.length || 0} مسابقة</div>
        <Link href="/hr/competitions/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-sm">
          <Plus className="h-4 w-4" />إنشاء مسابقة
        </Link>
      </div>
      {(!competitions || competitions.length === 0) ? (
        <EmptyState icon={<Trophy className="h-10 w-10" />} title="لا توجد مسابقات" description="أنشئ أول مسابقة وظيفية." action={<Link href="/hr/competitions/create" className="btn-primary px-6 py-2.5 rounded-lg font-bold">إنشاء مسابقة</Link>} />
      ) : (
        <div className="space-y-3">
          {competitions.map((comp) => {
            const si = STATUS_INFO[comp.status] || STATUS_INFO.draft;
            const candCount = countMap[comp.id] || 0;
            const unit = (comp as any).organization_units?.name;
            return (
              <Card key={comp.id}>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-white flex-shrink-0"><Trophy className="h-6 w-6" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-primary-700">{comp.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={si.variant}>{si.label}</Badge>
                          {comp.competition_type && <span className="text-xs bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded">{TYPE_LABELS[comp.competition_type] || comp.competition_type}</span>}
                          {unit && <span className="text-xs text-darkgray">· {unit}</span>}
                        </div>
                      </div>
                      <Link href={`/hr/competitions/${comp.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 flex-shrink-0">التفاصيل <ArrowLeft className="h-3 w-3" /></Link>
                    </div>
                    {comp.description && <p className="text-sm text-darkgray mt-2 line-clamp-1">{comp.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-darkgray">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{candCount} مرشح</span>
                      {comp.start_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />من {new Date(comp.start_date).toLocaleDateString('ar-SA')}</span>}
                      {comp.end_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />إلى {new Date(comp.end_date).toLocaleDateString('ar-SA')}</span>}
                      {comp.requires_360 && <span className="text-steelblue">يتطلب 360°</span>}
                      {comp.requires_governance_review && <span className="text-primary-600">يتطلب لجنة الحوكمة</span>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
