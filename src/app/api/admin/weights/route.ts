import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { weights } = await request.json();
    if (!Array.isArray(weights) || weights.length === 0) {
      return NextResponse.json({ error: 'بيانات الأوزان مطلوبة' }, { status: 400 });
    }

    const total = weights.reduce((sum: number, w: { weight: number }) => sum + Number(w.weight), 0);
    if (total !== 100) {
      return NextResponse.json({ error: `مجموع الأوزان ${total}% — يجب أن يساوي 100%` }, { status: 400 });
    }

    const supabase = createServiceClient();

    // upsert في system_settings
    const { error } = await supabase
      .from('system_settings')
      .upsert(
        { key: 'evaluation_weights', value: weights, updated_by: user.id },
        { onConflict: 'key' }
      );

    if (error) throw error;

    // سجل التدقيق
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: user.primaryRole,
      operation_type: 'weights_updated',
      description: `تعديل أوزان التقييم — ${weights.map((w: { name_ar: string; weight: number }) => `${w.name_ar}: ${w.weight}%`).join(' | ')}`,
      sensitivity: 'high',
    }).then(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
