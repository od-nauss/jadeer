import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { customAlphabet } from 'nanoid';

const generateToken = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 48);

// إلغاء رابط
export async function DELETE(_: NextRequest, { params }: { params: { linkId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const supabase = createServiceClient();
    await supabase.from('evaluation_links').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', params.linkId);
    await supabase.from('audit_logs').insert({
      user_id: user.id, user_role: user.primaryRole,
      operation_type: 'evaluation_link_cancelled',
      description: 'إلغاء رابط تقييم',
      affected_entity_type: 'evaluation_links', affected_entity_id: params.linkId, sensitivity: 'sensitive',
    });
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}

// تمديد أو إعادة إنشاء رابط
export async function PATCH(req: NextRequest, { params }: { params: { linkId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.roles.includes('governance'))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const { action, extendDays = 7 } = await req.json();
    const supabase = createServiceClient();

    if (action === 'extend') {
      const { data: link } = await supabase.from('evaluation_links').select('expires_at').eq('id', params.linkId).single();
      const currentExpiry = new Date(link?.expires_at || Date.now());
      currentExpiry.setDate(currentExpiry.getDate() + extendDays);
      await supabase.from('evaluation_links').update({ expires_at: currentExpiry.toISOString(), status: 'ready' }).eq('id', params.linkId);
      await supabase.from('audit_logs').insert({
        user_id: user.id, user_role: user.primaryRole,
        operation_type: 'evaluation_link_extended',
        description: `تمديد رابط تقييم ${extendDays} يوماً`,
        affected_entity_type: 'evaluation_links', affected_entity_id: params.linkId, sensitivity: 'sensitive',
      });
      return NextResponse.json({ success: true, newExpiry: currentExpiry.toISOString() });
    }

    if (action === 'regenerate') {
      const newToken = generateToken();
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 14);
      await supabase.from('evaluation_links').update({
        token: newToken, status: 'regenerated',
        expires_at: newExpiry.toISOString(),
        opened_at: null, submitted_at: null,
      }).eq('id', params.linkId);
      await supabase.from('audit_logs').insert({
        user_id: user.id, user_role: user.primaryRole,
        operation_type: 'evaluation_link_regenerated',
        description: 'إعادة إنشاء رابط تقييم',
        affected_entity_type: 'evaluation_links', affected_entity_id: params.linkId, sensitivity: 'critical',
      });
      return NextResponse.json({ success: true, newToken });
    }

    return NextResponse.json({ error: 'action غير معروف — استخدم extend أو regenerate' }, { status: 400 });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
