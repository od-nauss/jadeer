// GET /api/admin/exec-bypass?v=1  → يفعّل الـ bypass ثم يعيد توجيه للإعدادات
// GET /api/admin/exec-bypass?v=0  → يعطّل الـ bypass ثم يعيد توجيه للإعدادات
// استخدام full navigation (وليس fetch) لضمان حفظ الـ cookie بشكل موثوق

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

const COOKIE = 'exec_center_bypass';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  const bypass = req.nextUrl.searchParams.get('v') === '1';
  const response = NextResponse.redirect(new URL('/admin/settings', req.url));

  if (bypass) {
    response.cookies.set(COOKIE, 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 يوم
      path: '/',
    });
  } else {
    response.cookies.set(COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  try {
    const svc = createServiceClient();
    await svc.from('audit_logs').insert({
      user_id: user.id,
      action: bypass ? 'exec_bypass_enabled' : 'exec_bypass_disabled',
      entity_type: 'platform_settings',
      new_values: { exec_bypass: bypass },
    });
  } catch {}

  return response;
}

// POST للحالة المساعدة
export async function POST() {
  return NextResponse.json({ error: 'استخدم GET مع ?v=1 أو ?v=0' }, { status: 405 });
}
