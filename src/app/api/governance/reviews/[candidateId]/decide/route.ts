import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { computeGovernanceScore } from '@/lib/ai/analyzerGovernance';

const DECISION_STATUS_MAP: Record<string, string> = {
  approve: 'approved',
  return_for_completion: 'returned_for_completion',
  request_additional_assessment: 'in_progress',
  request_additional_evidence: 'in_progress',
  reject_classification: 'in_progress',
  close_temporarily: 'in_progress',
  forward_to_hr: 'approved',
};

export async function POST(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const { decision_type, reason, committee_note, adjusted_score, adjusted_level, adjusted_leadership_type } = body;

    if (!decision_type || !reason) {
      return NextResponse.json({ error: 'نوع القرار والسبب مطلوبان' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id, status, completion_score, user_id, users(full_name)')
      .eq('id', params.candidateId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'ملف غير موجود' }, { status: 404 });

    const newStatus = DECISION_STATUS_MAP[decision_type] || 'in_progress';
    const profileTyped = profile as any;

    // تحديث حالة الملف
    await supabase
      .from('candidate_profiles')
      .update({ status: newStatus })
      .eq('id', params.candidateId);

    // تسجيل القرار
    await supabase.from('governance_decisions').insert({
      candidate_profile_id: params.candidateId,
      decision_type,
      new_status: newStatus,
      previous_status: profile.status,
      new_classification: adjusted_level || null,
      reason,
      committee_note: committee_note || null,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    });

    // إشعار للمرشح
    const notifBody = decision_type === 'approve'
      ? 'تم اعتماد تصنيفك القيادي من لجنة الحوكمة. راجع نتيجتك.'
      : decision_type === 'return_for_completion'
      ? `أعادت لجنة الحوكمة ملفك للاستكمال. يرجى مراجعة المطلوب: ${committee_note || reason}`
      : `قرار جديد من لجنة الحوكمة بخصوص ملفك: ${reason}`;

    await supabase.from('notifications').insert({
      title: 'قرار لجنة الحوكمة',
      body: notifBody,
      target_role: 'candidate',
    });

    // سجل التدقيق
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: user.primaryRole,
      operation_type: `governance_decision_${decision_type}`,
      description: `قرار لجنة الحوكمة: ${decision_type} — ${reason.substring(0, 100)}`,
      affected_entity_type: 'candidate_profiles',
      affected_entity_id: params.candidateId,
      sensitivity: 'critical',
    });

    return NextResponse.json({ success: true, newStatus });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
