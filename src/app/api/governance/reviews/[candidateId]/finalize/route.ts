import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { computeGovernanceScore } from '@/lib/ai/analyzerGovernance';

export async function POST(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const {
      reason, committee_note,
      override_score, override_level, override_leadership_type,
      primary_strengths_override, development_gaps_override,
    } = body;

    if (!reason) return NextResponse.json({ error: 'سبب القرار مطلوب' }, { status: 400 });

    const supabase = createServiceClient();

    // جلب كل بيانات المرشح
    const [{ data: profile }, { data: initiatives }, { data: kpis }, { data: assessments }, { data: evaluations }] = await Promise.all([
      supabase.from('candidate_profiles').select('*').eq('id', params.candidateId).maybeSingle(),
      supabase.from('initiatives').select('ai_score, achieved_impact, impact_metrics, evidence, is_sustainable').eq('candidate_profile_id', params.candidateId),
      supabase.from('kpis').select('ai_score, target_value, actual_value, used_in_decision, is_officially_approved').eq('candidate_profile_id', params.candidateId),
      supabase.from('assessment_results').select('assessment_id, score, thinking_pattern, assessments(code)').eq('candidate_profile_id', params.candidateId).eq('status', 'completed'),
      supabase.from('evaluations_360').select('overall_score, trust_score, scores_json, initiative_verifications_json, kpi_verifications_json, is_extreme').eq('candidate_profile_id', params.candidateId),
    ]);

    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    const evalList = evaluations || [];
    const teamScores = evalList.map(e => {
      const scores = (e.scores_json || {}) as Record<string, { score: number }>;
      const teamKeys = ['team_satisfaction', 'team_development', 'communication'];
      const vals = teamKeys.map(k => scores[k]?.score).filter(Boolean) as number[];
      return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length - 1) / 4 * 100 : 50;
    });
    const avgTeam = teamScores.length > 0 ? teamScores.reduce((a, b) => a + b, 0) / teamScores.length : 55;
    const avgOverall = evalList.length > 0
      ? evalList.map(e => Number(e.overall_score) || 0).reduce((a, b) => a + b, 0) / evalList.length : 0;

    const iniVerified = evalList.filter(e => e.initiative_verifications_json && Object.keys(e.initiative_verifications_json).length > 0).length;
    const kpiVerified = evalList.filter(e => e.kpi_verifications_json && Object.keys(e.kpi_verifications_json).length > 0).length;

    const scoreInput = {
      profile: {
        completion_score: profile.completion_score || 0,
        years_of_experience: profile.years_of_experience,
        internal_experience: profile.internal_experience,
        led_projects: profile.led_projects,
        committee_participations: profile.committee_participations,
      },
      initiatives: (initiatives || []).map(i => ({
        ai_score: i.ai_score || 0,
        achieved_impact: i.achieved_impact,
        impact_metrics: i.impact_metrics,
        evidence: i.evidence,
        is_sustainable: i.is_sustainable,
      })),
      kpis: (kpis || []).map(k => ({
        ai_score: k.ai_score || 0,
        target_value: k.target_value,
        actual_value: k.actual_value,
        used_in_decision: k.used_in_decision,
        is_officially_approved: k.is_officially_approved,
      })),
      assessmentResults: (assessments || []).map(a => ({
        assessment_code: (a as any).assessments?.code || '',
        score: a.score || 0,
        thinking_pattern: a.thinking_pattern || '',
      })),
      evaluation360: evalList.length > 0 ? {
        overall_score: avgOverall,
        team_satisfaction_score: avgTeam,
        confidence_level: 70,
        extreme_count: evalList.filter(e => e.is_extreme).length,
        evaluators_count: evalList.length,
        initiative_verification_rate: Math.round((iniVerified / evalList.length) * 100),
        kpi_verification_rate: Math.round((kpiVerified / evalList.length) * 100),
      } : null,
    };

    const computed = computeGovernanceScore(scoreInput);

    // استخدام قيم اللجنة إذا عُدّلت
    const finalScore = override_score ?? computed.total_score;
    const finalLevel = override_level ?? computed.readiness_level;
    const finalLeadershipType = override_leadership_type ?? computed.leadership_type;
    const finalStrengths = primary_strengths_override ?? computed.primary_strengths;
    const finalGaps = development_gaps_override ?? computed.development_gaps;
    const finalTrust = computed.trust_score;

    // إنشاء البطاقة القيادية أو تحديثها
    const { data: existingCard } = await supabase
      .from('leadership_cards')
      .select('id')
      .eq('candidate_profile_id', params.candidateId)
      .maybeSingle();

    const cardData = {
      candidate_profile_id: params.candidateId,
      total_score: finalScore,
      trust_score: finalTrust,
      readiness_level: finalLevel,
      leadership_type: finalLeadershipType,
      axis_scores: computed.axis_scores,
      primary_strengths: finalStrengths,
      development_gaps: finalGaps,
      ai_summary: computed.ai_summary,
      governance_summary: committee_note || computed.governance_recommendation,
      special_tags: computed.special_flags,
      is_published: true,
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    };

    let cardId: string;
    if (existingCard) {
      await supabase.from('leadership_cards').update(cardData).eq('id', existingCard.id);
      cardId = existingCard.id;
    } else {
      const { data: newCard } = await supabase.from('leadership_cards').insert(cardData).select('id').single();
      cardId = newCard!.id;
    }

    // تحديث حالة الملف
    await supabase.from('candidate_profiles').update({ status: 'approved' }).eq('id', params.candidateId);

    // تسجيل القرار النهائي
    await supabase.from('governance_decisions').insert({
      candidate_profile_id: params.candidateId,
      decision_type: 'approve',
      new_status: 'approved',
      previous_status: profile.status,
      new_classification: finalLevel,
      reason,
      committee_note: committee_note || null,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    });

    // تحديث سجل المراجعة
    const { data: review } = await supabase.from('governance_reviews').select('id').eq('candidate_profile_id', params.candidateId).maybeSingle();
    if (review) {
      await supabase.from('governance_reviews').update({
        status: 'approved',
        readiness_score: finalScore,
        confidence_score: finalTrust,
      }).eq('id', review.id);
    }

    // إنشاء خطة تطوير تلقائية إذا وجدت فجوات
    if (finalGaps.length > 0 && finalLevel !== 'not_suitable') {
      await supabase.from('development_plans').upsert({
        candidate_profile_id: params.candidateId,
        readiness_level: finalLevel,
        leadership_type: finalLeadershipType,
        overall_status: 'proposed',
        ai_recommendations_json: {
          gaps: finalGaps,
          recommendation: computed.governance_recommendation,
        },
      }, { onConflict: 'candidate_profile_id' });
    }

    // إشعارات
    await Promise.all([
      supabase.from('notifications').insert({
        title: 'تم اعتماد بطاقتك القيادية',
        body: `اعتمدت لجنة الحوكمة تصنيفك: "${computed.readiness_label}" بدرجة ${finalScore}٪. يمكنك مراجعة بطاقتك الآن.`,
        target_role: 'candidate',
      }),
      supabase.from('notifications').insert({
        title: 'بطاقة قيادية معتمدة',
        body: `صدرت بطاقة قيادية جديدة بتصنيف "${computed.readiness_label}".`,
        target_role: 'president',
      }),
    ]);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'leadership_card_approved',
      description: `اعتماد البطاقة القيادية: ${computed.readiness_label} — ${finalScore}٪`,
      affected_entity_type: 'leadership_cards',
      affected_entity_id: cardId,
      sensitivity: 'critical',
    });

    return NextResponse.json({
      success: true, cardId,
      total_score: finalScore, trust_score: finalTrust,
      readiness_level: finalLevel, readiness_label: computed.readiness_label,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
