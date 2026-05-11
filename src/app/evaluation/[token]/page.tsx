import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { UniversityLogo } from '@/components/branding/Logo';
import { EvaluationForm } from './evaluation-form';
import { Shield, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EvaluationPage({ params }: { params: { token: string } }) {
  const supabase = createServiceClient();

  const { data: link } = await supabase
    .from('evaluation_links')
    .select('*, approved_evaluators(id, full_name, email, relationship_type, can_verify_initiatives, can_verify_kpis, candidate_profile_id), candidate_profiles(id, users(full_name, job_title))')
    .eq('token', params.token)
    .single();

  if (!link) notFound();

  // تحقق حالة الرابط
  if (link.status === 'submitted') {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full institutional-card p-10 text-center" dir="rtl">
          <UniversityLogo size="sm" className="mx-auto mb-6" />
          <h2 className="text-xl font-bold text-primary-700 mb-2">الرابط مستخدم</h2>
          <p className="text-darkgray text-sm leading-relaxed">
            هذا الرابط استُخدم بالفعل. كل رابط في منصة جدير يستخدم مرة واحدة فقط لضمان أمان وعدالة التقييم.
          </p>
        </div>
      </div>
    );
  }

  if (['expired', 'cancelled'].includes(link.status) || (link.expires_at && new Date(link.expires_at) < new Date())) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full institutional-card p-10 text-center" dir="rtl">
          <UniversityLogo size="sm" className="mx-auto mb-6" />
          <h2 className="text-xl font-bold text-primary-700 mb-2">الرابط منتهي الصلاحية</h2>
          <p className="text-darkgray text-sm leading-relaxed">
            انتهت صلاحية هذا الرابط أو تم إلغاؤه. تواصل مع لجنة الحوكمة لإصدار رابط جديد.
          </p>
        </div>
      </div>
    );
  }

  // تسجيل فتح الرابط
  if (link.status === 'ready') {
    await supabase.from('evaluation_links').update({ status: 'opened', opened_at: new Date().toISOString() }).eq('id', link.id);
  }

  type EvaluatorType = { id: string; full_name: string; email: string; relationship_type: string; can_verify_initiatives: boolean; can_verify_kpis: boolean; candidate_profile_id: string };
  type CandidateType = { id: string; users: { full_name: string; job_title?: string } };

  const evaluator = (link as unknown as { approved_evaluators: EvaluatorType }).approved_evaluators;
  const candidateProfile = (link as unknown as { candidate_profiles: CandidateType }).candidate_profiles;

  // جلب المبادرات والمؤشرات إذا كان المقيم مخوّلاً
  let initiatives: Array<{ id: string; name: string }> = [];
  let kpis: Array<{ id: string; name: string }> = [];

  if (evaluator?.can_verify_initiatives) {
    const { data } = await supabase.from('initiatives').select('id, name').eq('candidate_profile_id', evaluator.candidate_profile_id).limit(10);
    initiatives = (data || []).map(i => ({ id: i.id, name: i.name }));
  }

  if (evaluator?.can_verify_kpis) {
    const { data } = await supabase.from('kpis').select('id, name').eq('candidate_profile_id', evaluator.candidate_profile_id).limit(10);
    kpis = (data || []).map(k => ({ id: k.id, name: k.name }));
  }

  const REL_LABELS: Record<string, string> = {
    direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
    subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
    project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
  };

  const expiresIn = link.expires_at
    ? Math.ceil((new Date(link.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 14;

  return (
    <div className="min-h-screen institutional-bg py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <UniversityLogo size="sm" className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-primary-700">منصة جدير — تقييم 360°</h1>
          <p className="text-sm text-darkgray mt-1">دائرة الثقة القيادية</p>
        </div>

        {/* بيانات المقيم والمرشح */}
        <div className="institutional-card p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-darkgray mb-1">أنت المقيّم</div>
              <div className="font-bold text-primary-700 text-lg">{evaluator?.full_name}</div>
              <div className="text-sm text-darkgray">
                {REL_LABELS[evaluator?.relationship_type] || evaluator?.relationship_type}
              </div>
            </div>
            <div className="border-r pr-4 border-gold-200">
              <div className="text-xs text-darkgray mb-1">المرشح المراد تقييمه</div>
              <div className="font-bold text-primary-700 text-lg">{candidateProfile?.users?.full_name}</div>
              <div className="text-sm text-darkgray">{candidateProfile?.users?.job_title}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gold-200 flex items-center justify-between text-xs text-darkgray">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              مدة التقييم التقديرية: 15-20 دقيقة
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              صالح لـ {expiresIn} يوم
            </div>
          </div>
        </div>

        {/* تنبيه الأمانة */}
        <div className="institutional-card p-5 mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-800 leading-relaxed">
              <strong>تنبيه السرية والأمانة:</strong> هذا التقييم جزء من مسار مؤسسي لقياس الجاهزية القيادية.
              يرجى الإجابة بناءً على معرفتك المهنية المباشرة بالمرشح. لن تُعرَض إجاباتك التفصيلية للمرشح،
              وستُستخدَم ضمن تحليل جماعي يخضع لمراجعة لجنة الحوكمة المستقلة.
            </div>
          </div>
        </div>

        {/* نموذج التقييم */}
        <EvaluationForm
          token={params.token}
          linkId={link.id}
          initiatives={initiatives}
          kpis={kpis}
          canVerifyInitiatives={evaluator?.can_verify_initiatives && initiatives.length > 0}
          canVerifyKpis={evaluator?.can_verify_kpis && kpis.length > 0}
        />

        <p className="text-xs text-darkgray text-center mt-6 pb-8">
          هذا الرابط آمن ومرتبط باسمك حصراً، ويستخدم مرة واحدة فقط.
          كل تقييم يُسجَّل في سجل الحوكمة ويراجَع من لجنة الحوكمة.
          © 2026 جامعة نايف العربية للعلوم الأمنية
        </p>
      </div>
    </div>
  );
}
