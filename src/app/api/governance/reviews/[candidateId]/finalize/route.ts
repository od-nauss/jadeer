/**
 * POST /api/governance/reviews/[candidateId]/finalize
 * =====================================================
 * دور الذكاء الاصطناعي: يحسب الدرجات ويُصدر البطاقة القيادية
 * دور لجنة الحوكمة: التحقق من سلامة العملية (لا تحيز، مقيّمون موثوقون، إجراءات سليمة)
 *
 * اللجنة لا تُغيّر درجة الذكاء الاصطناعي — بل تُقرّ أن العملية نظيفة أو تُوقفها إذا اكتشفت خللاً
 */

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
      process_approved,       // هل اللجنة تُقرّ سلامة العملية؟
      process_concerns,       // ملاحظات اللجنة على العملية (اختياري)
      reject_reason,          // سبب الرفض إذا رأت اللجنة خللاً جوهرياً
      return_reason,          // سبب الإعادة إذا احتاجت معلومات إضافية
    } = body;

    if (process_approved === undefined) {
      return NextResponse.json({ error: 'يجب تحديد قرار اللجنة (اعتماد العملية أو رفضها)' }, { status: 400 });
    }

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

    // ─── إذا رفضت اللجنة العملية أو أعادتها — لا تُصدر بطاقة ───
    if (!process_approved) {
      const newStatus = reject_reason ? 'returned_for_completion' : 'returned_for_completion';
      await supabase.from('candidate_profiles').update({ status: newStatus }).eq('id', params.candidateId);
      await supabase.from('governance_decisions').insert({
        candidate_profile_id: params.candidateId,
        decision_type: reject_reason ? 'reject' : 'return_for_info',
        new_status: newStatus,
        previous_status: profile.status,
        reason: reject_reason || return_reason || 'أعيد الملف لإكمال المتطلبات',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      });

      const { data: review } = await supabase.from('governance_reviews')
        .select('id').eq('candidate_profile_id', params.candidateId).maybeSingle();
      if (review) {
        await supabase.from('governance_reviews').update({ status: 'returned' }).eq('id', review.id);
      }

      await supabase.from('notifications').insert({
        title: 'ملاحظة من لجنة الحوكمة',
        body: reject_reason || return_reason || 'يرجى مراجعة ملاحظات اللجنة واستكمال المتطلبات.',
        target_role: 'candidate',
      });

      return NextResponse.json({ success: true, action: 'returned', reason: reject_reason || return_reason });
    }

    // ─── الذكاء الاصطناعي يحسب الدرجات الكاملة ───────────────────────
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
    const iniVerified = evalList.filter(e => e.initiative_verifications_json && Object.keys(e.initiative_verifications_json as object).length > 0).length;
    const kpiVerified = evalList.filter(e => e.kpi_verifications_json && Object.keys(e.kpi_verifications_json as object).length > 0).length;

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
        initiative_verification_rate: Math.round((iniVerified / Math.max(evalList.length, 1)) * 100),
        kpi_verification_rate: Math.round((kpiVerified / Math.max(evalList.length, 1)) * 100),
      } : null,
    };

    // ─── الذكاء الاصطناعي يُصدر النتيجة الكاملة ──────────────────────
    const computed = computeGovernanceScore(scoreInput);

    // ملاحظة اللجنة على العملية (تُضاف كـ context، لا تُغيّر الدرجة)
    const governanceSummary = [
      `بطاقة صادرة بمحلل الذكاء الاصطناعي — اعتمدت لجنة الحوكمة سلامة العملية.`,
      process_concerns ? `ملاحظة اللجنة: ${process_concerns}` : '',
      computed.governance_recommendation,
    ].filter(Boolean).join(' ');

    // ─── إنشاء/تحديث البطاقة القيادية ────────────────────────────────
    const { data: existingCard } = await supabase
      .from('leadership_cards')
      .select('id')
      .eq('candidate_profile_id', params.candidateId)
      .maybeSingle();

    const cardData = {
      candidate_profile_id: params.candidateId,
      total_score: computed.total_score,
      trust_score: computed.trust_score,
      readiness_level: computed.readiness_level,
      leadership_type: computed.leadership_type,
      axis_scores_json: computed.axis_scores,
      strengths_json: computed.primary_strengths,
      gaps_json: computed.development_gaps,
      ai_summary: computed.ai_summary,
      governance_summary: governanceSummary,
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

    // ─── تحديث حالة الملف وسجل المراجعة ─────────────────────────────
    await supabase.from('candidate_profiles').update({ status: 'approved' }).eq('id', params.candidateId);

    await supabase.from('governance_decisions').insert({
      candidate_profile_id: params.candidateId,
      decision_type: 'approve',
      new_status: 'approved',
      previous_status: profile.status,
      new_classification: computed.readiness_level,
      reason: `اعتمدت اللجنة سلامة العملية — الدرجة صادرة من محلل الذكاء الاصطناعي: ${computed.total_score}%`,
      committee_note: process_concerns || null,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    });

    const { data: review } = await supabase.from('governance_reviews')
      .select('id').eq('candidate_profile_id', params.candidateId).maybeSingle();
    if (review) {
      await supabase.from('governance_reviews').update({
        status: 'approved',
        readiness_score: computed.total_score,
        confidence_score: computed.trust_score,
        ai_summary: computed.ai_summary,
      }).eq('id', review.id);
    }

    // ─── خطة تطوير تلقائية إذا وجدت فجوات ──────────────────────────
    if (computed.development_gaps.length > 0 && computed.readiness_level !== 'not_suitable') {
      await supabase.from('development_plans').upsert({
        candidate_profile_id: params.candidateId,
        readiness_level: computed.readiness_level,
        leadership_type: computed.leadership_type,
        overall_status: 'proposed',
        ai_recommendations_json: {
          gaps: computed.development_gaps,
          recommendation: computed.governance_recommendation,
          axis_scores: computed.axis_scores,
        },
      }, { onConflict: 'candidate_profile_id' });
    }

    // ─── تنبيهات تلقائية ─────────────────────────────────────────────
    await Promise.all([
      // إشعار للمرشح
      supabase.from('notifications').insert({
        title: 'بطاقتك القيادية جاهزة',
        body: `أصدر الذكاء الاصطناعي بطاقتك القيادية — تصنيفك: "${computed.readiness_label}" بدرجة ${computed.total_score}٪. اعتمدت لجنة الحوكمة سلامة التقييم.`,
        target_role: 'candidate',
      }),
      // تنبيه للرئيس
      supabase.from('executive_alerts').insert({
        alert_type: 'new_card_published',
        candidate_profile_id: params.candidateId,
        severity: computed.total_score >= 80 ? 'high' : 'medium',
        title: `بطاقة قيادية جديدة — ${computed.readiness_label}`,
        message: `صدرت بطاقة قيادية جديدة بدرجة ${computed.total_score}٪ (${computed.leadership_type})`,
        recommended_action: computed.governance_recommendation,
      }),
      // إشعار للموارد البشرية
      supabase.from('notifications').insert({
        title: 'بطاقة قيادية جديدة تحتاج خطة تطوير',
        body: `صدرت بطاقة مرشح جديدة — يُوصى بإعداد خطة تطوير مبنية على ${computed.development_gaps.length} فجوة محددة.`,
        target_role: 'hr',
      }),
    ]);

    // ─── سجل التدقيق ──────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'governance_finalized_ai_card',
      entity_type: 'leadership_cards',
      entity_id: cardId,
      new_values: {
        total_score: computed.total_score,
        readiness_level: computed.readiness_level,
        leadership_type: computed.leadership_type,
        process_approved: true,
        process_concerns: process_concerns || null,
      },
    });

    return NextResponse.json({
      success: true,
      card_id: cardId,
      ai_score: computed.total_score,
      readiness_level: computed.readiness_level,
      leadership_type: computed.leadership_type,
      trust_score: computed.trust_score,
      special_flags: computed.special_flags,
      message: `البطاقة القيادية صادرة من الذكاء الاصطناعي — اعتمدت اللجنة سلامة العملية`,
    });

  } catch (err) {
    console.error('[governance/finalize]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
