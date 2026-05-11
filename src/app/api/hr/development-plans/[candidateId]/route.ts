import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

// مراجعة الموارد البشرية للخطة
export async function PATCH(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const body = await req.json();
    const supabase = createServiceClient();

    const { data: plan } = await supabase.from('development_plans').select('id').eq('candidate_profile_id', params.candidateId).maybeSingle();
    if (!plan) return NextResponse.json({ error: 'لا توجد خطة تطوير' }, { status: 404 });

    await supabase.from('development_plans').update({
      hr_review_status: body.hr_review_status || 'in_review',
      overall_status: body.overall_status || 'hr_review',
      hr_reviewed_by: user.id,
      start_date: body.start_date || null,
      target_end_date: body.target_end_date || null,
      updated_at: new Date().toISOString(),
    }).eq('id', plan.id);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'development_plan_hr_reviewed',
      description: `مراجعة الموارد البشرية لخطة التطوير — الحالة: ${body.hr_review_status}`,
      affected_entity_type: 'development_plans', affected_entity_id: plan.id, sensitivity: 'normal',
    });
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

// إضافة بند تطوير
export async function POST(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const body = await req.json();
    const supabase = createServiceClient();

    let { data: plan } = await supabase.from('development_plans').select('id').eq('candidate_profile_id', params.candidateId).maybeSingle();
    if (!plan) {
      const { data: lcard } = await supabase.from('leadership_cards').select('readiness_level, development_gaps').eq('candidate_profile_id', params.candidateId).maybeSingle();
      const { data: newPlan } = await supabase.from('development_plans').insert({
        candidate_profile_id: params.candidateId,
        readiness_level: (lcard as any)?.readiness_level || 'promising',
        overall_status: 'hr_review',
        hr_review_status: 'in_review',
        hr_reviewed_by: user.id,
      }).select('id').single();
      plan = newPlan;
    }

    if (!plan) return NextResponse.json({ error: 'فشل إنشاء خطة التطوير' }, { status: 500 });

    const { data: item, error } = await supabase.from('development_plan_items').insert({
      development_plan_id: plan.id,
      skill_gap: body.skill_gap,
      reason: body.reason || null,
      action_type: body.action_type || 'training_program',
      action_description: body.action_description || null,
      responsible_party: body.responsible_party || null,
      success_indicator: body.success_indicator || null,
      target_date: body.target_date || null,
      status: 'not_started',
      notes: body.notes || null,
    }).select('id').single();

    if (error) throw error;
    return NextResponse.json({ success: true, itemId: item.id, planId: plan.id });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
