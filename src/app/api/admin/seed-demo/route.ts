import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

const PROFILES = [
  {
    id: 'a0000001-demo-0000-0000-000000000001',
    userId: 'u0000001-demo-0000-0000-000000000001',
    name: 'سعد بن محمد الحارثي',
    email: 'saad.harthy@demo.jadeer.sa',
    jobTitle: 'مدير التخطيط الاستراتيجي',
    dept: 'إدارة المشاريع الاستراتيجية',
    exp: 12, readiness: 'ready_within_year', leadType: 'strategic',
    total: 78, trust: 72,
    axes: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['تفكير استراتيجي متميز', 'رؤية الصورة الكبيرة', 'خبرة في تحليل البيانات المعقدة'],
    gaps: ['يحتاج تعزيز إدارة الفريق', 'تطوير التواصل القيادي'],
    plan: 'برنامج القيادة التحويلية 6 أشهر + تكليف تجريبي في مشروع استراتيجي',
    unitId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'a0000002-demo-0000-0000-000000000002',
    userId: 'u0000002-demo-0000-0000-000000000002',
    name: 'نورة بنت عبدالله القحطاني',
    email: 'noura.qahtani@demo.jadeer.sa',
    jobTitle: 'رئيسة قسم العمليات والجودة',
    dept: 'إدارة العمليات',
    exp: 9, readiness: 'ready_now', leadType: 'operational',
    total: 91, trust: 89,
    axes: { leadership: 88, strategic: 74, performance: 96, innovation: 81, team: 91, technology: 84, integrity: 93 },
    strengths: ['أداء تشغيلي استثنائي', 'رضا الفريق مرتفع جداً (91%)', 'مؤشرات أداء واضحة وموثقة'],
    gaps: ['التخطيط الاستراتيجي بعيد المدى', 'تعزيز الحضور في الاجتماعات العليا'],
    plan: 'تكليف قيادي مباشر + برنامج في التخطيط الاستراتيجي (3 أشهر)',
    unitId: '22222222-2222-2222-2222-222222222221',
  },
  {
    id: 'a0000003-demo-0000-0000-000000000003',
    userId: 'u0000003-demo-0000-0000-000000000003',
    name: 'عبدالعزيز بن سالم الدوسري',
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    jobTitle: 'مهندس أنظمة ذكاء اصطناعي أول',
    dept: 'إدارة التقنية والذكاء الاصطناعي',
    exp: 7, readiness: 'promising', leadType: 'technical',
    total: 62, trust: 58,
    axes: { leadership: 54, strategic: 61, performance: 82, innovation: 91, team: 52, technology: 95, integrity: 79 },
    strengths: ['خبرة تقنية نادرة في الذكاء الاصطناعي', 'ابتكار وحل مشكلات متميز'],
    gaps: ['القيادة الإنسانية', 'رضا الفريق 52%', 'التواصل مع غير التقنيين'],
    plan: 'برنامج القيادة الرقمية 12 شهراً + تطوير إدارة الفريق',
    unitId: '22222222-2222-2222-2222-222222222223',
  },
  {
    id: 'a0000004-demo-0000-0000-000000000004',
    userId: 'u0000004-demo-0000-0000-000000000004',
    name: 'هند بنت عمر العتيبي',
    email: 'hind.otaibi@demo.jadeer.sa',
    jobTitle: 'أخصائية تطوير وتدريب',
    dept: 'إدارة دعم الفرق والمستفيدين',
    exp: 8, readiness: 'human_leader', leadType: 'human',
    total: 68, trust: 74,
    axes: { leadership: 71, strategic: 55, performance: 63, innovation: 61, team: 96, technology: 52, integrity: 91 },
    strengths: ['رضا الفريق استثنائي (96%)', 'نزاهة 91%', 'قيادة عاطفية مؤثرة'],
    gaps: ['مؤشرات الأداء الكمية', 'استخدام التقنية (52%)', 'التفكير الاستراتيجي'],
    plan: 'شهادة قياس أثر التدريب + داشبورد المؤشرات + الكفاءة الرقمية',
    unitId: '22222222-2222-2222-2222-222222222224',
  },
  {
    id: 'a0000005-demo-0000-0000-000000000005',
    userId: 'u0000005-demo-0000-0000-000000000005',
    name: 'فهد بن خالد المطيري',
    email: 'fahad.mutairi@demo.jadeer.sa',
    jobTitle: 'مدير برنامج الامتثال المؤسسي',
    dept: 'إدارة الجودة والامتثال',
    exp: 11, readiness: 'high_performance_low_satisfaction', leadType: 'specialist_leadership',
    total: 45, trust: 62,
    axes: { leadership: 61, strategic: 67, performance: 97, innovation: 44, team: 31, technology: 68, integrity: 85 },
    strengths: ['الأداء الفردي 97%', 'النزاهة 85%', 'امتثال 100% في التدقيقات'],
    gaps: ['رضا الفريق 31% — أزمة إدارية', 'دوران الموظفين 28%', 'الابتكار 44%'],
    plan: 'برنامج القيادة الإنسانية المكثف + جلسات استماع شهرية مع الفريق',
    unitId: '22222222-2222-2222-2222-222222222225',
  },
];

