import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getAdvisorPermissions } from '@/lib/auth/advisor-access';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.primaryRole.includes('advisor')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const perms = await getAdvisorPermissions(user.id);
    if (!perms.canAddNotes) {
      return NextResponse.json({ error: 'ليس لديك صلاحية إضافة ملاحظات' }, { status: 403 });
    }

    const { candidate_profile_id, note_type, note_text, shared_with_governance = false } = await req.json();
    if (!note_text || note_text.length < 10) {
      return NextResponse.json({ error: 'نص الملاحظة مطلوب (10 أحرف على الأقل)' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: note, error } = await supabase.from('advisor_notes').insert({
      advisor_user_id: user.id,
      candidate_profile_id: candidate_profile_id || null,
      note_type: note_type || 'general',
      note_text,
      visibility: 'president_only',
      shared_with_president: true,
      shared_with_governance,
    }).select('id').single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'advisor_note_added',
      description: `ملاحظة مستشار — نوع: ${note_type || 'عامة'}`,
      affected_entity_type: 'advisor_notes', affected_entity_id: note.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, id: note.id });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.primaryRole.includes('advisor')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const { id } = await req.json();
    const supabase = createServiceClient();
    await supabase.from('advisor_notes').delete().eq('id', id).eq('advisor_user_id', user.id);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
