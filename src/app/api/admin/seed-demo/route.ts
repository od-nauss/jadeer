import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

// UUIDs صالحة — hex فقط (0-9, a-f)
// مستخدمون
const UID = [
  '33333301-beef-cafe-0000-000000000001',
  '33333302-beef-cafe-0000-000000000002',
  '33333303-beef-cafe-0000-000000000003',
  '33333304-beef-cafe-0000-000000000004',
  '33333305-beef-cafe-0000-000000000005',
];
// ملفات المرشحين
const PID = [
  '44444401-beef-cafe-0000-000000000001',
  '44444402-beef-cafe-0000-000000000002',
  '44444403-beef-cafe-0000-000000000003',
  '44444404-beef-cafe-0000-000000000004',
  '44444405-beef-cafe-0000-000000000005',
];

const PROFILES = [
  {
    idx: 0,
    name: 'سعد بن محمد الحارثي',
    email: 'saad.harthy@demo.jadeer.sa',
    jobTitle: 'مدير التخطيط الاستراتيجي',
    dept: 'إدارة المشاريع الاستراتيجية',
    exp: 12,
    readiness: 'ready_within_year' as const,
    leadType: 'strategic',
    total: 78, trust: 72,
    axes: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['تفكير استراتيجي متميز', 'رؤية الصورة الكبيرة', 'خبرة تحليل البيانات المعقدة'],
    gaps: ['يحتاج تعزيز إدارة الفريق', 'تطوير التواصل القيادي'],
    aiRec: 'مرشح قوي للقيادة الاستراتيجية خلال 12 شهراً — يُوصى ببرنامج القيادة التحويلية وتكليف تجريبي في مشروع استراتيجي',
    unitId: '22222222-2222-2222-2222-222222222222',
    ini1: { name: 'الخطة الاستراتيجية 2025-2030', achieved_impact: 'رسم مسار مؤسسي لـ 850 موظف على 5 سنوات' },
    ini2: { name: 'مشروع شراكات الجامعات الأمنية الدولية', achieved_impact: '8 اتفاقيات تعاون دولية جديدة' },
    kpi1: { name: 'نسبة إنجاز مبادرات الخطة الاستراتيجية', target_value: '85%', actual_value: '87%' },
    kpi2: { name: 'عدد الشراكات الدولية النشطة', target_value: '10 شراكات', actual_value: '12 شراكة' },
  },
  {
    idx: 1,
    name: 'نورة بنت عبدالله القحطاني',
    email: 'noura.qahtani@demo.jadeer.sa',
    jobTitle: 'رئيسة قسم العمليات والجودة',
    dept: 'إدارة العمليات',
    exp: 9,
    readiness: 'ready_now' as const,
    leadType: 'operational',
    total: 91, trust: 89,
    axes: { leadership: 88, strategic: 74, performance: 96, innovation: 81, team: 91, technology: 84, integrity: 93 },
    strengths: ['أداء تشغيلي استثنائي (96%)', 'رضا الفريق مرتفع جداً (91%)', 'مؤشرات أداء واضحة وموثقة'],
    gaps: ['التخطيط الاستراتيجي بعيد المدى', 'تعزيز الحضور في الاجتماعات العليا'],
    aiRec: 'تكليف قيادي فوري في إدارة العمليات — أداؤها الموثق يتجاوز متطلبات المنصب، الفجوة الوحيدة معالَجة خلال السنة الأولى',
    unitId: '22222222-2222-2222-2222-222222222221',
    ini1: { name: 'مشروع التحسين التشغيلي الشامل', achieved_impact: 'خفض 31% في زمن الإنجاز — توفير 2400 ساعة سنوياً' },
    ini2: { name: 'منظومة متابعة الأداء اليومي', achieved_impact: 'رفع نسبة الإنجاز في الوقت المحدد من 71% إلى 94%' },
    kpi1: { name: 'نسبة إنجاز المهام في الوقت المحدد', target_value: '90%', actual_value: '94%' },
    kpi2: { name: 'درجة رضا المستفيدين الداخليين', target_value: '4.0/5', actual_value: '4.6/5' },
  },
  {
    idx: 2,
    name: 'عبدالعزيز بن سالم الدوسري',
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    jobTitle: 'مهندس أنظمة ذكاء اصطناعي أول',
    dept: 'إدارة التقنية والذكاء الاصطناعي',
    exp: 7,
    readiness: 'promising' as const,
    leadType: 'technical',
    total: 62, trust: 58,
    axes: { leadership: 54, strategic: 61, performance: 82, innovation: 91, team: 52, technology: 95, integrity: 79 },
    strengths: ['خبرة تقنية نادرة في الذكاء الاصطناعي (95%)', 'ابتكار وحل مشكلات متميز (91%)'],
    gaps: ['القيادة الإنسانية (54%)', 'رضا الفريق (52%)', 'التواصل مع غير التقنيين'],
    aiRec: 'واعد جداً للقيادة التقنية خلال 18 شهراً — مسار تطوير قيادي مكثف في التواصل وإدارة الفريق',
    unitId: '22222222-2222-2222-2222-222222222223',
    ini1: { name: 'نظام تحليل المخاطر الأمنية بالذكاء الاصطناعي', achieved_impact: 'خفض وقت الاستجابة للمخاطر 60%' },
    ini2: { name: 'برنامج تدريب الذكاء الاصطناعي للموظفين', achieved_impact: '120 موظف يستخدمون أدوات AI يومياً' },
    kpi1: { name: 'عدد نماذج الذكاء الاصطناعي المطبَّقة إنتاجياً', target_value: '2 نماذج', actual_value: '3 نماذج' },
    kpi2: { name: 'دقة نموذج تحليل المخاطر', target_value: '85%', actual_value: '94%' },
  },
  {
    idx: 3,
    name: 'هند بنت عمر العتيبي',
    email: 'hind.otaibi@demo.jadeer.sa',
    jobTitle: 'أخصائية تطوير وتدريب',
    dept: 'إدارة دعم الفرق والمستفيدين',
    exp: 8,
    readiness: 'human_leader' as const,
    leadType: 'human',
    total: 68, trust: 74,
    axes: { leadership: 71, strategic: 55, performance: 63, innovation: 61, team: 96, technology: 52, integrity: 91 },
    strengths: ['رضا الفريق استثنائي (96%) — موهبة نادرة', 'نزاهة مؤسسية عالية (91%)'],
    gaps: ['مؤشرات الأداء الكمية (63%)', 'استخدام التقنية (52%)', 'التفكير الاستراتيجي (55%)'],
    aiRec: 'تعيين في رئاسة قسم دعم الفرق فوراً — يُشترط إتمام برنامج قياس الأثر خلال 6 أشهر',
    unitId: '22222222-2222-2222-2222-222222222224',
    ini1: { name: 'برنامج الاندماج المؤسسي للموظفين الجدد', achieved_impact: 'خفض معدل مغادرة الموظفين الجدد من 22% إلى 7%' },
    ini2: { name: 'منظومة الدعم النفسي المهني', achieved_impact: '240 جلسة دعم، رضا 97%' },
    kpi1: { name: 'درجة رضا المتدربين عن البرامج', target_value: '4.0/5', actual_value: '4.85/5' },
    kpi2: { name: 'معدل مغادرة الموظفين الجدد قبل 6 أشهر', target_value: '15%', actual_value: '7%' },
  },
  {
    idx: 4,
    name: 'فهد بن خالد المطيري',
    email: 'fahad.mutairi@demo.jadeer.sa',
    jobTitle: 'مدير برنامج الامتثال المؤسسي',
    dept: 'إدارة الجودة والامتثال',
    exp: 11,
    readiness: 'high_performance_low_satisfaction' as const,
    leadType: 'specialist_leadership',
    total: 45, trust: 62,
    axes: { leadership: 61, strategic: 67, performance: 97, innovation: 44, team: 31, technology: 68, integrity: 85 },
    strengths: ['الأداء الفردي 97% — استثنائي', 'امتثال 100% في التدقيقات الخارجية', 'النزاهة 85%'],
    gaps: ['رضا الفريق 31% — أزمة قيادية', 'دوران الموظفين 28%', 'الابتكار 44%'],
    aiRec: 'لا يُنصح بالتكليف القيادي حالياً — برنامج تحول قيادي إنساني مكثف، إعادة تقييم بعد 12 شهراً',
    unitId: '22222222-2222-2222-2222-222222222225',
    ini1: { name: 'منظومة الحوكمة الداخلية المتكاملة', achieved_impact: 'حصول الجامعة على اعتماد ISO 9001 لأول مرة' },
    ini2: { name: 'نظام تتبع الامتثال التنظيمي', achieved_impact: '100% امتثال في التدقيق الخارجي الأخير' },
    kpi1: { name: 'نسبة الامتثال في التدقيقات الخارجية', target_value: '95%', actual_value: '100%' },
    kpi2: { name: 'درجة رضا الفريق عن بيئة العمل', target_value: '3.8/5', actual_value: '2.1/5' },
  },
];

