import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح — مدير النظام فقط' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;
    const targetUserId = params.id;
    const supabase = createServiceClient();

    if (action === 'change_role') {
      const { role } = body;
      if (!role) return NextResponse.json({ error: 'الدور مطلوب' }, { status: 400 });

      // جلب الدور من جدول roles
      const { data: roleData, error: roleErr } = await supabase
        .from('roles')
        .select('id, code, name_ar')
        .eq('code', role)
        .maybeSingle();

      if (roleErr || !roleData) {
        return NextResponse.json({ error: 'الدور غير موجود' }, { status: 400 });
      }

      // حذف الأدوار الحالية للمستخدم
      await supabase.from('user_roles').delete().eq('user_id', targetUserId);

      // إضافة الدور الجديد
      const { error: insertErr } = await supabase.from('user_roles').insert({
        user_id: targetUserId,
        role_id: roleData.id,
      });

      if (insertErr) throw insertErr;

      // سجل التدقيق
      await supabase.from('audit_logs').insert({
        user_id: currentUser.id,
        user_role: currentUser.primaryRole,
        operation_type: 'user_role_changed',
        description: `تغيير دور المستخدم ${targetUserId} إلى ${roleData.name_ar}`,
        sensitivity: 'high',
      }).then(() => {});

      return NextResponse.json({ success: true, role: roleData });
    }

    if (action === 'toggle_active') {
      const { is_active } = body;
      const { error } = await supabase
        .from('users')
        .update({ is_active })
        .eq('id', targetUserId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: currentUser.id,
        user_role: currentUser.primaryRole,
        operation_type: is_active ? 'user_activated' : 'user_deactivated',
        description: `${is_active ? 'تفعيل' : 'تعطيل'} المستخدم ${targetUserId}`,
        sensitivity: 'high',
      }).then(() => {});

      return NextResponse.json({ success: true, is_active });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
