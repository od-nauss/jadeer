import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { analyzeKpi } from '@/lib/ai/analyzer';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });
    const { data: kpi } = await supabase.from('kpis').select('id, candidate_profile_id').eq('id', params.id).maybeSingle();
    if (!kpi || kpi.candidate_profile_id !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const body = await request.json();
    const updateData = {
      name: body.name, kpi_type: body.kpi_type || null, purpose: body.purpose || null,
      problem_addressed: body.problem_addressed || null, target_value: body.target_value || null,
      actual_value: body.actual_value || null, used_in_decision: body.used_in_decision || null,
      team_impact: body.team_impact || null, is_officially_approved: body.is_officially_approved || false,
      team_participated: body.team_participated || false, evidence: body.evidence || null, notes: body.notes || null,
    };
    const analysis = analyzeKpi(updateData as Record<string, unknown>);
    await supabase.from('kpis').update({ ...updateData, ai_score: analysis.overall.score, ai_feedback: analysis.feedback }).eq('id', params.id);
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
    const { data: kpi } = await supabase.from('kpis').select('id, candidate_profile_id, name').eq('id', params.id).maybeSingle();
    if (!kpi || kpi.candidate_profile_id !== profile.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    await supabase.from('kpis').delete().eq('id', params.id);
    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'kpi_deleted', description: `حذف مؤشر: ${kpi.name}`,
      affected_entity_type: 'kpis', affected_entity_id: params.id, sensitivity: 'normal',
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
