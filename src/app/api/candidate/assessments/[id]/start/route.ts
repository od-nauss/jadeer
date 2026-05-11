import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'أكمل ملفك القيادي أولاً' }, { status: 400 });

    // التحقق من عدم إكمال الاختبار
    const { data: existing } = await supabase.from('assessment_results')
      .select('id, status')
      .eq('candidate_profile_id', profile.id)
      .eq('assessment_id', params.id)
      .maybeSingle();

    if (existing?.status === 'completed') {
      return NextResponse.json({ error: 'أكملت هذا الاختبار مسبقاً' }, { status: 400 });
    }

    if (existing) {
      return NextResponse.json({ success: true, resultId: existing.id, resumed: true });
    }

    // بدء اختبار جديد
    const { data: result, error } = await supabase.from('assessment_results').insert({
      candidate_profile_id: profile.id,
      assessment_id: params.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      answers_json: {},
    }).select('id').single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'assessment_started',
      description: `بدء اختبار`,
      affected_entity_type: 'assessment_results', affected_entity_id: result.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, resultId: result.id, resumed: false });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
