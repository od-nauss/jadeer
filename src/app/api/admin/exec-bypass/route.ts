// POST /api/admin/exec-bypass
// يفعّل أو يعطّل كلمة المرور لمركز العرض التنفيذي
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { bypass } = await req.json();
  const service = createServiceClient();

  const { data: existing } = await service
    .from('executive_center_access')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    await service
      .from('executive_center_access')
      .update({ bypass_active: !!bypass, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await service.from('executive_center_access').insert({
      access_code_hash: '',
      is_active: true,
      bypass_active: !!bypass,
    });
  }

  await service.from('audit_logs').insert({
    user_id: user.id,
    action: bypass ? 'exec_center_bypass_enabled' : 'exec_center_bypass_disabled',
    entity_type: 'executive_center_access',
    new_values: { bypass_active: !!bypass },
  });

  return NextResponse.json({ ok: true, bypass_active: !!bypass });
}

export async function GET() {
  const service = createServiceClient();
  const { data } = await service
    .from('executive_center_access')
    .select('bypass_active')
    .limit(1)
    .single();
  return NextResponse.json({ bypass_active: data?.bypass_active ?? false });
}
