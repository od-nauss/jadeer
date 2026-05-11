import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.primaryRole.includes('president'))) {
      return NextResponse.json({ error: 'غير مصرح — هذه الصلاحية للرئيس فقط' }, { status: 403 });
    }

    const body = await req.json();
    const {
      advisor_user_id, access_type = 'all_reports',
      candidate_id, organization_unit_id, competition_id,
      can_view_reports = true, can_view_cards = true,
      can_view_fit_map = false, can_add_notes = true,
      expires_days, justification,
    } = body;

    if (!advisor_user_id) return NextResponse.json({ error: 'معرّف المستشار مطلوب' }, { status: 400 });

    const supabase = createServiceClient();

    // التحقق أن المستشار موجود وله دور advisor
    const { data: advisorUser } = await supabase
      .from('users')
      .select('id, full_name, user_roles!inner(roles!inner(code))')
      .eq('id', advisor_user_id)
      .maybeSingle();

    if (!advisorUser) return NextResponse.json({ error: 'المستشار غير موجود' }, { status: 404 });

    const expiresAt = expires_days
      ? new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: access, error } = await supabase
      .from('advisor_access')
      .insert({
        advisor_user_id,
        granted_by: user.id,
        access_type,
        candidate_id: candidate_id || null,
        organization_unit_id: organization_unit_id || null,
        competition_id: competition_id || null,
        can_view_reports,
        can_view_cards,
        can_view_fit_map,
        can_add_notes,
        justification: justification || null,
        expires_at: expiresAt,
        status: 'active',
      })
      .select('id')
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'advisor_access_granted',
      description: `منح صلاحية اطلاع للمستشار: ${(advisorUser as any).full_name} — نوع: ${access_type}`,
      affected_entity_type: 'advisor_access', affected_entity_id: access.id, sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true, accessId: access.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
