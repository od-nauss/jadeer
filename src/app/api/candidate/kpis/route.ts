import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { analyzeKpi } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const supabase = createServiceClient();

    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'أكمل ملفك القيادي أولاً' }, { status: 400 });

    const kpiData = {
      candidate_profile_id: profile.id,
      name: body.name,
      kpi_type: body.kpi_type || null,
      purpose: body.purpose || null,
      problem_addressed: body.problem_addressed || null,
      target_value: body.target_value || null,
      actual_value: body.actual_value || null,
      used_in_decision: body.used_in_decision || null,
      team_impact: body.team_impact || null,
      is_officially_approved: body.is_officially_approved || false,
      team_participated: body.team_participated || false,
      evidence: body.evidence || null,
      notes: body.notes || null,
      status: 'draft',
    };

    const { data: kpi, error } = await supabase.from('kpis').insert(kpiData).select('id').single();
    if (error) throw error;

    const analysis = analyzeKpi(kpiData as Record<string, unknown>);
    await supabase.from('kpis').update({ ai_score: analysis.overall.score, ai_feedback: analysis.feedback }).eq('id', kpi.id);

    await supabase.from('ai_analysis_logs').insert({
      candidate_profile_id: profile.id,
      source_type: 'kpi',
      source_id: kpi.id,
      analysis_summary: `مؤشر: ${body.name} | النضج: ${analysis.overall.score}`,
      scores_json: {
        definition_quality: analysis.definition_quality.score,
        measurement_quality: analysis.measurement_quality.score,
        decision_impact: analysis.decision_impact.score,
        overall: analysis.overall.score,
      },
      recommendations_json: analysis.feedback,
      confidence_score: analysis.overall.score,
      ai_provider: 'rules_engine',
      ai_model: 'jadeer_v1',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'kpi_created',
      description: `إضافة مؤشر: ${body.name}`,
      affected_entity_type: 'kpis', affected_entity_id: kpi.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, id: kpi.id, analysis });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
