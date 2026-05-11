import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trophy, ArrowRight, Users, CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';
import { CompetitionActions } from './CompetitionActions';

export const dynamic = 'force-dynamic';

const STATUS_INFO: Record<string, { label: string; variant: 'gold' | 'sage' | 'primary' | 'wine' | 'gray' }> = {
  draft: { label: 'مسودة', variant: 'gray' },
  open: { label: 'مفتوحة', variant: 'sage' },
  closed: { label: 'مغلقة', variant: 'gold' },
  under_review: { label: 'قيد المراجعة', variant: 'primary' },
  completed: { label: 'مكتملة', variant: 'sage' },
  archived: { label: 'مؤرشفة', variant: 'gray' },
};

export default async function CompetitionDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: comp } = await supabase
    .from('competitions')
    .select('*, organization_units(name)')
    .eq('id', params.id)
    .maybeSingle();

  if (!comp) notFound();

  const { data: candidates } = await supabase
    .from('competition_candidates')
    .select('*, candidate_profiles(id, completion_score, status, users(full_name, job_title, department))')
    .eq('competition_id', params.id)
    .order('added_at', { ascending: false });

  // بطاقات المشاركين المعتمدين
  const profileIds = (candidates || []).map((cc: any) => cc.candidate_profile_id).filter(Boolean);
  const { data: cards } = profileIds.length > 0
    ? await supabase.from('leadership_cards').select('candidate_profile_id, total_score, readiness_level').in('candidate_profile_id', profileIds)
    : { data: [] };

  const cardMap: Record<string, { total_score: number; readiness_level: string }> = {};
  (cards || []).forEach((c: any) => { cardMap[c.candidate_profile_id] = c; });

  const si = STATUS_INFO[comp.status] || STATUS_INFO.draft;
  const unit = (comp as any).organization_units?.name;
  const reqs = (comp.requirements_json as any) || {};
  const readyNow = (candidates || []).filter((cc: any) => cardMap[cc.candidate_profile_id]?.readiness_level === 'ready_now').length;
  const readyYear = (candidates || []).filter((cc: any) => cardMap[cc.candidate_profile_id]?.readiness_level === 'ready_within_year').length;

  return (
    <div dir="rtl">
      <Link href="/hr/competitions" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowRight className="h-4 w-4" />قائمة المسابقات
      </Link>

      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-primary-700">{comp.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={si.variant}>{si.label}</Badge>
            {unit && <span className="text-sm text-darkgray">· {unit}</span>}
          </div>
        </div>
        <CompetitionActions competitionId={params.id} currentStatus={comp.status} />
      </div>

      {/* إحصاء */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'المشاركون', val: candidates?.length || 0 },
          { label: 'جاهز الآن', val: readyNow },
          { label: 'جاهز خلال سنة', val: readyYear },
          { label: 'ملفات مكتملة', val: (candidates || []).filter((cc: any) => (cc.candidate_profiles as any)?.completion_score >= 80).length },
        ].map(({ label, val }) => (
          <div key={label} className="institutional-card p-4 text-center">
            <div className="text-3xl font-bold text-primary-700">{val}</div>
            <div className="text-xs text-darkgray mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* تفاصيل المسابقة */}
        <Card title="تفاصيل المسابقة">
          <div className="space-y-2 text-sm">
            {comp.description && <div><div className="text-xs text-darkgray mb-0.5">الوصف</div><p className="text-primary-800">{comp.description}</p></div>}
            {comp.objective && <div><div className="text-xs text-darkgray mb-0.5">الهدف</div><p className="text-primary-800">{comp.objective}</p></div>}
            {comp.target_group && <div><div className="text-xs text-darkgray mb-0.5">الفئة المستهدفة</div><p className="text-primary-800">{comp.target_group}</p></div>}
            <div className="flex gap-4 pt-2 border-t border-gold-100">
              {comp.start_date && <div><div className="text-xs text-darkgray">البداية</div><div className="font-medium">{new Date(comp.start_date).toLocaleDateString('ar-SA')}</div></div>}
              {comp.end_date && <div><div className="text-xs text-darkgray">النهاية</div><div className="font-medium">{new Date(comp.end_date).toLocaleDateString('ar-SA')}</div></div>}
            </div>
            {(reqs.min_completion_score || reqs.min_initiatives || reqs.min_kpis) && (
              <div className="pt-2 border-t border-gold-100">
                <div className="text-xs text-darkgray mb-1">المتطلبات</div>
                <div className="flex gap-2 flex-wrap text-xs">
                  {reqs.min_completion_score && <span className="bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded">اكتمال {reqs.min_completion_score}٪+</span>}
                  {reqs.min_initiatives && <span className="bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded">{reqs.min_initiatives}+ مبادرة</span>}
                  {reqs.min_kpis && <span className="bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded">{reqs.min_kpis}+ مؤشر</span>}
                  {comp.requires_360 && <span className="bg-blue-50 text-steelblue border border-blue-200 px-2 py-0.5 rounded">360°</span>}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* قائمة المشاركين */}
        <Card title={`المشاركون (${candidates?.length || 0})`}>
          {(!candidates || candidates.length === 0) ? (
            <div className="text-center py-6 text-darkgray text-sm">لا يوجد مشاركون. أضف مرشحين من قائمة المتقدمين.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {candidates.map((cc: any) => {
                const cu = cc.candidate_profiles?.users;
                const profile = cc.candidate_profiles;
                const card = cardMap[cc.candidate_profile_id];
                const level = card ? READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS] : null;
                return (
                  <div key={cc.id} className="flex items-center gap-2 p-2.5 bg-gold-50 border border-gold-100 rounded-lg">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {cu?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary-700 truncate text-sm">{cu?.full_name}</div>
                      <div className="text-xs text-darkgray">{cu?.job_title}</div>
                    </div>
                    <div className="flex-shrink-0 text-left">
                      <div className="text-xs text-gold-700 font-medium">{profile?.completion_score || 0}٪</div>
                      {level && <div className={`text-xs px-1.5 py-0.5 rounded ${level.bg} ${level.color}`}>{level.label_ar}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {['open', 'draft'].includes(comp.status) && (
            <div className="mt-3 pt-3 border-t border-gold-200">
              <Link href={`/hr/candidates?competition=${params.id}`} className="text-sm text-primary-700 hover:underline font-medium">
                + إضافة مرشحين من قائمة المتقدمين
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
