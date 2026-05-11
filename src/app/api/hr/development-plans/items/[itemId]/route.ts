import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const body = await req.json();
    const supabase = createServiceClient();
    await supabase.from('development_plan_items').update({
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.action_description !== undefined && { action_description: body.action_description }),
      ...(body.target_date !== undefined && { target_date: body.target_date }),
      updated_at: new Date().toISOString(),
    }).eq('id', params.itemId);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const supabase = createServiceClient();
    await supabase.from('development_plan_items').delete().eq('id', params.itemId);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
