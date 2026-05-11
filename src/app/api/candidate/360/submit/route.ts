import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    if (!['in_progress', 'new'].includes(profile.status)) {
      return NextResponse.json({ error: 'القائمة مرسلة بالفعل أو في مرحلة متقدمة' }, { status: 400 });
    }

    const { count: nomineeCount } = await supabase
      .from('evaluator_nominees')
      .select('id', { count: 'exact', head: true })
      .eq('candidate_profile_id', profile.id);

    if ((nomineeCount || 0) < 15) {
      return NextResponse.json({ error: `يجب إضافة 15 مقيماً قبل الإرسال. لديك حالياً ${nomineeCount}` }, { status: 400 });
    }

    // تحديث حالة الملف
    await supabase
      .from('candidate_profiles')
      .update({ status: 'awaiting_evaluators' })
      .eq('id', profile.id);

    // تحديث وقت الإرسال على جميع المرشحين
    await supabase
      .from('evaluator_nominees')
      .update({ submitted_to_committee_at: new Date().toISOString() })
      .eq('candidate_profile_id', profile.id);

    // إنشاء أو تحديث ملخص 360
    await supabase
      .from('candidate_360_summary')
      .upsert({
        candidate_profile_id: profile.id,
        circle_status: 'list_submitted',
        list_submitted_at: new Date().toISOString(),
      }, { onConflict: 'candidate_profile_id' });

    // إشعار للجنة الحوكمة
    await supabase.from('notifications').insert({
      title: 'قائمة مقيمين جديدة بانتظار الاعتماد',
      body: `أرسل ${user.full_name} قائمة المقيمين لمراجعة لجنة الحوكمة.`,
      target_role: 'governance',
      priority: 'high',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: user.primaryRole,
      operation_type: 'nominee_list_submitted',
      description: `إرسال قائمة 15 مقيماً للجنة الحوكمة`,
      affected_entity_type: 'candidate_profiles',
      affected_entity_id: profile.id,
      sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
