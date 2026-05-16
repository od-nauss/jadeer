import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      employeeNumber,
      jobTitle,
      department,
      role = 'candidate',
      source = 'self',
    } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة ناقصة.' },
        { status: 400 }
      );
    }

    // If source is 'admin', verify the caller is admin or hr
    if (source === 'admin') {
      const caller = await getCurrentUser();
      if (!caller || (!caller.isAdmin && !caller.roles.includes('hr'))) {
        return NextResponse.json(
          { error: 'غير مصرح لك بإنشاء مستخدمين.' },
          { status: 403 }
        );
      }
    }

    const supabase = createServiceClient();

    // إنشاء مستخدم Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'فشل إنشاء المستخدم.' },
        { status: 400 }
      );
    }

    const isAdminSource = source === 'admin';

    // إنشاء سجل في جدول users
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        full_name: fullName,
        employee_number: employeeNumber || null,
        job_title: jobTitle || null,
        department: department || null,
        is_active: isAdminSource,
        registration_status: isAdminSource ? 'active' : 'pending',
      })
      .select('id')
      .single();

    if (userError || !userRow) {
      // rollback
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'فشل إنشاء حساب المستخدم في قاعدة البيانات.' },
        { status: 500 }
      );
    }

    // For admin-created users: assign role immediately
    if (isAdminSource) {
      const { data: roleRow } = await supabase
        .from('roles')
        .select('id')
        .eq('code', role)
        .single();

      if (roleRow) {
        await supabase.from('user_roles').insert({
          user_id: userRow.id,
          role_id: roleRow.id,
        });
      }

      // Create candidate_profile if role is candidate
      if (role === 'candidate') {
        await supabase.from('candidate_profiles').insert({
          user_id: userRow.id,
          status: 'new',
          completion_score: 0,
        });
      }
    }

    // تسجيل في audit_logs
    await supabase.from('audit_logs').insert({
      user_id: userRow.id,
      user_role: isAdminSource ? role : null,
      operation_type: isAdminSource ? 'admin_user_created' : 'user_registered',
      description: isAdminSource ? `إنشاء مستخدم من قِبَل الإدارة بدور: ${role}` : 'تسجيل ذاتي — في انتظار الموافقة',
      sensitivity: 'normal',
    });

    return NextResponse.json({
      success: true,
      userId: userRow.id,
      status: isAdminSource ? 'active' : 'pending',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع.' },
      { status: 500 }
    );
  }
}
