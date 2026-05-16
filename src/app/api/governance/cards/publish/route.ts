import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    if (!user.isAdmin && !user.roles.includes('governance')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { cardId, publish, profileId } = await req.json();
    if (!cardId && !profileId) return NextResponse.json({ error: 'معرّف مفقود' }, { status: 400 });

    const svc = createServiceClient();

    // تحديث البطاقة
    let query = svc.from('leadership_cards').update({
      is_published: !!publish,
      status: publish ? 'approved' : 'draft',
      updated_at: new Date().toISOString(),
    });

    if (cardId) {
      query = query.eq('id', cardId) as typeof query;
    } else {
      query = query.eq('candidate_profile_id', profileId) as typeof query;
    }

    const { error: cardErr } = await query;
    if (cardErr) throw cardErr;

    // تحديث حالة الملف إذا تم النشر
    if (publish && profileId) {
      await svc.from('candidate_profiles').update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      }).eq('id', profileId);
    }

    return NextResponse.json({ success: true, published: !!publish });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
