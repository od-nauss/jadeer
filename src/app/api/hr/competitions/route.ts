import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('hr'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: 'عنوان المسابقة مطلوب' }, { status: 400 });

    const supabase = createServiceClient();
    const { data: comp, error } = await supabase.from('competitions').insert({
      title: body.title,
      description: body.description || null,
      objective: body.objective || null,
      target_group: body.target_group || null,
      organization_unit_id: body.organization_unit_id || null,
      competition_type: body.competition_type || 'leadership',
      requirements_json: body.requirements_json || {},
      required_assessments_json: body.required_assessments_json || [],
      requires_360: body.requires_360 || false,
      requires_governance_review: body.requires_governance_review || false,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      status: 'draft',
      created_by: user.id,
    }).select('id').single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'competition_created',
      description: `إنشاء مسابقة: ${body.title}`,
      affected_entity_type: 'competitions', affected_entity_id: comp.id, sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, id: comp.id });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
