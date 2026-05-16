import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(request: NextRequest) {
  try {
    const caller = await getCurrentUser();
    // مدير النظام فقط يملك صلاحية اعتماد الأدوار الحساسة
    if (!caller || !caller.isAdmin) {
      return NextResponse.json(
        { error: 'هذه العملية متاحة لمدير النظام فقط.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role = 'candidate', action = 'approve', rejectionReason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'معرّف المستخدم مطلوب.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    if (action === 'reject') {
      const { error } = await supabase
        .from('users')
        .update({
          registration_status: 'rejected',
          is_active: false,
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase.from('audit_logs').insert({
        user_id: caller.id,
        user_role: caller.primaryRole,
        operation_type: 'registration_rejected',
        description: `رفض تسجيل المستخدم ${userId}. السبب: ${rejectionReason || 'لم يُحدد'}`,
        affected_entity_type: 'user',
        affected_entity_id: userId,
        sensitivity: 'sensitive',
      });

      return NextResponse.json({ success: true, action: 'rejected' });
    }

    // Approve: activate user and assign role
    const { error: updateError } = await supabase
      .from('users')
      .update({
        registration_status: 'active',
        is_active: true,
      })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Find role record
    const { data: roleRow } = await supabase
      .from('roles')
      .select('id')
      .eq('code', role)
      .single();

    if (roleRow) {
      await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role_id: roleRow.id },
          { onConflict: 'user_id,role_id' }
        );
    }

    // Create candidate_profile if role is candidate
    if (role === 'candidate') {
      const { data: existing } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existing) {
        await supabase.from('candidate_profiles').insert({
          user_id: userId,
          status: 'new',
          completion_score: 0,
        });
      }
    }

    await supabase.from('audit_logs').insert({
      user_id: caller.id,
      user_role: caller.primaryRole,
      operation_type: 'registration_approved',
      description: `الموافقة على تسجيل المستخدم ${userId} بدور: ${role}`,
      affected_entity_type: 'user',
      affected_entity_id: userId,
      sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true, action: 'approved', role });
  } catch (error) {
    console.error('Approve registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع.' },
      { status: 500 }
    );
  }
}
