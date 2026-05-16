import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

// ─── حسابات الطاقم الرئيسية ──────────────────────────────────────────────
const STAFF_ACCOUNTS = [
  {
    email: 'president@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'معالي الرئيس',
    job_title: 'رئيس الجامعة',
    department: 'رئاسة الجامعة',
    role: 'president',
  },
  {
    email: 'governance@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'رئيس لجنة الحوكمة',
    job_title: 'رئيس لجنة الحوكمة والتقييم',
    department: 'لجنة الحوكمة',
    role: 'governance',
  },
  {
    email: 'hr@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'مدير الموارد البشرية',
    job_title: 'مدير إدارة الموارد البشرية',
    department: 'إدارة الموارد البشرية',
    role: 'hr',
  },
  {
    email: 'advisor@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'المستشار القيادي',
    job_title: 'مستشار تطوير القيادات',
    department: 'وحدة الاستشارات القيادية',
    role: 'advisor',
  },
  {
    email: 'admin@nauss.edu.sa',
    password: 'Zx.321321',
    full_name: 'مدير النظام',
    job_title: 'مدير منصة جدير',
    department: 'إدارة النظام',
    role: 'admin',
  },
];

// ─── حسابات المرشحين التجريبيين (للتسجيل والتجربة) ──────────────────────
const DEMO_CANDIDATES = [
  {
    email: 'saad.harthy@demo.jadeer.sa',
    password: 'Demo@2026',
    full_name: 'سعد بن محمد الحارثي',
    job_title: 'مدير التخطيط الاستراتيجي',
    department: 'إدارة المشاريع الاستراتيجية',
    role: 'candidate',
    profileId: 'ffff0001-cafe-beef-0000-aaaaaaaaaaaa',
  },
  {
    email: 'noura.qahtani@demo.jadeer.sa',
    password: 'Demo@2026',
    full_name: 'نورة بنت عبدالله القحطاني',
    job_title: 'رئيسة قسم العمليات والجودة',
    department: 'إدارة العمليات',
    role: 'candidate',
    profileId: 'ffff0002-cafe-beef-0000-aaaaaaaaaaaa',
  },
  {
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    password: 'Demo@2026',
    full_name: 'عبدالعزيز بن سالم الدوسري',
    job_title: 'مهندس أنظمة ذكاء اصطناعي أول',
    department: 'إدارة التقنية والذكاء الاصطناعي',
    role: 'candidate',
    profileId: 'ffff0003-cafe-beef-0000-aaaaaaaaaaaa',
  },
  {
    email: 'hind.otaibi@demo.jadeer.sa',
    password: 'Demo@2026',
    full_name: 'هند بنت عمر العتيبي',
    job_title: 'أخصائية تطوير وتدريب',
    department: 'إدارة دعم الفرق والمستفيدين',
    role: 'candidate',
    profileId: 'ffff0004-cafe-beef-0000-aaaaaaaaaaaa',
  },
  {
    email: 'fahad.mutairi@demo.jadeer.sa',
    password: 'Demo@2026',
    full_name: 'فهد بن خالد المطيري',
    job_title: 'مدير برنامج الامتثال المؤسسي',
    department: 'إدارة الجودة والامتثال',
    role: 'candidate',
    profileId: 'ffff0005-cafe-beef-0000-aaaaaaaaaaaa',
  },
];

async function createOrUpdateAccount(
  svc: ReturnType<typeof createServiceClient>,
  account: { email: string; password: string; full_name: string; job_title: string; department: string; role: string; profileId?: string }
): Promise<string> {
  const { email, password, full_name, job_title, department, role } = account;

  // 1) محاولة إنشاء حساب Auth جديد
  let authUserId: string | null = null;
  const { data: created, error: createErr } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (created?.user) {
    authUserId = created.user.id;
  } else if (createErr?.message?.toLowerCase().includes('already')) {
    // المستخدم موجود — نجلب ID منه من جدول users
    const { data: existingUser } = await svc
      .from('users')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser?.auth_user_id) {
      authUserId = existingUser.auth_user_id;
      // نحدّث كلمة المرور
      await svc.auth.admin.updateUserById(authUserId!, { password });
    } else {
      // ابحث في Auth مباشرةً
      const { data: authList } = await svc.auth.admin.listUsers();
      const found = authList?.users?.find(u => u.email === email);
      if (found) {
        authUserId = found.id;
        await svc.auth.admin.updateUserById(authUserId!, { password });
      }
    }
  } else if (createErr) {
    return `❌ ${email}: ${createErr.message}`;
  }

  if (!authUserId) return `❌ ${email}: تعذّر الحصول على Auth ID`;

  // 2) إنشاء / تحديث سجل users
  const { data: existingDbUser } = await svc
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  let dbUserId: string;
  if (existingDbUser?.id) {
    dbUserId = existingDbUser.id;
    await svc.from('users').update({
      auth_user_id: authUserId,
      full_name, job_title, department, is_active: true,
    }).eq('id', dbUserId);
  } else {
    const { data: newUser, error: uErr } = await svc.from('users').insert({
      auth_user_id: authUserId,
      email, full_name, job_title, department, is_active: true,
    }).select('id').single();
    if (uErr || !newUser) return `❌ ${email}: فشل إنشاء users record: ${uErr?.message}`;
    dbUserId = newUser.id;
  }

  // 3) تعيين الدور — احذف القديم وأضف الجديد
  const { data: roleRow } = await svc.from('roles').select('id').eq('code', role).maybeSingle();
  if (!roleRow) return `❌ ${email}: الدور "${role}" غير موجود في جدول roles`;

  await svc.from('user_roles').delete().eq('user_id', dbUserId);
  await svc.from('user_roles').insert({ user_id: dbUserId, role_id: roleRow.id });

  // 4) للمرشحين: اربط الـ candidate_profile بالـ user_id الصحيح
  if (role === 'candidate' && account.profileId) {
    await svc.from('candidate_profiles')
      .update({ user_id: dbUserId })
      .eq('id', account.profileId);

    // تأكد من وجود ملف مرشح
    const { data: existingProfile } = await svc
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', dbUserId)
      .maybeSingle();

    if (!existingProfile) {
      await svc.from('candidate_profiles').upsert({
        id: account.profileId,
        user_id: dbUserId,
        status: 'new',
        completion_score: 0,
      }, { onConflict: 'id' });
    }
  }

  return `✅ ${full_name} (${role})`;
}

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح — مدير النظام فقط' }, { status: 403 });
    }

    const svc = createServiceClient();
    const results: string[] = [];

    // إنشاء حسابات الطاقم
    results.push('── حسابات الطاقم ──');
    for (const account of STAFF_ACCOUNTS) {
      const result = await createOrUpdateAccount(svc, account);
      results.push(result);
    }

    // إنشاء حسابات المرشحين التجريبيين
    results.push('── المرشحون التجريبيون ──');
    for (const account of DEMO_CANDIDATES) {
      const result = await createOrUpdateAccount(svc, account);
      results.push(result);
    }

    const successCount = results.filter(r => r.startsWith('✅')).length;
    const total = STAFF_ACCOUNTS.length + DEMO_CANDIDATES.length;

    return NextResponse.json({
      ok: successCount > 0,
      results,
      summary: `${successCount}/${total} حسابات تم إنشاؤها أو تحديثها`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
