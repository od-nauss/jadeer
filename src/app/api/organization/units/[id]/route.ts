import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organization_units')
    .select('*, organization_unit_requirements(*)')
    .eq('id', params.id)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'president'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { requirements, ...fields } = body;

  const service = createServiceClient();

  const { data: old } = await service.from('organization_units').select('*').eq('id', params.id).single();
  const { data, error } = await service.from('organization_units')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (requirements) {
    const { data: existingReq } = await service.from('organization_unit_requirements')
      .select('id').eq('organization_unit_id', params.id).single();
    if (existingReq) {
      await service.from('organization_unit_requirements').update({
        required_leadership_type: requirements.leadership_type,
        required_readiness_level: requirements.readiness_level,
        required_skills_json: requirements.skills || [],
        weights_json: requirements.weights || {},
        notes: requirements.notes,
        updated_at: new Date().toISOString(),
      }).eq('id', existingReq.id);
    } else {
      await service.from('organization_unit_requirements').insert({
        organization_unit_id: params.id,
        required_leadership_type: requirements.leadership_type,
        required_readiness_level: requirements.readiness_level,
        required_skills_json: requirements.skills || [],
        weights_json: requirements.weights || {},
        notes: requirements.notes,
      });
    }
  }

  await service.from('audit_logs').insert({
    user_id: user.id, action: 'organization_unit_updated',
    entity_type: 'organization_unit', entity_id: params.id,
    old_values: old, new_values: fields,
  });

  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const service = createServiceClient();
  await service.from('organization_units').update({ is_active: false }).eq('id', params.id);
  await service.from('audit_logs').insert({
    user_id: user.id, action: 'organization_unit_archived',
    entity_type: 'organization_unit', entity_id: params.id,
  });

  return NextResponse.json({ ok: true });
}
