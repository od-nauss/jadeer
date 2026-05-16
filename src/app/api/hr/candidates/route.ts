import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/candidates
 * يستخدم service client لتجاوز RLS وجلب جميع بيانات المرشحين لفريق الموارد البشرية
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // تحقق من الدور — HR أو Admin فقط
    if (!user.isAdmin && !user.roles.includes('hr') && !user.roles.includes('president') && !user.roles.includes('advisor')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const svc = createServiceClient();

    // جلب الملفات مع بيانات المستخدم والبطاقات — service client يتجاوز RLS
    const { data: profiles, error } = await svc
      .from('candidate_profiles')
      .select(`
        id, status, completion_score, evaluation_track, updated_at,
        users(id, full_name, job_title, department, email),
        leadership_cards(readiness_level, total_score, readiness_score, is_published)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ profiles: profiles || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
