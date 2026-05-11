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
    const { nomineeId, committee_selected = false, notes } = body;

    if (!nomineeId) return NextResponse.json({ error: 'nomineeId مطلوب' }, { status: 400 });

    const supabase = createServiceClient();

    // جلب بيانات المرشح المقترح
    const { data: nominee } = await supabase
      .from('evaluator_nominees')
      .select('*')
      .eq('id', nomineeId)
      .eq('candidate_profile_id', params.candidateId)
      .maybeSingle();

    if (!nominee) return NextResponse.json({ error: 'المرشح غير موجود' }, { status: 404 });

    // التحقق أنه لم يُعتمد مسبقاً
    const { data: existing } = await supabase
      .from('approved_evaluators')
      .select('id')
      .eq('nominee_id', nomineeId)
      .maybeSingle();

    if (existing) return NextResponse.json({ error: 'هذا المقيم معتمد بالفعل' }, { status: 409 });

    // إنشاء سجل في approved_evaluators
    const { data: approved, error } = await supabase
      .from('approved_evaluators')
      .insert({
        candidate_profile_id: params.candidateId,
        nominee_id: nomineeId,
        full_name: nominee.full_name,
        email: nominee.email,
        phone: nominee.phone || null,
        job_title: nominee.job_title || null,
        department: nominee.department || null,
        relationship_type: nominee.relationship_type,
        approved_by_committee: true,
        added_by_committee: false,
        committee_selected,
        can_verify_initiatives: nominee.can_verify_initiatives,
        can_verify_kpis: nominee.can_verify_kpis,
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    // تحديث حالة الترشيح
    await supabase
      .from('evaluator_nominees')
      .update({ status: 'approved' })
      .eq('id', nomineeId);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'evaluator_approved',
      description: `اعتماد مقيم: ${nominee.full_name}`,
      affected_entity_type: 'approved_evaluators',
      affected_entity_id: approved.id,
      sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true, approvedId: approved.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
