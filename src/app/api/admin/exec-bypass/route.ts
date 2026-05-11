// POST /api/admin/exec-bypass — يفعّل أو يعطّل مركز العرض بدون كلمة مرور
// يستخدم cookie مباشرة بدون الحاجة لتعديل قاعدة البيانات
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/current-user';

const BYPASS_COOKIE = 'exec_center_bypass';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const { bypass } = await req.json();
  const response = NextResponse.json({ ok: true, bypass_active: !!bypass });

  response.cookies.set(BYPASS_COOKIE, bypass ? 'granted' : '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: bypass ? 60 * 60 * 24 * 30 : 0,
    path: '/',
  });

  return response;
}

export async function GET() {
  const cookieStore = cookies();
  const c = cookieStore.get(BYPASS_COOKIE);
  return NextResponse.json({ bypass_active: c?.value === 'granted' });
}
