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

    // الأدوار الحساسة لا يُنشئها إلا مدير النظام
    if (source === 'admin') {
      const caller = await getCurrentUser();
      if (!caller || !caller.isAdmin) {
        return NextResponse.json(
          { error: 'إنشاء المستخدمين بالأدوار الحساسة متاح لمدير النظام فقط.' },
          { status: 403 }
        );
      }
    }

    // منع التسجيل الذاتي بأدوار حساسة
    const PRIVILEGED_ROLES = ['admin', 'president', 'governance', 'hr', 'advisor'];
    if (source === 'self' && PRIVILEGED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'لا يمكن التسجيل الذاتي بهذا الدور. تواصل مع مدير النظام.' },
        { status: 403 }
      );
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
    // المرشح القيادي (التسجيل الذاتي) يُفعَّل فوراً — لا انتظار
    const isActiveImmediately = isAdminSource || role === 'candidate';

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
        is_active: isActiveImmediately,
        registration_status: 'active',
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

    // تعيين الدور فوراً لجميع الحالات النشطة
    if (isActiveImmediately) {
      const assignRole = isAdminSource ? role : 'candidate';
      const { data: roleRow } = await supabase
        .from('roles')
        .select('id')
        .eq('code', assignRole)
        .single();

      if (roleRow) {
        await supabase.from('user_roles').insert({
          user_id: userRow.id,
          role_id: roleRow.id,
        });
      }

      // إنشاء ملف مرشح تلقائياً لأي مستخدم بدور candidate
      if (assignRole === 'candidate') {
        await supabase.from('candidate_profiles').insert({
          user_id: userRow.id,
          status: 'new',
          completion_score: 0,
        });
      }
    }

    await supabase.from('audit_logs').insert({
      user_id: userRow.id,
      user_role: isAdminSource ? role : 'candidate',
      operation_type: isAdminSource ? 'admin_user_created' : 'candidate_registered',
      description: isAdminSource
        ? `إنشاء مستخدم من قِبَل مدير النظام بدور: ${role}`
        : 'تسجيل ذاتي كمرشح قيادي — دخول فوري',
      sensitivity: 'normal',
    });

    return NextResponse.json({
      success: true,
      userId: userRow.id,
      status: 'active',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع.' },
      { status: 500 }
    );
  }
}
