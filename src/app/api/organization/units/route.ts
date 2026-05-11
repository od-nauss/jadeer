import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organization_units')
    .select('*, organization_unit_requirements(*)')
    .eq('is_active', true)
    .order('unit_type')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'president'].includes(user.primaryRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const {
    name, unit_type, parent_unit_id, description, main_tasks, work_nature,
    employee_count, sensitivity_level, complexity_level, leadership_need_level,
    impact_level, is_critical, has_vacancy, needs_successor,
    is_suitable_for_trial, is_suitable_for_development, notes,
    requirements,
  } = body;

  const service = createServiceClient();

  const { data: unit, error } = await service.from('organization_units').insert({
    name, unit_type, parent_unit_id: parent_unit_id || null,
    description, main_tasks, work_nature,
    employee_count: employee_count || 0,
    sensitivity_level, complexity_level,
    leadership_need_level: leadership_need_level || 'medium',
    impact_level: impact_level || 'medium',
    is_critical: !!is_critical, has_vacancy: !!has_vacancy,
    needs_successor: !!needs_successor,
    is_suitable_for_trial: !!is_suitable_for_trial,
    is_suitable_for_development: !!is_suitable_for_development,
    notes, is_active: true,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ‚ظٹط§ط¯ط©
  if (requirements && unit) {
    await service.from('organization_unit_requirements').insert({
      organization_unit_id: unit.id,
      required_leadership_type: requirements.leadership_type,
      required_readiness_level: requirements.readiness_level,
      required_skills_json: requirements.skills || [],
      weights_json: requirements.weights || {},
      notes: requirements.notes,
    });
  }

  // ط³ط¬ظ„ ط§ظ„طھط¯ظ‚ظٹظ‚
  await service.from('audit_logs').insert({
    user_id: user.id, action: 'organization_unit_created',
    entity_type: 'organization_unit', entity_id: unit?.id,
    new_values: { name, unit_type },
  });

  return NextResponse.json(unit);
}
