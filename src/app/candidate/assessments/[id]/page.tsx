import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { AssessmentRunner } from '@/components/candidate/AssessmentRunner';
import { UniversityLogo } from '@/components/branding/Logo';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TakeAssessmentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = createClient();

  // التحقق من وجود الاختبار
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, title, description, estimated_duration_minutes, question_count')
    .eq('id', params.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!assessment) notFound();

  // ملف المستخدم
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full institutional-card p-8 text-center">
          <h2 className="text-xl font-bold text-primary-700 mb-3">أكمل ملفك القيادي أولاً</h2>
          <p className="text-sm text-darkgray mb-6">يجب إنشاء الملف القيادي قبل البدء بالاختبارات.</p>
          <Link href="/candidate/profile" className="btn-primary px-6 py-2.5 rounded-xl font-bold">اذهب للملف</Link>
        </div>
      </div>
    );
  }

  // فحص حالة الاختبار
  const { data: existingResult } = await supabase
    .from('assessment_results')
    .select('id, status, score, thinking_pattern')
    .eq('candidate_profile_id', profile.id)
    .eq('assessment_id', params.id)
    .maybeSingle();

  if (existingResult?.status === 'completed') {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-lg w-full text-center">
          <div className="h-24 w-24 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary-700 mb-2">{assessment.title}</h2>
          <p className="text-darkgray mb-6">أكملت هذا الاختبار مسبقاً</p>
          <div className="institutional-card p-6 mb-6">
            <div className="text-4xl font-bold text-gold-700 mb-1">{Number(existingResult.score).toFixed(0)}%</div>
            <div className="text-sm text-darkgray">{existingResult.thinking_pattern || 'نتيجة محفوظة'}</div>
          </div>
          <Link href="/candidate/assessments" className="btn-primary px-8 py-3 rounded-xl font-bold">
            العودة للاختبارات
          </Link>
        </div>
      </div>
    );
  }

  // جلب الأسئلة
  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('id, question_text, question_type, options_json, display_order')
    .eq('assessment_id', params.id)
    .order('display_order');

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4" dir="rtl">
        <div className="institutional-card p-8 text-center">
          <p className="text-darkgray">هذا الاختبار لا يحتوي على أسئلة بعد. تواصل مع مدير النظام.</p>
          <Link href="/candidate/assessments" className="mt-4 inline-block text-primary-700 hover:underline">العودة</Link>
        </div>
      </div>
    );
  }

  // بدء الاختبار أو الاستئناف
  let resultId = existingResult?.id;
  if (!resultId) {
    // سنبدأ الاختبار من خلال API Route لكي يُسجَّل في سجل التدقيق
    // لكن بما أن هذا Server Component، نبدؤه مباشرة
    const { data: newResult } = await supabase
      .from('assessment_results')
      .insert({
        candidate_profile_id: profile.id,
        assessment_id: params.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        answers_json: {},
      })
      .select('id')
      .single();
    resultId = newResult?.id;
  }

  if (!resultId) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-primary-900/90 backdrop-blur-sm border-b border-gold-500/20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/candidate/assessments" className="flex items-center gap-2 text-white/70 hover:text-gold-300 transition text-sm">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <div className="text-white font-bold">{assessment.title}</div>
          <UniversityLogo size="sm" className="brightness-0 invert opacity-60" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <AssessmentRunner
          assessmentId={params.id}
          assessmentTitle={assessment.title}
          questions={questions as Parameters<typeof AssessmentRunner>[0]['questions']}
          resultId={resultId}
          durationMinutes={assessment.estimated_duration_minutes || 15}
        />
      </div>
    </div>
  );
}
