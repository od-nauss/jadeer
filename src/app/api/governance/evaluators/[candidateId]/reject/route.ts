import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { nomineeId, reason } = await req.json();
    if (!nomineeId) return NextResponse.json({ error: 'nomineeId مطلوب' }, { status: 400 });

    const supabase = createServiceClient();

    await supabase
      .from('evaluator_nominees')
      .update({ status: 'rejected' })
      .eq('id', nomineeId)
      .eq('candidate_profile_id', params.candidateId);

    // إزالة من approved_evaluators إن وُجد
    await supabase
      .from('approved_evaluators')
      .delete()
      .eq('nominee_id', nomineeId);

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'evaluator_rejected',
      description: `استبعاد مقيم من القائمة${reason ? ': ' + reason : ''}`,
      affected_entity_type: 'evaluator_nominees',
      affected_entity_id: nomineeId,
      sensitivity: 'sensitive',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
