import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { analyzeInitiative } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'أكمل ملفك القيادي أولاً' }, { status: 400 });

    const iniData = {
      candidate_profile_id: profile.id,
      name: body.name,
      initiative_type: body.initiative_type || null,
      problem_description: body.problem_description || null,
      idea: body.idea || null,
      candidate_role: body.candidate_role || null,
      was_idea_owner: body.was_idea_owner || false,
      led_implementation: body.led_implementation || false,
      participated_implementation: body.participated_implementation || false,
      coordinated_parties: body.coordinated_parties || false,
      developed_tool: body.developed_tool || false,
      tracked_impact: body.tracked_impact || false,
      beneficiary_group: body.beneficiary_group || null,
      beneficiary_count: body.beneficiary_count ? Number(body.beneficiary_count) : null,
      achieved_impact: body.achieved_impact || null,
      impact_metrics: body.impact_metrics || null,
      duration: body.duration || null,
      is_sustainable: body.is_sustainable || false,
      is_generalizable: body.is_generalizable || false,
      innovation_level: body.innovation_level || null,
      organization_alignment: body.organization_alignment || null,
      evidence: body.evidence || null,
      notes: body.notes || null,
      status: 'draft',
    };

    const { data: initiative, error } = await supabase
      .from('initiatives')
      .insert(iniData)
      .select('id')
      .single();

    if (error) throw error;

    // التحليل الذكي
    const analysis = analyzeInitiative(iniData as Record<string, unknown>);
    await supabase.from('initiatives').update({
      ai_score: analysis.overall.score,
      ai_feedback: analysis.feedback,
    }).eq('id', initiative.id);

    await supabase.from('ai_analysis_logs').insert({
      candidate_profile_id: profile.id,
      source_type: 'initiative',
      source_id: initiative.id,
      analysis_summary: `مبادرة: ${body.name} | القوة الكلية: ${analysis.overall.score}`,
      scores_json: {
        impact_clarity: analysis.impact_clarity.score,
        role_clarity: analysis.role_clarity.score,
        verifiability: analysis.verifiability.score,
        innovation: analysis.innovation.score,
        overall: analysis.overall.score,
      },
      recommendations_json: analysis.feedback,
      confidence_score: analysis.overall.score,
      ai_provider: 'rules_engine',
      ai_model: 'jadeer_v1',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: user.primaryRole,
      operation_type: 'initiative_created',
      description: `إضافة مبادرة: ${body.name}`,
      affected_entity_type: 'initiatives',
      affected_entity_id: initiative.id,
      sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, id: initiative.id, analysis });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
