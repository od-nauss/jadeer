import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    if (!user.isAdmin && !user.roles.includes('governance')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const svc = createServiceClient();

    const { data: links, error } = await svc
      .from('evaluation_links')
      .select(`
        id, token, status, expires_at, submitted_at,
        candidate_profile_id,
        approved_evaluators(full_name, relationship_type),
        candidate_profiles!inner(
          id,
          users!inner(full_name, job_title)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by candidate
    const groupMap: Record<string, any> = {};
    for (const link of (links || [])) {
      const l = link as any;
      const pid = l.candidate_profile_id;
      if (!groupMap[pid]) {
        groupMap[pid] = {
          candidateId: pid,
          candidateName: l.candidate_profiles?.users?.full_name || '—',
          jobTitle: l.candidate_profiles?.users?.job_title || '',
          links: [],
        };
      }
      groupMap[pid].links.push({
        id: l.id,
        token: l.token,
        status: l.status,
        expiresAt: l.expires_at,
        submittedAt: l.submitted_at,
        evaluatorName: l.approved_evaluators?.full_name || '—',
        relationship: REL_LABELS[l.approved_evaluators?.relationship_type || ''] || l.approved_evaluators?.relationship_type || '—',
      });
    }

    const groups = Object.values(groupMap);
    return NextResponse.json({ groups });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
