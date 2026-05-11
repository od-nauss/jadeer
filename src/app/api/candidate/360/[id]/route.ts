import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('candidate_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });
    if (['awaiting_evaluators', 'awaiting_360', 'under_governance_review', 'approved'].includes(profile.status)) {
      return NextResponse.json({ error: 'لا يمكن التعديل بعد إرسال القائمة' }, { status: 400 });
    }
    const { data: nominee } = await supabase.from('evaluator_nominees').select('id, candidate_profile_id, full_name').eq('id', params.id).maybeSingle();
    if (!nominee || nominee.candidate_profile_id !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    await supabase.from('evaluator_nominees').delete().eq('id', params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
