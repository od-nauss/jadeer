import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

// POST /api/auth/request-candidacy
// Body: { justification } — current user requests to also be a candidate
// Body: { requestId, action: 'approve'|'reject', rejectionReason? } — HR/admin reviews a request
export async function POST(request: NextRequest) {
  try {
    const caller = await getCurrentUser();
    if (!caller) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً.' }, { status: 401 });
    }

    const body = await request.json();

    // ── وضع المراجعة: مدير النظام فقط يراجع طلبات الازدواج ─────────
    if (body.requestId) {
      if (!caller.isAdmin) {
        return NextResponse.json(
          { error: 'مراجعة طلبات الترشح متاحة لمدير النظام فقط.' },
          { status: 403 }
        );
      }

      const { requestId, action, rejectionReason } = body;

      if (!['approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'الإجراء غير صالح.' }, { status: 400 });
      }

      const supabase = createServiceClient();

      // Get the request
      const { data: req, error: reqErr } = await supabase
        .from('candidacy_requests')
        .select('id, user_id, status')
        .eq('id', requestId)
        .single();

      if (reqErr || !req) {
        return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
      }

      if (req.status !== 'pending') {
        return NextResponse.json({ error: 'تم مراجعة هذا الطلب مسبقاً.' }, { status: 409 });
      }

      if (action === 'reject') {
        await supabase
          .from('candidacy_requests')
          .update({
            status: 'rejected',
            reviewed_by: caller.id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: rejectionReason || null,
          })
          .eq('id', requestId);

        return NextResponse.json({ success: true, action: 'rejected' });
      }

      // Approve: add candidate role + create profile
      const { data: candidateRole } = await supabase
        .from('roles')
        .select('id')
        .eq('code', 'candidate')
        .single();

      if (candidateRole) {
        await supabase
          .from('user_roles')
          .upsert(
            { user_id: req.user_id, role_id: candidateRole.id },
            { onConflict: 'user_id,role_id' }
          );
      }

      // Create candidate_profile if not exists
      const { data: existingProfile } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', req.user_id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('candidate_profiles').insert({
          user_id: req.user_id,
          status: 'new',
          completion_score: 0,
        });
      }

      await supabase
        .from('candidacy_requests')
        .update({
          status: 'approved',
          reviewed_by: caller.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      await supabase.from('audit_logs').insert({
        user_id: caller.id,
        user_role: caller.primaryRole,
        operation_type: 'candidacy_request_approved',
        description: `الموافقة على طلب ترشح المستخدم ${req.user_id}`,
        affected_entity_type: 'user',
        affected_entity_id: req.user_id,
        sensitivity: 'sensitive',
      });

      return NextResponse.json({ success: true, action: 'approved' });
    }

    // ── Submit mode: current user submitting a candidacy request ──
    const { justification } = body;

    // Check user doesn't already have candidate role
    if (caller.roles.includes('candidate')) {
      return NextResponse.json(
        { error: 'أنت بالفعل مرشح قيادي.' },
        { status: 409 }
      );
    }

    const supabase = createServiceClient();

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('candidacy_requests')
      .select('id, status')
      .eq('user_id', caller.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'لديك طلب قيد المراجعة بالفعل.' },
        { status: 409 }
      );
    }

    const { data: newReq, error: insertErr } = await supabase
      .from('candidacy_requests')
      .insert({
        user_id: caller.id,
        justification: justification || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertErr || !newReq) {
      return NextResponse.json({ error: 'فشل إنشاء الطلب.' }, { status: 500 });
    }

    await supabase.from('audit_logs').insert({
      user_id: caller.id,
      user_role: caller.primaryRole,
      operation_type: 'candidacy_request_submitted',
      description: 'طلب إضافة دور مرشح قيادي',
      sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, requestId: newReq.id });
  } catch (error) {
    console.error('Request candidacy error:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع.' }, { status: 500 });
  }
}
