import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, subject, message } = await request.json();

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const supabase = createServiceClient();
    await supabase.from('contact_messages').insert({
      full_name: fullName,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'خطأ' }, { status: 500 });
  }
}
