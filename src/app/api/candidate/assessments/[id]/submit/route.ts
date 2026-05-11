import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

function scoreAnswers(questions: Array<{ id: string; question_type: string; options_json: Record<string, unknown> }>, answers: Record<string, unknown>): number {
  let total = 0;
  let count = 0;
  for (const q of questions) {
    const ans = answers[q.id];
    if (!ans) continue;
    if (q.question_type === 'short_text') {
      const len = String(ans).trim().length;
      total += len > 100 ? 90 : len > 50 ? 70 : len > 20 ? 50 : 20;
    } else if (q.question_type === 'priority_ranking') {
      total += Array.isArray(ans) ? 80 : 50;
    } else {
      // multiple_choice, situation, best_decision, case_analysis
      total += ans !== null && ans !== undefined ? 75 : 0;
    }
    count++;
  }
  return count > 0 ? Math.round(total / count) : 0;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { resultId, answers } = body;
    const supabase = createServiceClient();

    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    const { data: result } = await supabase.from('assessment_results')
      .select('id, candidate_profile_id, status')
      .eq('id', resultId)
      .maybeSingle();

    if (!result || result.candidate_profile_id !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    if (result.status === 'completed') return NextResponse.json({ error: 'الاختبار مكتمل مسبقاً' }, { status: 400 });

    // جلب الأسئلة
    const { data: questions } = await supabase.from('assessment_questions')
      .select('id, question_type, options_json')
      .eq('assessment_id', params.id)
      .order('display_order');

    const score = scoreAnswers((questions || []) as Parameters<typeof scoreAnswers>[0], answers);

    // تحديد نمط التفكير
    const shortAnswers = (questions || []).filter(q => q.question_type === 'short_text');
    const allText = shortAnswers.map(q => String(answers[q.id] || '')).join(' ');
    let thinking_pattern = 'تحليلي متوازن';
    if (allText.includes('بيانات') || allText.includes('مؤشر') || allText.includes('قياس')) thinking_pattern = 'مدفوع بالبيانات';
    else if (allText.includes('فريق') || allText.includes('تعاون') || allText.includes('ثقة')) thinking_pattern = 'إنساني تشاركي';
    else if (allText.includes('استراتيج') || allText.includes('رؤية') || allText.includes('مستقبل')) thinking_pattern = 'استراتيجي بعيد المدى';

    await supabase.from('assessment_results').update({
      status: 'completed',
      score,
      thinking_pattern,
      answers_json: answers,
      completed_at: new Date().toISOString(),
    }).eq('id', resultId);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'assessment_completed',
      description: `إكمال اختبار — النتيجة: ${score}%`,
      affected_entity_type: 'assessment_results', affected_entity_id: resultId, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, score, thinking_pattern });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