async function safeUpsert(svc: any, table: string, data: object, conflict: string): Promise<string | null> {
  const { error } = await svc.from(table).upsert(data as any, { onConflict: conflict });
  return error ? `[${table}] ${error.message}` : null;
}

async function safeDelete(svc: any, table: string, field: string, value: string): Promise<void> {
  await svc.from(table).delete().eq(field, value);
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
    const userId = UID[p.idx];
    const profileId = PID[p.idx];
    const errs: string[] = [];

    // حذف أي بيانات سابقة بنفس IDs (لتجنب تعارض FK)
    await safeDelete(svc, 'position_fit_scores', 'candidate_profile_id', profileId);
    await safeDelete(svc, 'development_plan_items', 'development_plan_id', `${profileId}-devplan`);
    await safeDelete(svc, 'development_plans', 'candidate_profile_id', profileId);
    await safeDelete(svc, 'leadership_cards', 'candidate_profile_id', profileId);
    await safeDelete(svc, 'kpis', 'candidate_profile_id', profileId);
    await safeDelete(svc, 'initiatives', 'candidate_profile_id', profileId);
    await safeDelete(svc, 'candidate_profiles', 'id', profileId);
    await safeDelete(svc, 'users', 'id', userId);

    // 1. المستخدم — بدون auth_user_id (nullable)
    const e1 = await safeUpsert(svc, 'users', {
      id: userId,
      full_name: p.name,
      email: p.email,
      job_title: p.jobTitle,
      department: p.dept,
      is_active: true,
      is_demo: true,
    }, 'id');
    if (e1) errs.push(e1);

    // 2. ملف المرشح — فقط الأعمدة الموجودة في الـ schema
    const e2 = await safeUpsert(svc, 'candidate_profiles', {
      id: profileId,
      user_id: userId,
      years_of_experience: p.exp,
      qualification: 'ماجستير',
      specialization: p.dept,
      status: 'approved',
      completion_score: 88,
      is_demo: true,
    }, 'id');
    if (e2) errs.push(e2);

    // 3. مبادرتان — candidate_profile_id + name (الأعمدة الصحيحة)
    const e3a = await safeUpsert(svc, 'initiatives', {
      id: `${profileId.slice(0, 8)}-ini1-0000-0000-${profileId.slice(-12)}`,
      candidate_profile_id: profileId,
      name: p.ini1.name,
      initiative_type: 'institutional_improvement',
      achieved_impact: p.ini1.achieved_impact,
      evidence: 'تقارير الأداء والمؤشرات الموثقة',
      is_demo: true,
    }, 'id');
    if (e3a) errs.push(e3a);

    const e3b = await safeUpsert(svc, 'initiatives', {
      id: `${profileId.slice(0, 8)}-ini2-0000-0000-${profileId.slice(-12)}`,
      candidate_profile_id: profileId,
      name: p.ini2.name,
      initiative_type: 'process_improvement',
      achieved_impact: p.ini2.achieved_impact,
      evidence: 'نتائج موثقة من تقارير القسم',
      is_demo: true,
    }, 'id');
    if (e3b) errs.push(e3b);

    // 4. مؤشران — candidate_profile_id + name + target_value/actual_value كـ TEXT
    const e4a = await safeUpsert(svc, 'kpis', {
      id: `${profileId.slice(0, 8)}-kpi1-0000-0000-${profileId.slice(-12)}`,
      candidate_profile_id: profileId,
      name: p.kpi1.name,
      kpi_type: 'efficiency',
      target_value: p.kpi1.target_value,
      actual_value: p.kpi1.actual_value,
      is_officially_approved: true,
      is_demo: true,
    }, 'id');
    if (e4a) errs.push(e4a);

    const e4b = await safeUpsert(svc, 'kpis', {
      id: `${profileId.slice(0, 8)}-kpi2-0000-0000-${profileId.slice(-12)}`,
      candidate_profile_id: profileId,
      name: p.kpi2.name,
      kpi_type: 'quality',
      target_value: p.kpi2.target_value,
      actual_value: p.kpi2.actual_value,
      is_officially_approved: true,
      is_demo: true,
    }, 'id');
    if (e4b) errs.push(e4b);

    // 5. البطاقة القيادية — axis_scores/primary_strengths/development_gaps كـ JSONB ✓
    const e5 = await safeUpsert(svc, 'leadership_cards', {
      id: `${profileId.slice(0, 8)}-card-0000-0000-${profileId.slice(-12)}`,
      candidate_profile_id: profileId,
      total_score: p.total,
      trust_score: p.trust,
      readiness_level: p.readiness,
      leadership_type: p.leadType,
      axis_scores: p.axes,
      primary_strengths: p.strengths,
      development_gaps: p.gaps,
      ai_summary: p.aiRec,
      is_published: true,
      status: 'approved',
      is_demo: true,
    }, 'candidate_profile_id');
    if (e5) errs.push(e5);

    // 6. خطة التطوير — بدون عمود notes (غير موجود)، نستخدم ai_recommendations_json
    const e6 = await safeUpsert(svc, 'development_plans', {
      id: `${profileId.slice(0, 8)}-devp-0000-0000-${profileId.slice(-12)}`,
      candidate_profile_id: profileId,
      readiness_level: p.readiness,
      leadership_type: p.leadType,
      overall_status: 'approved',
      ai_recommendations_json: { summary: p.aiRec, notes: `خطة تطوير تجريبية لـ ${p.name}` },
      is_demo: true,
    }, 'id');
    if (e6) errs.push(e6);

    // 7. الملاءمة التنظيمية
    const fitLevel = p.total >= 85 ? 'high' : p.total >= 70 ? 'good' : p.total >= 55 ? 'conditional' : 'low';
    const e7 = await safeUpsert(svc, 'position_fit_scores', {
      candidate_profile_id: profileId,
      organization_unit_id: p.unitId,
      fit_score: Math.min(100, p.total + 5),
      fit_level: fitLevel,
      confidence_score: p.trust,
      fit_reason: p.strengths[0],
      strengths_match_json: p.strengths,
      gaps_json: p.gaps,
      ai_summary: p.aiRec,
      recommended_action: p.aiRec,
      is_demo: true,
    }, 'candidate_profile_id,organization_unit_id');
    if (e7) errs.push(e7);

    if (errs.length === 0) {
      results.push(`✅ ${p.name}`);
      totalSuccess++;
    } else {
      results.push(`⚠️ ${p.name}: ${errs.slice(0, 2).join(' | ')}`);
    }
  }

  // تحديث علامة البيانات التجريبية
  await svc.from('demo_data_flags').upsert({
    is_demo_active: true,
    last_seeded_at: new Date().toISOString(),
  });

  try {
    await svc.from('audit_logs').insert({
      user_id: user.id,
      action: 'demo_data_seeded',
      entity_type: 'demo_data',
      new_values: { success: totalSuccess, total: PROFILES.length },
    });
  } catch {}

  return NextResponse.json({
    ok: totalSuccess > 0,
    results,
    summary: `${totalSuccess}/${PROFILES.length} مرشحين تم إنشاؤهم بنجاح`,
  });
}
