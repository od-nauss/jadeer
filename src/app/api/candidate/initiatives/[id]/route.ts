import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { analyzeInitiative } from '@/lib/ai/analyzer';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    const { data: ini } = await supabase.from('initiatives').select('id, candidate_profile_id, status').eq('id', params.id).maybeSingle();
    if (!ini || ini.candidate_profile_id !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    if (ini.status === 'submitted') return NextResponse.json({ error: 'لا يمكن التعديل بعد الإرسال' }, { status: 400 });

    const body = await request.json();
    const updateData = {
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
    };

    const analysis = analyzeInitiative(updateData as Record<string, unknown>);

    await supabase.from('initiatives').update({
      ...updateData,
      ai_score: analysis.overall.score,
      ai_feedback: analysis.feedback,
    }).eq('id', params.id);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'initiative_updated',
      description: `تعديل مبادرة: ${body.name}`,
      affected_entity_type: 'initiatives', affected_entity_id: params.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    const { data: ini } = await supabase.from('initiatives').select('id, candidate_profile_id, status, name').eq('id', params.id).maybeSingle();
    if (!ini || ini.candidate_profile_id !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    if (ini.status === 'submitted') return NextResponse.json({ error: 'لا يمكن الحذف بعد الإرسال' }, { status: 400 });

    await supabase.from('initiatives').delete().eq('id', params.id);
    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'initiative_deleted',
      description: `حذف مبادرة: ${ini.name}`,
      affected_entity_type: 'initiatives', affected_entity_id: params.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
