import Link from 'next/link';
import { Users, Lock } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getAdvisorPermissions } from '@/lib/auth/advisor-access';
import { PageHeader, EmptyState } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdvisorCandidatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const perms = await getAdvisorPermissions(user.id);

  if (!perms.hasAnyAccess) {
    return (
      <div dir="rtl">
        <PageHeader title="المرشحون المصرح بهم" description="" icon={<Users className="h-5 w-5" />} />
        <div className="institutional-card p-8 text-center">
          <Lock className="h-12 w-12 text-gold-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-primary-700 mb-2">لا توجد صلاحيات مُعطاة بعد</h3>
          <p className="text-sm text-darkgray">يمنحك الرئيس صلاحيات الاطلاع على ملفات المرشحين. تواصل معه لطلب الصلاحية.</p>
        </div>
      </div>
    );
  }

  const supabase = createServiceClient();
  let query = supabase
    .from('leadership_cards')
    .select('id, total_score, trust_score, readiness_level, leadership_type, strengths_json, candidate_profiles(id, users(full_name, job_title, department))')
    .eq('is_published', true)
    .order('total_score', { ascending: false });

  // فلترة حسب الصلاحيات
  if (!perms.canViewAllCards && perms.allowedCandidateIds.length > 0) {
    query = query.in('candidate_profile_id', perms.allowedCandidateIds);
  } else if (!perms.canViewAllCards) {
    return (
      <div dir="rtl">
        <PageHeader title="المرشحون المصرح بهم" description="" icon={<Users className="h-5 w-5" />} />
        <EmptyState icon={<Lock className="h-8 w-8" />} title="صلاحيتك محدودة" description="لم يتم تحديد مرشحين مصرح لك بمراجعتهم." />
      </div>
    );
  }

  const { data: cards } = await query;

  // تسجيل في audit
  await supabase.from('audit_logs').insert({
    user_id: user.id, user_role: user.primaryRole,
    operation_type: 'advisor_viewed_candidates_list',
    description: 'اطلاع المستشار على قائمة المرشحين',
    sensitivity: 'sensitive',
  });

  return (
    <div dir="rtl">
      <PageHeader
        title="المرشحون المصرح بهم"
        description="قائمة المرشحين الذين صرّح لك الرئيس بمراجعة بطاقاتهم. للاطلاع فقط — لا يمكنك تعديل أي نتيجة."
        icon={<Users className="h-5 w-5" />}
      />

      {(!cards || cards.length === 0) ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="لا توجد بطاقات معتمدة بعد" description="ستظهر البطاقات فور اعتماد لجنة الحوكمة." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            type Row = { candidate_profiles: { id: string; users: { full_name: string; job_title?: string; department?: string } } };
            const r = card as unknown as Row;
            const candidateUser = r.candidate_profiles?.users;
            if (!candidateUser) return null;
            const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
            const strengths = (card.strengths_json as string[] | null) || [];
            return (
              <Link key={card.id} href={`/advisor/cards/${card.id}`} className="institutional-card p-5 hover:border-gold-400 transition">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {candidateUser.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary-700 truncate">{candidateUser.full_name}</div>
                    <div className="text-xs text-darkgray truncate">{candidateUser.job_title}</div>
                    <div className="text-xs text-darkgray">{candidateUser.department}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-gold-700">{Number(card.total_score).toFixed(0)}٪</span>
                  {level && <span className={`text-xs px-2 py-1 rounded-lg ${level.bg} ${level.color}`}>{level.label_ar}</span>}
                </div>
                {strengths.length > 0 && (
                  <div className="text-xs text-darkgray">قوة: {strengths[0]}</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
