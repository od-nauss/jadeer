import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/executive/cards
 * Returns all published leadership cards with full user data
 * Uses service client to bypass RLS
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const svc = createServiceClient();

    const { data: cards, error } = await svc
      .from('leadership_cards')
      .select(`
        id, total_score, readiness_score, trust_score, confidence_score,
        readiness_level, leadership_type, is_published, status,
        axis_scores_json, strengths_json, gaps_json,
        ai_summary, governance_summary, approved_at,
        candidate_profile_id,
        candidate_profiles!inner(
          id, user_id,
          users!inner(full_name, job_title, department, email)
        )
      `)
      .eq('is_published', true)
      .order('total_score', { ascending: false });

    if (error) throw error;

    // Normalize: use total_score || readiness_score, trust_score || confidence_score
    const normalized = (cards || []).map(c => ({
      ...c,
      total_score: Number(c.total_score || c.readiness_score || 0),
      trust_score: Number(c.trust_score || c.confidence_score || 0),
    }));

    return NextResponse.json({ cards: normalized });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
