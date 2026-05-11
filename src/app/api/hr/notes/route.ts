import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.primaryRoles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const body = await req.json();
    if (!body.note_text || body.note_text.length < 10) return NextResponse.json({ error: 'نص الملاحظة مطلوب (10 أحرف+)' }, { status: 400 });

    const supabase = createServiceClient();
    const { data: note, error } = await supabase.from('hr_notes').insert({
      candidate_profile_id: body.candidate_profile_id || null,
      hr_user_id: user.id,
      note_type: body.note_type || 'general',
      note_text: body.note_text,
      visible_to_candidate: body.visible_to_candidate || false,
      visible_to_president: body.visible_to_president || false,
      sent_to_governance: body.sent_to_governance || false,
    }).select('id').single();

    if (error) throw error;

    if (body.sent_to_governance) {
      await supabase.from('notifications').insert({
        title: 'ملاحظة موارد بشرية جديدة',
        body: `أرسل عضو الموارد البشرية ملاحظة للجنة: ${body.note_text.substring(0, 80)}`,
        target_role: 'governance',
      });
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'hr_note_created',
      description: `ملاحظة موارد بشرية${body.sent_to_governance ? ' — مرسلة للجنة' : ''}`,
      affected_entity_type: 'hr_notes', affected_entity_id: note.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, id: note.id });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.primaryRoles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const { id } = await req.json();
    const supabase = createServiceClient();
    await supabase.from('hr_notes').delete().eq('id', id).eq('hr_user_id', user.id);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
