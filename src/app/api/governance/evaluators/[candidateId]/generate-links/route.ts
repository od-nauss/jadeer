import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { customAlphabet } from 'nanoid';

const generateToken = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 48);

export async function POST(req: NextRequest, { params }: { params: { candidateId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { expireDays = 14 } = await req.json().catch(() => ({}));
    const supabase = createServiceClient();

    // جلب المقيمين المعتمدين
    const { data: approved } = await supabase
      .from('approved_evaluators')
      .select('id, full_name, email, committee_selected, added_by_committee')
      .eq('candidate_profile_id', params.candidateId)
      .eq('status', 'approved');

    if (!approved || approved.length === 0) {
      return NextResponse.json({ error: 'لا يوجد مقيمون معتمدون' }, { status: 400 });
    }

    // ── التحقق من قاعدة 60% ────────────────
    const committeeCount = approved.filter(a => a.committee_selected || a.added_by_committee).length;
    const totalCount = approved.length;
    const committeePercent = (committeeCount / totalCount) * 100;

    if (totalCount < 7) {
      return NextResponse.json({
        error: `عدد المقيمين المعتمدين (${totalCount}) أقل من الحد الأدنى 7. يجب اعتماد 7-10 مقيمين.`
      }, { status: 400 });
    }

    if (totalCount > 10) {
      return NextResponse.json({
        error: `عدد المقيمين المعتمدين (${totalCount}) يتجاوز الحد الأقصى 10.`
      }, { status: 400 });
    }

    if (committeePercent < 60) {
      return NextResponse.json({
        error: `نسبة المقيمين من اختيار اللجنة (${Math.round(committeePercent)}٪) أقل من 60٪ المطلوبة. يجب أن تحدد اللجنة ${Math.ceil(totalCount * 0.6)} مقيمين على الأقل.`
      }, { status: 400 });
    }

    // ── إنشاء الروابط ──────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expireDays);

    const linkInserts = approved.map(ev => ({
      candidate_profile_id: params.candidateId,
      approved_evaluator_id: ev.id,
      token: generateToken(),
      expires_at: expiresAt.toISOString(),
      status: 'ready',
      created_by: user.id,
    }));

    const { data: links, error } = await supabase
      .from('evaluation_links')
      .insert(linkInserts)
      .select('id, token, approved_evaluator_id');

    if (error) throw error;

    // تحديث وقت إنشاء الرابط على المقيمين
    await supabase
      .from('approved_evaluators')
      .update({ link_generated_at: new Date().toISOString() })
      .eq('candidate_profile_id', params.candidateId)
      .eq('status', 'approved');

    // تحديث حالة ملف المرشح
    await supabase
      .from('candidate_profiles')
      .update({ status: 'awaiting_360' })
      .eq('id', params.candidateId);

    // تحديث ملخص 360
    await supabase
      .from('candidate_360_summary')
      .upsert({
        candidate_profile_id: params.candidateId,
        circle_status: 'links_generated',
        approved_evaluators_count: totalCount,
        evaluators_approved_at: new Date().toISOString(),
        links_generated_at: new Date().toISOString(),
      }, { onConflict: 'candidate_profile_id' });

    // إشعار للمرشح
    await supabase.from('notifications').insert({
      title: 'تم اعتماد دائرة الثقة وإنشاء روابط التقييم',
      body: `اعتمدت لجنة الحوكمة ${totalCount} مقيمين. يمكنك الآن نسخ روابط التقييم وإرسالها للمقيمين.`,
      target_role: 'candidate',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'evaluation_links_generated',
      description: `إنشاء ${links?.length} رابط تقييم لـ ${params.candidateId}`,
      affected_entity_type: 'evaluation_links',
      affected_entity_id: params.candidateId,
      sensitivity: 'critical',
    });

    return NextResponse.json({
      success: true,
      linksCreated: links?.length,
      committeePercent: Math.round(committeePercent),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
