import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

const PROFILES = [
  {
    id: 'a0000001-demo-0000-0000-000000000001',
    userId: 'u0000001-demo-0000-0000-000000000001',
    name: 'سعد بن محمد الحارثي',
    email: 'saad.harthy@demo.jadeer.sa',
    jobTitle: 'مدير تخطيط استراتيجي',
    dept: 'إدارة المشاريع الاستراتيجية',
    exp: 12,
    readiness: 'ready_within_year',
    leadType: 'strategic',
    total: 78, trust: 72,
    axes: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['تفكير استراتيجي متميز', 'رؤية الصورة الكبيرة', 'خبرة في تحليل البيانات المعقدة'],
    gaps: ['يحتاج تعزيز مهارات إدارة الفريق', 'تطوير رضا الفريق والتواصل القيادي'],
    plan: 'برنامج القيادة التحويلية 6 أشهر + تكليف تجريبي في مشروع استراتيجي',
    rec: 'مرشح قوي للقيادة الاستراتيجية خلال 12 شهراً بعد تطوير مهارات إدارة الفريق',
    unitId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'a0000002-demo-0000-0000-000000000002',
    userId: 'u0000002-demo-0000-0000-000000000002',
    name: 'نورة بنت عبدالله القحطاني',
    email: 'noura.qahtani@demo.jadeer.sa',
    jobTitle: 'رئيسة قسم العمليات',
    dept: 'إدارة العمليات',
    exp: 9,
    readiness: 'ready_now',
    leadType: 'operational',
    total: 87, trust: 85,
    axes: { leadership: 85, strategic: 72, performance: 92, innovation: 78, team: 88, technology: 80, integrity: 90 },
    strengths: ['أداء تشغيلي استثنائي', 'رضا الفريق مرتفع جداً', 'مؤشرات أداء واضحة وموثقة'],
    gaps: ['تعزيز التخطيط طويل المدى', 'تطوير مهارات التفاوض الاستراتيجي'],
    plan: 'تكليف قيادي مباشر + برنامج قصير في التخطيط الاستراتيجي (3 أشهر)',
    rec: 'تكليف قيادي فوري في إدارة العمليات مع مراجعة دورية كل 6 أشهر',
    unitId: '22222222-2222-2222-2222-222222222221',
  },
  {
    id: 'a0000003-demo-0000-0000-000000000003',
    userId: 'u0000003-demo-0000-0000-000000000003',
    name: 'عبدالعزيز بن سالم الدوسري',
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    jobTitle: 'مهندس أنظمة وذكاء اصطناعي',
    dept: 'إدارة التقنية والذكاء الاصطناعي',
    exp: 7,
    readiness: 'promising',
    leadType: 'technical',
    total: 71, trust: 68,
    axes: { leadership: 62, strategic: 68, performance: 80, innovation: 88, team: 60, technology: 92, integrity: 78 },
    strengths: ['خبرة تقنية نادرة في الذكاء الاصطناعي', 'ابتكار وحل مشكلات متميز', 'أداء تقني استثنائي'],
    gaps: ['يحتاج تطوير مهارات القيادة الإنسانية', 'تعزيز التواصل مع غير التقنيين', 'رفع رضا الفريق'],
    plan: 'برنامج القيادة الرقمية 12 شهراً + تطوير مهارات إدارة الفريق + إشراكه في قرارات استراتيجية',
    rec: 'واعد جداً للقيادة التقنية خلال 18 شهراً — يحتاج تطوير قيادي مكثف',
    unitId: '22222222-2222-2222-2222-222222222223',
  },
  {
    id: 'a0000004-demo-0000-0000-000000000004',
    userId: 'u0000004-demo-0000-0000-000000000004',
    name: 'هند بنت عمر العتيبي',
    email: 'hind.otaibi@demo.jadeer.sa',
    jobTitle: 'منسقة برامج دعم الموظفين',
    dept: 'إدارة دعم الفرق والمستفيدين',
    exp: 8,
    readiness: 'human_leader',
    leadType: 'human',
    total: 76, trust: 82,
    axes: { leadership: 78, strategic: 60, performance: 70, innovation: 65, team: 94, technology: 58, integrity: 88 },
    strengths: ['رضا الفريق استثنائي (94%)', 'قدرة فائقة على بناء الثقة والتواصل', 'نزاهة عالية ومصداقية مؤسسية'],
    gaps: ['تحتاج تطوير في المؤشرات والنتائج القابلة للقياس', 'رفع مستوى استخدام التقنية', 'تعزيز التفكير الاستراتيجي'],
    plan: 'برنامج قيادة فرق الدعم + تأهيل في مؤشرات الأداء + ورشة تقنية مبسطة',
    rec: 'مناسبة جداً لقيادة فرق الدعم والمستفيدين — تحتاج تطوير في المؤشرات',
    unitId: '22222222-2222-2222-2222-222222222224',
  },
  {
    id: 'a0000005-demo-0000-0000-000000000005',
    userId: 'u0000005-demo-0000-0000-000000000005',
    name: 'فهد بن خالد المطيري',
    email: 'fahad.mutairi@demo.jadeer.sa',
    jobTitle: 'مدير برامج التطوير المؤسسي',
    dept: 'إدارة الجودة والامتثال',
    exp: 11,
    readiness: 'high_performance_low_satisfaction',
    leadType: 'operational',
    total: 74, trust: 70,
    axes: { leadership: 78, strategic: 76, performance: 94, innovation: 70, team: 48, technology: 72, integrity: 80 },
    strengths: ['أداء إنجازي استثنائي (94%)', 'التزام مؤسسي عالٍ', 'خبرة واسعة في إدارة البرامج'],
    gaps: ['رضا الفريق منخفض جداً (48%) — خطر إداري', 'أسلوب إدارة يحتاج مراجعة', 'التواصل الإنساني ضعيف'],
    plan: 'برنامج القيادة الإنسانية وإدارة الفريق (أولوية عليا) + جلسات مع مختص + إعادة تقييم بعد 6 أشهر',
    rec: 'لا يُنصح بالتكليف القيادي حالياً بسبب انخفاض رضا الفريق — برنامج تطوير مكثف أولاً',
    unitId: '22222222-2222-2222-2222-222222222225',
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const svc = createServiceClient();
  const results: string[] = [];

  for (const p of PROFILES) {
    try {
      // 1. المستخدم (بدون auth_user_id — تجريبي)
      await svc.from('users').upsert({
        id: p.userId,
        full_name: p.name,
        email: p.email,
        job_title: p.jobTitle,
        department: p.dept,
        role: 'candidate',
        is_active: true,
        is_demo: true,
      }, { onConflict: 'id' });

      // 2. ملف المرشح
      await svc.from('candidate_profiles').upsert({
        id: p.id,
        user_id: p.userId,
        years_of_experience: p.exp,
        qualification: 'ماجستير',
        specialization: p.dept,
        status: 'approved',
        completion_score: 88,
        evaluation_track: 'individual',
        is_demo: true,
      }, { onConflict: 'id' });

      // 3. مبادرتان
      for (let i = 1; i <= 2; i++) {
        await svc.from('initiatives').upsert({
          id: `${p.id}-init-${i}`,
          candidate_id: p.id,
          title: i === 1 ? `مبادرة تحسين ${p.dept}` : 'مبادرة رقمنة العمليات الداخلية',
          description: i === 1
            ? `مبادرة لتحسين كفاءة ${p.dept} بنسبة 30% خلال 6 أشهر`
            : 'أتمتة 5 عمليات يدوية ورفع سرعة الإنجاز 40%',
          impact_level: i === 1 ? 'high' : 'medium',
          status: i === 1 ? 'completed' : 'in_progress',
          start_date: '2024-01-01',
          is_demo: true,
        }, { onConflict: 'id' });
      }

      // 4. مؤشرا أداء
      for (let i = 1; i <= 2; i++) {
        await svc.from('kpis').upsert({
          id: `${p.id}-kpi-${i}`,
          candidate_id: p.id,
          title: i === 1 ? 'نسبة إنجاز المهام في الوقت المحدد' : 'رضا المستفيدين الداخليين',
          current_value: i === 1 ? 94 : p.axes.team,
          target_value: i === 1 ? 90 : 85,
          unit: '%',
          period: '2024',
          status: (i === 1 ? 94 : p.axes.team) >= 85 ? 'achieved' : 'in_progress',
          is_demo: true,
        }, { onConflict: 'id' });
      }

      // 5. البطاقة القيادية
      await svc.from('leadership_cards').upsert({
        id: `${p.id}-card`,
        candidate_profile_id: p.id,
        total_score: p.total,
        trust_score: p.trust,
        readiness_level: p.readiness,
        leadership_type: p.leadType,
        axis_scores: p.axes,
        primary_strengths: p.strengths,
        development_gaps: p.gaps,
        ai_summary: `${p.name} — ${p.rec}`,
        is_published: true,
        is_demo: true,
      }, { onConflict: 'id' });

      // 6. خطة تطوير
      await svc.from('development_plans').upsert({
        id: `${p.id}-plan`,
        candidate_profile_id: p.id,
        overall_status: 'approved',
        notes: p.plan,
        is_demo: true,
      }, { onConflict: 'id' });

      // 7. درجة الملاءمة التنظيمية
      await svc.from('position_fit_scores').upsert({
        candidate_profile_id: p.id,
        organization_unit_id: p.unitId,
        fit_score: Math.min(100, p.total + 5),
        fit_level: p.total >= 85 ? 'high' : p.total >= 70 ? 'good' : 'conditional',
        confidence_score: p.trust,
        fit_reason: `${p.strengths[0]} — ملاءمة مع متطلبات الوحدة`,
        strengths_match_json: p.strengths,
        gaps_json: p.gaps,
        ai_summary: p.rec,
        recommended_action: p.plan,
        is_demo: true,
      }, { onConflict: 'candidate_profile_id,organization_unit_id' });

      results.push(`✅ ${p.name}`);
    } catch (err: any) {
      results.push(`❌ ${p.name}: ${err.message}`);
    }
  }

  // تحديث علامة البيانات التجريبية
  await svc.from('demo_data_flags').upsert({
    is_demo_active: true,
    last_seeded_at: new Date().toISOString(),
  });

  await svc.from('audit_logs').insert({
    user_id: user.id,
    action: 'demo_data_seeded',
    entity_type: 'demo_data',
    new_values: { count: PROFILES.length },
  });

  return NextResponse.json({ ok: true, results });
}