async function safeUpsert(svc: any, table: string, data: object, conflict: string): Promise<string | null> {
  const { error } = await svc.from(table).upsert(data as any, { onConflict: conflict });
  return error ? error.message : null;
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden — يجب أن تكون مدير النظام' }, { status: 403 });
  }

  const svc = createServiceClient();
  const results: string[] = [];
  let totalSuccess = 0;

  for (const p of PROFILES) {
    const errs: string[] = [];

    // 1. المستخدم
    const e1 = await safeUpsert(svc, 'users', {
      id: p.userId,
      full_name: p.name,
      email: p.email,
      job_title: p.jobTitle,
      department: p.dept,
      is_active: true,
      is_demo: true,
    }, 'id');
    if (e1) errs.push(`users: ${e1}`);

    // 2. ملف المرشح
    const e2 = await safeUpsert(svc, 'candidate_profiles', {
      id: p.id,
      user_id: p.userId,
      years_of_experience: p.exp,
      qualification: 'ماجستير',
      specialization: p.dept,
      status: 'approved',
      completion_score: 88,
      evaluation_track: 'individual',
      is_demo: true,
    }, 'id');
    if (e2) errs.push(`profiles: ${e2}`);

    // 3. مبادرتان
    for (let i = 1; i <= 2; i++) {
      const e = await safeUpsert(svc, 'initiatives', {
        id: `${p.id}-init-${i}`,
        candidate_id: p.id,
        title: i === 1 ? `مبادرة تحسين ${p.dept}` : 'مبادرة رقمنة العمليات الداخلية',
        description: i === 1
          ? `تحسين كفاءة ${p.dept} بنسبة 30% خلال 6 أشهر`
          : 'أتمتة 5 عمليات يدوية ورفع الإنجاز 40%',
        impact_level: 'high',
        status: i === 1 ? 'completed' : 'in_progress',
        start_date: '2024-01-01',
        is_demo: true,
      }, 'id');
      if (e) errs.push(`init-${i}: ${e}`);
    }

    // 4. مؤشران
    for (let i = 1; i <= 2; i++) {
      const e = await safeUpsert(svc, 'kpis', {
        id: `${p.id}-kpi-${i}`,
        candidate_id: p.id,
        title: i === 1 ? 'نسبة إنجاز المهام في الوقت المحدد' : 'رضا المستفيدين الداخليين',
        current_value: i === 1 ? 94 : p.axes.team,
        target_value: i === 1 ? 90 : 85,
        unit: '%',
        period: '2024',
        status: (i === 1 ? 94 : p.axes.team) >= 85 ? 'achieved' : 'in_progress',
        is_demo: true,
      }, 'id');
      if (e) errs.push(`kpi-${i}: ${e}`);
    }

    // 5. البطاقة القيادية
    const e5 = await safeUpsert(svc, 'leadership_cards', {
      id: `${p.id}-card`,
      candidate_profile_id: p.id,
      total_score: p.total,
      trust_score: p.trust,
      readiness_level: p.readiness,
      leadership_type: p.leadType,
      axis_scores: p.axes,
      primary_strengths: p.strengths,
      development_gaps: p.gaps,
      ai_summary: `${p.name} — ${p.plan}`,
      is_published: true,
      is_demo: true,
    }, 'id');
    if (e5) errs.push(`card: ${e5}`);

    // 6. خطة التطوير
    const e6 = await safeUpsert(svc, 'development_plans', {
      id: `${p.id}-plan`,
      candidate_profile_id: p.id,
      overall_status: 'approved',
      notes: p.plan,
      is_demo: true,
    }, 'id');
    if (e6) errs.push(`plan: ${e6}`);

    // 7. الملاءمة التنظيمية
    const e7 = await safeUpsert(svc, 'position_fit_scores', {
      candidate_profile_id: p.id,
      organization_unit_id: p.unitId,
      fit_score: Math.min(100, p.total + 5),
      fit_level: p.total >= 85 ? 'high' : p.total >= 70 ? 'good' : p.total >= 55 ? 'conditional' : 'low',
      confidence_score: p.trust,
      fit_reason: p.strengths[0],
      strengths_match_json: p.strengths,
      gaps_json: p.gaps,
      ai_summary: p.plan,
      recommended_action: p.plan,
      is_demo: true,
    }, 'candidate_profile_id,organization_unit_id');
    if (e7) errs.push(`fit: ${e7}`);

    if (errs.length === 0) {
      results.push(`✅ ${p.name}`);
      totalSuccess++;
    } else {
      results.push(`⚠️ ${p.name}: ${errs.join(' | ')}`);
    }
  }

  // تحديث علامة البيانات التجريبية
  await svc.from('demo_data_flags').upsert({
    is_demo_active: true,
    last_seeded_at: new Date().toISOString(),
  });

  // سجل التدقيق
  await svc.from('audit_logs').insert({
    user_id: user.id,
    action: 'demo_data_seeded',
    entity_type: 'demo_data',
    new_values: { success: totalSuccess, total: PROFILES.length },
  });

  return NextResponse.json({
    ok: true,
    results,
    summary: `${totalSuccess}/${PROFILES.length} مرشحين تم إنشاؤهم بنجاح`,
  });
}
