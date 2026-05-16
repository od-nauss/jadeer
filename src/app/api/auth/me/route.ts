import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { ROLES } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * يُرجع بيانات المستخدم الحالي ومسار الصفحة الرئيسية لدوره
 * يستخدم service client لتجاوز RLS — موثوق 100%
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const roleInfo = ROLES[user.primaryRole as keyof typeof ROLES];
    const homePath = roleInfo?.homePath || '/candidate/dashboard';

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      primaryRole: user.primaryRole,
      roles: user.roles,
      isAdmin: user.isAdmin,
      homePath,
    });
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 });
  }
}
