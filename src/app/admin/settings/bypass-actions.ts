'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

const COOKIE = 'exec_center_bypass';

export async function setExecBypass(bypass: boolean) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error('Forbidden');

  const cookieStore = cookies();

  if (bypass) {
    cookieStore.set(COOKIE, 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 يوم
      path: '/',
    });
  } else {
    cookieStore.delete(COOKIE);
  }

  // تسجيل في سجل التدقيق
  try {
    const svc = createServiceClient();
    await svc.from('audit_logs').insert({
      user_id: user.id,
      action: bypass ? 'exec_bypass_enabled' : 'exec_bypass_disabled',
      entity_type: 'platform_settings',
      new_values: { exec_bypass: bypass },
    });
  } catch {}
}
