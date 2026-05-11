import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

const REMINDER_MESSAGES: Record<string, string> = {
  complete_basics: 'يرجى استكمال بيانات ملفك القيادي الأساسية.',
  add_initiatives: 'تذكير: يجب إضافة مبادرتين على الأقل في ملفك القيادي.',
  add_kpis: 'تذكير: يجب إضافة مؤشري أداء على الأقل لاستكمال ملفك.',
  complete_assessments: 'تذكير: يجب إكمال 4 اختبارات ذكية على الأقل.',
  nominate_evaluators: 'تذكير: يجب ترشيح 15 مقيماً لاستكمال دائرة الثقة.',
  governance_notes: 'راجع ملاحظات لجنة الحوكمة واستكمل ما طُلب منك.',
  general: 'تذكير من الموارد البشرية: يرجى متابعة ملفك في منصة جدير.',
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.primaryRoles.includes('hr'))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const { candidate_profile_id, reminder_type = 'general', custom_message } = await req.json();

    const supabase = createServiceClient();
    const message = custom_message || REMINDER_MESSAGES[reminder_type] || REMINDER_MESSAGES.general;

    await supabase.from('notifications').insert({
      title: 'تذكير من الموارد البشرية',
      body: message,
      target_role: 'candidate',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'hr_reminder_sent',
      description: `تذكير موارد بشرية: ${reminder_type}`,
      affected_entity_type: 'candidate_profiles', affected_entity_id: candidate_profile_id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
