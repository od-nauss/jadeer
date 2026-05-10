import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, employeeNumber, jobTitle, department } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة ناقصة.' },
        { status: 400 }
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
        is_active: true,
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

    // ربط الدور candidate (المستخدم العادي)
    const { data: candidateRole } = await supabase
      .from('roles')
      .select('id')
      .eq('code', 'candidate')
      .single();

    if (candidateRole) {
      await supabase.from('user_roles').insert({
        user_id: userRow.id,
        role_id: candidateRole.id,
      });
    }

    // إنشاء candidate_profile فارغ
    await supabase.from('candidate_profiles').insert({
      user_id: userRow.id,
      status: 'new',
      completion_score: 0,
    });

    // تسجيل في audit_logs
    await supabase.from('audit_logs').insert({
      user_id: userRow.id,
      user_role: 'candidate',
      operation_type: 'user_registered',
      description: 'إنشاء حساب جديد',
      sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, userId: userRow.id });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع.' },
      { status: 500 }
    );
  }
}
