import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { decision, decision_reason, reopen_file = false } = await req.json();
    if (!decision || !decision_reason) return NextResponse.json({ error: 'القرار والسبب مطلوبان' }, { status: 400 });

    const supabase = createServiceClient();

    const { data: appeal } = await supabase.from('appeals').select('id, candidate_profile_id, status').eq('id', params.id).maybeSingle();
    if (!appeal) return NextResponse.json({ error: 'التظلم غير موجود' }, { status: 404 });

    const STATUS_MAP: Record<string, string> = {
      accept: 'accepted', reject: 'rejected',
      needs_info: 'needs_info', reopen_file: 'accepted',
    };

    await supabase.from('appeals').update({
      status: STATUS_MAP[decision] || 'closed',
      decision,
      decision_reason,
      reviewed_by: user.id,
    }).eq('id', params.id);

    if (reopen_file || decision === 'reopen_file') {
      await supabase.from('candidate_profiles').update({ status: 'in_progress' }).eq('id', appeal.candidate_profile_id);
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: `appeal_decision_${decision}`,
      description: `قرار التظلم: ${decision} — ${decision_reason.substring(0, 80)}`,
      affected_entity_type: 'appeals', affected_entity_id: params.id, sensitivity: 'sensitive',
    });

    await supabase.from('notifications').insert({
      title: 'قرار تظلمك',
      body: `صدر قرار بخصوص تظلمك: ${decision_reason.substring(0, 100)}`,
      target_role: 'candidate',
    });

    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
