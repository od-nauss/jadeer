import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, linkId, scores, comments, verifications, generalNote } = body;

    if (!token || !scores || Object.keys(scores).length === 0) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // التحقق من الرابط
    const { data: link } = await supabase
      .from('evaluation_links')
      .select('*, approved_evaluators(id, candidate_profile_id, evaluator_name, relationship)')
      .eq('token', token)
      .single();

    if (!link) {
      return NextResponse.json({ error: 'رابط غير صحيح' }, { status: 404 });
    }

    if (link.status === 'used') {
      return NextResponse.json({ error: 'الرابط مستخدم بالفعل' }, { status: 410 });
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'الرابط منتهي الصلاحية' }, { status: 410 });
    }

    type Evaluator = { id: string; candidate_profile_id: string; evaluator_name: string; relationship: string };
    const evaluator = (link as { approved_evaluators: Evaluator }).approved_evaluators;

    // حفظ التقييم
    await supabase.from('evaluations_360').insert({
      candidate_profile_id: evaluator.candidate_profile_id,
      evaluator_id: evaluator.id,
      evaluation_link_id: linkId,
      axis_scores: scores,
      axis_comments: comments,
      verification_answers: verifications,
      general_note: generalNote,
      submitted_at: new Date().toISOString(),
    });

    // تحديث حالة الرابط
    await supabase
      .from('evaluation_links')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
      })
      .eq('id', linkId);

    // سجل التدقيق
    await supabase.from('audit_logs').insert({
      operation_type: 'evaluation_360_submitted',
      description: `تم استلام تقييم 360 من ${evaluator.evaluator_name}`,
      sensitivity: 'sensitive',
      affected_entity: 'evaluations_360',
      affected_id: evaluator.candidate_profile_id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Evaluation submit error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع.', details: String(error) },
      { status: 500 }
    );
  }
}
