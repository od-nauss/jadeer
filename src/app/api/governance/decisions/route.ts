import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

const STATUS_MAP: Record<string, string> = {
  approved: 'approved',
  conditional_approval: 'approved',
  returned_for_completion: 'returned_for_completion',
  deferred: 'under_governance_review',
  rejected: 'returned_for_completion',
};

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    if (!user.isAdmin && !user.roles.includes('governance') && !user.roles.includes('president')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get('candidateId');

    const svc = createServiceClient();
    let query = svc
      .from('governance_decisions')
      .select(`
        *,
        candidate_profiles(
          id,
          users(full_name, job_title, department)
        )
      `)
      .order('decided_at', { ascending: false });

    if (candidateId) {
      query = query.eq('candidate_profile_id', candidateId) as typeof query;
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ decisions: data || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    if (!user.isAdmin && !user.roles.includes('governance')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const {
      candidateProfileId,
      decisionType,
      reason,
      conditions,
      leadershipType,
      targetPositionNote,
      aiScore,
      aiLevel,
    } = body;

    if (!candidateProfileId || !decisionType || !reason) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const svc = createServiceClient();

    // إنشاء القرار باستخدام الأعمدة المتوفرة
    const { data: decision, error: decErr } = await svc
      .from('governance_decisions')
      .insert({
        candidate_profile_id: candidateProfileId,
        decision_type: decisionType,
        reason,
        committee_note: [
          conditions ? `الشروط: ${conditions}` : '',
          targetPositionNote ? `المنصب المقترح: ${targetPositionNote}` : '',
        ].filter(Boolean).join(' | ') || null,
        decided_by: user.id,
        decided_at: new Date().toISOString(),
        new_classification: `${aiLevel || ''}${leadershipType ? ` / ${leadershipType}` : ''}` || null,
        new_status: STATUS_MAP[decisionType] || 'under_governance_review',
      })
      .select()
      .single();

    if (decErr) throw decErr;

    // تحديث حالة الملف
    const newStatus = STATUS_MAP[decisionType] || 'under_governance_review';
    await svc
      .from('candidate_profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', candidateProfileId);

    // إذا كان اعتماداً وتم تحديد نوع قيادة — تحديث البطاقة القيادية
    if (leadershipType && (decisionType === 'approved' || decisionType === 'conditional_approval')) {
      await svc
        .from('leadership_cards')
        .update({
          leadership_type: leadershipType,
          is_published: decisionType === 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('candidate_profile_id', candidateProfileId);
    }

    return NextResponse.json({ decision, success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
