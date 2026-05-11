import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const { full_name, email, job_title, department, relationship_type, notes, can_verify_initiatives, can_verify_kpis } = body;

    if (!full_name || !email || !relationship_type) {
      return NextResponse.json({ error: 'الاسم والبريد والصلة مطلوبة' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // التحقق من عدم تكرار البريد
    const { data: dupCheck } = await supabase
      .from('approved_evaluators')
      .select('id')
      .eq('candidate_profile_id', params.candidateId)
      .eq('email', email)
      .maybeSingle();

    if (dupCheck) return NextResponse.json({ error: 'هذا البريد مسجل مسبقاً في قائمة المقيمين' }, { status: 409 });

    const { data: approved, error } = await supabase
      .from('approved_evaluators')
      .insert({
        candidate_profile_id: params.candidateId,
        nominee_id: null,
        full_name,
        email,
        job_title: job_title || null,
        department: department || null,
        relationship_type,
        approved_by_committee: true,
        added_by_committee: true,
        committee_selected: true,
        can_verify_initiatives: can_verify_initiatives || false,
        can_verify_kpis: can_verify_kpis || false,
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'evaluator_added_by_committee',
      description: `إضافة مقيم من اللجنة: ${full_name}`,
      affected_entity_type: 'approved_evaluators',
      affected_entity_id: approved.id,
      sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true, approvedId: approved.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
