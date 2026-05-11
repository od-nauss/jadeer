import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function DELETE(_: NextRequest, { params }: { params: { accessId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('president'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const supabase = createServiceClient();
    await supabase.from('advisor_access').update({ status: 'revoked' }).eq('id', params.accessId);
    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'advisor_access_revoked',
      description: 'إلغاء صلاحية مستشار',
      affected_entity_type: 'advisor_access', affected_entity_id: params.accessId, sensitivity: 'sensitive',
    });
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: { accessId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('president'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const body = await req.json();
    const supabase = createServiceClient();
    await supabase.from('advisor_access').update({
      can_view_reports: body.can_view_reports,
      can_view_cards: body.can_view_cards,
      can_view_fit_map: body.can_view_fit_map,
      can_add_notes: body.can_add_notes,
    }).eq('id', params.accessId);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
