// POST /api/organization/fit
// ظٹط­ط³ط¨ ط¯ط±ط¬ط© ط§ظ„ظ…ظ„ط§ط،ظ…ط© ط¨ظٹظ† ط¬ظ…ظٹط¹ ط§ظ„ظ…ط±ط´ط­ظٹظ† ط§ظ„ظ…ط¹طھظ…ط¯ظٹظ† ظˆط¬ظ…ظٹط¹ ط§ظ„ظˆط­ط¯ط§طھ ط§ظ„طھظ†ط¸ظٹظ…ظٹط©
// ط£ظˆ ظˆط­ط¯ط© ظˆط§ط­ط¯ط© ط¥ط°ط§ ط£ظڈط±ط³ظ„ unitId

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { computeFitScore } from '@/lib/ai/analyzerFit';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'president', 'hr'].includes(user.primaryRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { unitId, candidateId } = body;

  const service = createServiceClient();

  // ط¬ظ„ط¨ ط§ظ„ط¨ط·ط§ظ‚ط§طھ ط§ظ„ظ‚ظٹط§ط¯ظٹط© ط§ظ„ظ…ط¹طھظ…ط¯ط©
  let cardQuery = service
    .from('leadership_cards')
    .select('id, candidate_profile_id, readiness_level, leadership_type, total_score, trust_score, axis_scores, primary_strengths, development_gaps, candidate_profiles(id, status, completion_score, users(department))')
    .eq('is_published', true);
  if (candidateId) cardQuery = cardQuery.eq('candidate_profile_id', candidateId);
  const { data: cards } = await cardQuery;

  // ط¬ظ„ط¨ ط§ظ„ظˆط­ط¯ط§طھ ط§ظ„طھظ†ط¸ظٹظ…ظٹط©
  let unitQuery = service
    .from('organization_units')
    .select('*, organization_unit_requirements(*)')
    .eq('is_active', true);
  if (unitId) unitQuery = unitQuery.eq('id', unitId);
  const { data: units } = await unitQuery;

  if (!cards?.length || !units?.length) {
    return NextResponse.json({ computed: 0, message: 'No cards or units found' });
  }

  let computed = 0;
  const upserts: any[] = [];

  for (const card of cards) {
    const req_profile = card.candidate_profiles as any;
    const kpiRes = await service.from('kpis').select('id').eq('candidate_id', req_profile?.id).eq('status', 'achieved');
    const initRes = await service.from('initiatives').select('id').eq('candidate_id', req_profile?.id);

    for (const unit of units) {
      const reqs = Array.isArray(unit.organization_unit_requirements)
        ? unit.organization_unit_requirements[0]
        : unit.organization_unit_requirements;

      const result = computeFitScore({
        candidate: {
          readiness_level: card.readiness_level || 'promising',
          leadership_type: card.leadership_type || '',
          total_score: Number(card.total_score) || 0,
          trust_score: Number(card.trust_score) || 0,
          axis_scores: (card.axis_scores as Record<string, number>) || {},
          primary_strengths: (card.primary_strengths as string[]) || [],
          development_gaps: (card.development_gaps as string[]) || [],
          governance_status: req_profile?.status || 'new',
          team_score: (card.axis_scores as any)?.team ?? 50,
          technology_score: (card.axis_scores as any)?.technology ?? 50,
          kpi_count: kpiRes.data?.length || 0,
          initiative_count: initRes.data?.length || 0,
        },
        unit: {
          required_leadership_type: reqs?.required_leadership_type || '',
          required_readiness_level: reqs?.required_readiness_level || 'ready_within_year',
          required_skills: (reqs?.required_skills_json as string[]) || [],
          weights: (reqs?.weights_json as Record<string, number>) || {},
          sensitivity_level: unit.sensitivity_level || 'medium',
          complexity_level: unit.complexity_level || 'medium',
          leadership_need_level: unit.leadership_need_level || 'medium',
          unit_type: unit.unit_type || '',
          employee_count: unit.employee_count || 0,
          is_critical: unit.is_critical || false,
        },
      });

      upserts.push({
        candidate_profile_id: card.candidate_profile_id,
        organization_unit_id: unit.id,
        fit_score: result.fit_score,
        fit_level: result.fit_level,
        confidence_score: result.confidence_score,
        fit_reason: result.fit_reason,
        strengths_match_json: result.strengths_match,
        gaps_json: result.gaps,
        risk_flags_json: result.risk_flags,
        recommended_action: result.recommended_action,
        ai_summary: result.ai_summary,
        updated_at: new Date().toISOString(),
      });
      computed++;
    }
  }

  if (upserts.length > 0) {
    await service.from('position_fit_scores').upsert(upserts, {
      onConflict: 'candidate_profile_id,organization_unit_id',
    });
  }

  await service.from('audit_logs').insert({
    user_id: user.id, action: 'fit_scores_computed',
    entity_type: 'position_fit_scores',
    new_values: { computed, unitId, candidateId },
  });

  return NextResponse.json({ computed });
}
