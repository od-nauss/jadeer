import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const supabase = createServiceClient();

    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 400 });

    if (!body.appeal_type || !body.appeal_text) {
      return NextResponse.json({ error: 'نوع التظلم والنص مطلوبان' }, { status: 400 });
    }

    const { data: appeal, error } = await supabase.from('appeals').insert({
      candidate_profile_id: profile.id,
      appeal_type: body.appeal_type,
      appeal_text: body.appeal_text,
      status: 'new',
    }).select('id').single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'appeal_submitted',
      description: `تقديم تظلم: ${body.appeal_type}`,
      affected_entity_type: 'appeals', affected_entity_id: appeal.id, sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true, id: appeal.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
