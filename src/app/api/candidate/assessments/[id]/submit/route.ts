import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { scoreAssessment } from '@/lib/ai/assessmentScoring';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { resultId, answers } = body;
    const supabase = createServiceClient();

    // التحقق من الملف
    const { data: profile } = await supabase.from('candidate_profiles')
      .select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    // التحقق من نتيجة الاختبار
    const { data: result } = await supabase.from('assessment_results')
      .select('id, candidate_profile_id, status')
      .eq('id', resultId).maybeSingle();
    if (!result || result.candidate_profile_id !== profile.id)
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    if (result.status === 'completed')
      return NextResponse.json({ error: 'الاختبار مكتمل مسبقاً' }, { status: 400 });

    // جلب الاختبار وأسئلته
    const { data: assessment } = await supabase.from('assessments')
      .select('code').eq('id', params.id).maybeSingle();

    const { data: questions } = await supabase.from('assessment_questions')
      .select('id, question_type, options_json, display_order')
      .eq('assessment_id', params.id)
      .order('display_order');

    // ─── التصحيح الذكي ────────────────────────────────────────────────────
    const scoringResult = scoreAssessment(
      assessment?.code || '',
      (questions || []) as Parameters<typeof scoreAssessment>[1],
      answers
    );

    // حفظ النتيجة
    await supabase.from('assessment_results').update({
      status: 'completed',
      score: scoringResult.totalScore,
      thinking_pattern: scoringResult.thinkingPattern,
      leadership_pattern: scoringResult.leadershipDimension,
      strengths_json: scoringResult.strengths,
      gaps_json: scoringResult.gaps,
      answers_json: answers,
      completed_at: new Date().toISOString(),
    }).eq('id', resultId);

    // تحديث درجة اكتمال الملف
    const { data: allResults } = await supabase.from('assessment_results')
      .select('id, status').eq('candidate_profile_id', profile.id);
    const completedCount = (allResults || []).filter(r => r.status === 'completed').length;
    const totalAssessments = 8;
    const assessmentContrib = Math.round((completedCount / totalAssessments) * 20); // الاختبارات تساهم بـ 20% من الاكتمال

    // جلب الدرجة الحالية وتحديثها
    const { data: currentProfile } = await supabase.from('candidate_profiles')
      .select('completion_score').eq('id', profile.id).maybeSingle();
    const currentScore = currentProfile?.completion_score || 0;
    const newScore = Math.min(100, Math.max(currentScore, assessmentContrib + 60)); // base 60 + assessment bonus
    await supabase.from('candidate_profiles')
      .update({ completion_score: newScore }).eq('id', profile.id);

    // سجل التدقيق
    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'assessment_completed',
      description: `إكمال اختبار "${assessment?.code}" — الدرجة: ${scoringResult.totalScore}% — النمط: ${scoringResult.thinkingPattern}`,
      affected_entity_type: 'assessment_results',
      affected_entity_id: resultId,
      sensitivity: 'normal',
    });

    return NextResponse.json({
      success: true,
      score: scoringResult.totalScore,
      thinking_pattern: scoringResult.thinkingPattern,
      leadership_dimension: scoringResult.leadershipDimension,
      strengths: scoringResult.strengths,
      gaps: scoringResult.gaps,
    });

  } catch (err) {
    console.error('[assessment/submit]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
