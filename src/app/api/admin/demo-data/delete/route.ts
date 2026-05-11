import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser, logAudit } from '@/lib/auth/current-user';

export async function POST() {
  const user = await getCurrentUser();
  if (!user || !user.primaryRole.includes('admin')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const supabase = createServiceClient();

  // الجداول التي يحتمل أن تحوي is_demo
  const tables = [
    'evaluations_360',
    'evaluation_links',
    'approved_evaluators',
    'evaluator_nominees',
    'governance_decisions',
    'governance_reviews',
    'leadership_cards',
    'development_plans',
    'appeals',
    'kpis',
    'initiatives',
    'assessment_results',
    'position_fit_scores',
    'succession_maps',
    'candidate_profiles',
  ];

  const stats: Record<string, number> = {};

  try {
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('is_demo', true)
        .select('id');
      if (!error && data) {
        stats[table] = data.length;
      }
    }

    // حذف المستخدمين التجريبيين (يحذف auth + سجل users معاً)
    const { data: demoUsers } = await supabase
      .from('users')
      .select('id, auth_user_id, email')
      .eq('is_demo', true);

    if (demoUsers) {
      for (const u of demoUsers) {
        if (u.auth_user_id) {
          await supabase.auth.admin.deleteUser(u.auth_user_id);
        }
        await supabase.from('users').delete().eq('id', u.id);
      }
      stats['users'] = demoUsers.length;
    }

    // تحديث flag
    await supabase
      .from('demo_data_flags')
      .update({
        is_demo_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        total_demo_records: 0,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // سجل التدقيق
    await logAudit({
      operation_type: 'demo_data_deleted',
      description: `حذف البيانات التجريبية بالكامل (${Object.values(stats).reduce(
        (a, b) => a + b,
        0
      )} سجل)`,
      sensitivity: 'critical',
      affected_entity: 'system',
    });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل حذف البيانات التجريبية', details: String(error) },
      { status: 500 }
    );
  }
}
