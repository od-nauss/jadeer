import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { analyzeNominees } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const supabase = createServiceClient();

    const { data: profile } = await supabase.from('candidate_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'أكمل ملفك القيادي أولاً' }, { status: 400 });
    if (['awaiting_evaluators', 'awaiting_360', 'under_governance_review', 'approved'].includes(profile.status)) {
      return NextResponse.json({ error: 'لا يمكن تعديل قائمة المقيمين بعد إرسالها للجنة' }, { status: 400 });
    }

    const { data: existing } = await supabase.from('evaluator_nominees')
      .select('id').eq('candidate_profile_id', profile.id);

    if ((existing?.length || 0) >= 15) {
      return NextResponse.json({ error: 'وصلت للحد الأقصى (15 مقيماً)' }, { status: 400 });
    }

    const nomineeData = {
      candidate_profile_id: profile.id,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone || null,
      department: body.department || null,
      job_title: body.job_title || null,
      relationship_type: body.relationship_type,
      knowledge_duration: body.knowledge_duration || null,
      knowledge_type: body.knowledge_type || null,
      selection_justification: body.selection_justification || null,
      can_verify_initiatives: body.can_verify_initiatives || false,
      can_verify_kpis: body.can_verify_kpis || false,
      has_personal_relationship: body.has_personal_relationship || false,
      notes: body.notes || null,
      status: 'pending',
    };

    const { data: nominee, error } = await supabase.from('evaluator_nominees').insert(nomineeData).select('id').single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'nominee_added',
      description: `إضافة مقيم: ${body.full_name}`,
      affected_entity_type: 'evaluator_nominees', affected_entity_id: nominee.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, id: nominee.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(_: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return NextResponse.json({ nominees: [], analysis: null });

    const { data: nominees } = await supabase.from('evaluator_nominees').select('*')
      .eq('candidate_profile_id', profile.id).order('created_at');

    const analysis = analyzeNominees((nominees || []) as Parameters<typeof analyzeNominees>[0]);
    return NextResponse.json({ nominees: nominees || [], analysis });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
