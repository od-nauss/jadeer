import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const body = await req.json();
    const supabase = createServiceClient();
    const { data: comp } = await supabase.from('competitions').select('status').eq('id', params.id).maybeSingle();
    if (!comp) return NextResponse.json({ error: 'مسابقة غير موجودة' }, { status: 404 });
    if (comp.status === 'archived') return NextResponse.json({ error: 'المسابقة مؤرشفة' }, { status: 400 });

    await supabase.from('competitions').update({
      ...(body.title && { title: body.title }),
      ...(body.status && { status: body.status }),
      ...(body.start_date !== undefined && { start_date: body.start_date }),
      ...(body.end_date !== undefined && { end_date: body.end_date }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.objective !== undefined && { objective: body.objective }),
      updated_at: new Date().toISOString(),
    }).eq('id', params.id);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'competition_updated',
      description: `تحديث مسابقة${body.status ? ` — الحالة: ${body.status}` : ''}`,
      affected_entity_type: 'competitions', affected_entity_id: params.id, sensitivity: 'normal',
    });
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

// إضافة مرشح
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const { candidate_profile_id } = await req.json();
    if (!candidate_profile_id) return NextResponse.json({ error: 'معرف المرشح مطلوب' }, { status: 400 });
    const supabase = createServiceClient();
    const { data: existing } = await supabase.from('competition_candidates').select('id').eq('competition_id', params.id).eq('candidate_profile_id', candidate_profile_id).maybeSingle();
    if (existing) return NextResponse.json({ error: 'المرشح مضاف مسبقاً' }, { status: 409 });
    const { data, error } = await supabase.from('competition_candidates').insert({ competition_id: params.id, candidate_profile_id, status: 'applied' }).select('id').single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: user.id, user_role: user.primaryRole, operation_type: 'competition_candidate_added', description: 'إضافة مرشح لمسابقة', affected_entity_type: 'competition_candidates', affected_entity_id: data.id, sensitivity: 'normal' });
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
