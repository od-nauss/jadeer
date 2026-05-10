import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { UniversityLogo } from '@/components/branding/Logo';
import { EvaluationForm } from './evaluation-form';

export const dynamic = 'force-dynamic';
export default async function EvaluationPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createServiceClient();

  // التحقق من الرابط
  const { data: link } = await supabase
    .from('evaluation_links')
    .select('*, approved_evaluators(evaluator_name, evaluator_email, relationship), candidate_profiles(users(full_name, job_title))')
    .eq('token', params.token)
    .single();

  if (!link) notFound();

  // التحقق من حالة الرابط
  if (link.status === 'used') {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full institutional-card p-10 text-center">
          <UniversityLogo size="sm" className="mx-auto mb-6" />
          <h2 className="text-xl font-bold text-primary-700 mb-2">الرابط مستخدم</h2>
          <p className="text-darkgray text-sm leading-relaxed">
            هذا الرابط استُخدم بالفعل. كل رابط في منصة جدير يستخدم مرة واحدة فقط لضمان أمان التقييم.
            إذا كنت تظن أن هذا خطأ، تواصل مع لجنة الحوكمة.
          </p>
        </div>
      </div>
    );
  }

  if (link.status === 'expired' || (link.expires_at && new Date(link.expires_at) < new Date())) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full institutional-card p-10 text-center">
          <UniversityLogo size="sm" className="mx-auto mb-6" />
          <h2 className="text-xl font-bold text-primary-700 mb-2">الرابط منتهي الصلاحية</h2>
          <p className="text-darkgray text-sm leading-relaxed">
            انتهت صلاحية هذا الرابط. تواصل مع لجنة الحوكمة لإصدار رابط جديد.
          </p>
        </div>
      </div>
    );
  }

  type LinkData = {
    approved_evaluators: { evaluator_name: string; evaluator_email: string; relationship: string };
    candidate_profiles: { users: { full_name: string; job_title?: string } };
  };
  const data = link as unknown as LinkData;

  return (
    <div className="min-h-screen institutional-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <UniversityLogo size="sm" className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-primary-700">منصة جدير - تقييم 360</h1>
          <p className="text-sm text-darkgray mt-1">دائرة الثقة القيادية</p>
        </div>

        {/* بيانات المقيم والمرشح */}
        <div className="institutional-card p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-darkgray mb-1">المقيم</div>
              <div className="font-bold text-primary-700">{data.approved_evaluators.evaluator_name}</div>
              <div className="text-xs text-darkgray mt-0.5">{data.approved_evaluators.relationship}</div>
            </div>
            <div className="border-r pr-4 border-gold-200">
              <div className="text-xs text-darkgray mb-1">المرشح</div>
              <div className="font-bold text-primary-700">{data.candidate_profiles.users.full_name}</div>
              <div className="text-xs text-darkgray mt-0.5">{data.candidate_profiles.users.job_title}</div>
            </div>
          </div>
        </div>

        <EvaluationForm token={params.token} linkId={link.id} />

        <p className="text-xs text-darkgray text-center mt-6">
          هذا الرابط آمن ومرتبط باسمك حصراً، ويستخدم مرة واحدة فقط. كل تقييم يُسجَّل في سجل
          الحوكمة ويراجَع من لجنة الحوكمة قبل اعتماد أي تصنيف.
        </p>
      </div>
    </div>
  );
}
