import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { ROLES } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح', authenticated: false }, { status: 401 });
    }

    // مستخدم معلّق أو مرفوض
    if (user.registrationStatus === 'pending') {
      return NextResponse.json({
        authenticated: true,
        registrationStatus: 'pending',
        homePath: '/pending-approval',
      });
    }

    if (user.registrationStatus === 'rejected') {
      return NextResponse.json({
        authenticated: true,
        registrationStatus: 'rejected',
        homePath: '/pending-approval?status=rejected',
      });
    }

    const roleInfo = ROLES[user.primaryRole as keyof typeof ROLES];
    const homePath = roleInfo?.homePath || '/candidate/dashboard';

    return NextResponse.json({
      authenticated: true,
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      primaryRole: user.primaryRole,
      roles: user.roles,
      isAdmin: user.isAdmin,
      homePath,
      registrationStatus: 'active',
    });
  } catch (err) {
    console.error('[api/auth/me]', err);
    return NextResponse.json({ error: 'خطأ داخلي', authenticated: false }, { status: 500 });
  }
}
