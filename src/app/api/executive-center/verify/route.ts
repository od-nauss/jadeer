import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // الكلمة الافتراضية: 1170 (من متغيرات البيئة)
    // إذا كان الوضع التجريبي مفعلاً، ادخل دون كلمة مرور
    if (process.env.EXEC_CENTER_NO_PASSWORD === 'true') {
      const cookieStore = cookies();
      cookieStore.set('executive_center_access', 'granted', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24, path: '/' });
      return NextResponse.json({ success: true });
    }

    const defaultCode = process.env.EXECUTIVE_CENTER_DEFAULT_CODE || '1170';

    let isValid = false;

    // أولاً: التحقق من قاعدة البيانات (إن كانت كلمة المرور قد عُدلت)
    try {
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('executive_center_access')
        .select('access_code_hash, is_active')
        .eq('is_active', true)
        .single();

      if (data && data.access_code_hash) {
        // تحقق بسيط (في الإنتاج يمكن استخدام bcrypt)
        // هنا نستخدم crypt المتوفرة في pgcrypto عبر RPC
        const { data: verifyResult } = await supabase.rpc('crypt_check', {
          plain: code,
          hashed: data.access_code_hash,
        });
        if (verifyResult === true) isValid = true;
      }
    } catch {
      // إن لم تكن قاعدة البيانات متوفرة، نعتمد على الافتراضي
    }

    // fallback: مقارنة مباشرة مع الكود الافتراضي
    if (!isValid && code === defaultCode) {
      isValid = true;
    }

    if (!isValid) {
      // تسجيل محاولة دخول خاطئة
      try {
        const supabase = createServiceClient();
        await supabase.from('audit_logs').insert({
          operation_type: 'executive_center_failed_login',
          description: 'محاولة دخول خاطئة لمركز العرض التنفيذي',
          sensitivity: 'sensitive',
          status: 'failure',
        });
      } catch {}

      return NextResponse.json({ success: false }, { status: 401 });
    }

    // تعيين كوكي الجلسة
    const cookieStore = cookies();
    cookieStore.set('executive_center_access', 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 4, // 4 ساعات
      path: '/',
    });

    // تسجيل الدخول الناجح
    try {
      const supabase = createServiceClient();
      await supabase.from('audit_logs').insert({
        operation_type: 'executive_center_login',
        description: 'دخول ناجح لمركز العرض التنفيذي',
        sensitivity: 'sensitive',
      });
      await supabase
        .from('executive_center_access')
        .update({ last_used_at: new Date().toISOString() })
        .eq('is_active', true);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
