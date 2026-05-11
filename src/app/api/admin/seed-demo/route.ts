// POST /api/admin/seed-demo
// ينشئ 5 مرشحين تجريبيين كاملين مع جميع بياناتهم
// يستخدم service client لتجاوز RLS
// يُشغَّل مرة واحدة فقط من صفحة /admin/demo-data

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentUser } from '@/lib/auth/current-user';
import { computeGovernanceScore } from '@/lib/ai/analyzerGovernance';

const DEMO_PROFILES = [
  {
    // النموذج الأول: قائد استراتيجي جاهز خلال سنة
    id: 'demo-cand-0001-0000-0000-000000000001',
    userId: 'demo-user-0001-0000-0000-000000000001',
    name: 'سعد بن محمد الحارثي',
    email: 'saad.harthy@demo.jadeer.sa',
    job_title: 'مدير تخطيط استراتيجي',
    department: 'إدارة المشاريع الاستراتيجية',
    years_experience: 12,
    readiness: 'ready_within_year',
    leadership_type: 'strategic',
    total_score: 78,
    trust_score: 72,
    axis_scores: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['تفكير استراتيجي متميز', 'قدرة على رؤية الصورة الكبيرة', 'خبرة في تحليل البيانات المعقدة'],
    gaps: ['يحتاج تعزيز مهارات إدارة الفريق', 'تطوير رضا الفريق والتواصل القيادي'],
    development_plan: 'برنامج القيادة التحويلية 6 أشهر + تكليف تجريبي في مشروع استراتيجي',
    recommendation: 'مرشح قوي للقيادة الاستراتيجية خلال 12 شهراً بعد تطوير مهارات إدارة الفريق',
    unit_id: '22222222-2222-2222-2222-222222222222',
  },
  {
    // النموذج الثاني: قائد تشغيلي جاهز الآن
    id: 'demo-cand-0002-0000-0000-000000000002',
    userId: 'demo-user-0002-0000-0000-000000000002',
    name: 'نورة بنت عبدالله القحطاني',
    email: 'noura.qahtani@demo.jadeer.sa',
    job_title: 'رئيسة قسم العمليات',
    department: 'إدارة العمليات',
    years_experience: 9,
    readiness: 'ready_now',
    leadership_type: 'operational',
    total_score: 87,
    trust_score: 85,
    axis_scores: { leadership: 85, strategic: 72, performance: 92, innovation: 78, team: 88, technology: 80, integrity: 90 },
    strengths: ['أداء تشغيلي استثنائي', 'رضا الفريق مرتفع جداً', 'مؤشرات أداء واضحة وموثقة'],
    gaps: ['تحتاج تعزيز التخطيط طويل المدى', 'تطوير مهارات التفاوض الاستراتيجي'],
    development_plan: 'تكليف قيادي مباشر + برنامج قصير في التخطيط الاستراتيجي (3 أشهر)',
    recommendation: 'تكليف قيادي فوري في إدارة العمليات مع مراجعة دورية كل 6 أشهر',
    unit_id: '22222222-2222-2222-2222-222222222221',
  },
  {
    // النموذج الثالث: قائد تقني واعد
    id: 'demo-cand-0003-0000-0000-000000000003',
    userId: 'demo-user-0003-0000-0000-000000000003',
    name: 'عبدالعزيز بن سالم الدوسري',
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    job_title: 'مهندس أنظمة وذكاء اصطناعي',
    department: 'إدارة التقنية والذكاء الاصطناعي',
    years_experience: 7,
    readiness: 'promising',
    leadership_type: 'technical',
    total_score: 71,
    trust_score: 68,
    axis_scores: { leadership: 62, strategic: 68, performance: 80, innovation: 88, team: 60, technology: 92, integrity: 78 },
    strengths: ['خبرة تقنية نادرة في الذكاء الاصطناعي', 'ابتكار وحل مشكلات متميز', 'أداء تقني استثنائي'],
    gaps: ['يحتاج تطوير مهارات القيادة الإنسانية', 'تعزيز التواصل مع غير التقنيين', 'رفع رضا الفريق'],
    development_plan: 'برنامج القيادة الرقمية 12 شهراً + تطوير مهارات إدارة الفريق + إشراكه في قرارات استراتيجية',
    recommendation: 'واعد جداً للقيادة التقنية خلال 18 شهراً — يحتاج تطوير قيادي مكثف',
    unit_id: '22222222-2222-2222-2222-222222222223',
  },
  {
    // النموذج الرابع: قائد إنساني
    id: 'demo-cand-0004-0000-0000-000000000004',
    userId: 'demo-user-0004-0000-0000-000000000004',
    name: 'هند بنت عمر العتيبي',
    email: 'hind.otaibi@demo.jadeer.sa',
    job_title: 'منسقة برامج دعم الموظفين',
    department: 'إدارة دعم الفرق والمستفيدين',
    years_experience: 8,
    readiness: 'human_leader',
    leadership_type: 'human',
    total_score: 76,
    trust_score: 82,
    axis_scores: { leadership: 78, strategic: 60, performance: 70, innovation: 65, team: 94, technology: 58, integrity: 88 },
    strengths: ['رضا الفريق استثنائي (94%)', 'قدرة فائقة على بناء الثقة والتواصل', 'نزاهة عالية ومصداقية مؤسسية'],
    gaps: ['تحتاج تطوير في المؤشرات والنتائج القابلة للقياس', 'رفع مستوى استخدام التقنية', 'تعزيز التفكير الاستراتيجي'],
    development_plan: 'برنامج قيادة فرق الدعم + تأهيل في مؤشرات الأداء + ورشة تقنية مبسطة',
    recommendation: 'مناسبة جداً لقيادة فرق الدعم والمستفيدين — تحتاج تطوير في المؤشرات قبل توسيع المسؤولية',
    unit_id: '22222222-2222-2222-2222-222222222224',
  },
  {
    // النموذج الخامس: أداء عالٍ / رضا منخفض
    id: 'demo-cand-0005-0000-0000-000000000005',
    userId: 'demo-user-0005-0000-0000-000000000005',
    name: 'فهد بن خالد المطيري',
    email: 'fahad.mutairi@demo.jadeer.sa',
    job_title: 'مدير برامج التطوير المؤسسي',
    department: 'إدارة الجودة والامتثال',
    years_experience: 11,
    readiness: 'high_performance_low_satisfaction',
    leadership_type: 'operational',
    total_score: 74,
    trust_score: 70,
    axis_scores: { leadership: 78, strategic: 76, performance: 94, innovation: 70, team: 48, technology: 72, integrity: 80 },
    strengths: ['أداء إنجازي استثنائي (94%)', 'التزام مؤسسي عالٍ', 'خبرة واسعة في إدارة البرامج'],
    gaps: ['رضا الفريق منخفض جداً (48%) — خطر إداري', 'أسلوب إدارة يحتاج مراجعة', 'التواصل الإنساني ضعيف'],
    development_plan: 'برنامج القيادة الإنسانية وإدارة الفريق (أولوية عليا) + جلسات تطوير مع مختص + إعادة تقييم بعد 6 أشهر',
    recommendation: 'لا يُنصح بالتكليف القيادي حالياً بسبب انخفاض رضا الفريق — يُعطى برنامج تطوير مكثف أولاً',
    unit_id: '22222222-2222-2222-2222-222222222225',
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = createServiceClient();
  const results: string[] = [];

  try {
    for (const profile of DEMO_PROFILES) {
      // 1. إنشاء المستخدم في جدول users مباشرة (بدون auth.users لتجنب القيود)
      const { error: userErr } = await service.from('users').upsert({
        id: profile.userId,
        full_name: profile.name,
        email: profile.email,
        job_title: profile.job_title,
        department: profile.department,
        role: 'candidate',
        is_active: true,
        is_demo: true,
      }, { onConflict: 'id' });
      if (userErr) results.push(`❌ User ${profile.name}: ${userErr.message}`);

      // 2. الدور
      await service.from('user_roles').upsert({
        user_id: profile.userId,
        role_code: 'candidate',
        is_primary: true,
        is_demo: true,
      }, { onConflict: 'user_id,role_code' }).select();

      // 3. ملف المرشح
      const { error: profErr } = await service.from('candidate_profiles').upsert({
        id: profile.id,
        user_id: profile.userId,
        years_of_experience: profile.years_experience,
        qualification: 'ماجستير',
        specialization: profile.department,
        status: 'approved',
        completion_score: 88,
        evaluation_track: 'individual',
        is_demo: true,
      }, { onConflict: 'id' });
      if (profErr) results.push(`❌ Profile ${profile.name}: ${profErr.message}`);

      // 4. مبادرتان
      await service.from('initiatives').upsert([
        {
          id: `${profile.id}-init-1`,
          candidate_id: profile.id,
          title: `مبادرة تحسين ${profile.department}`,
          description: `مبادرة لتحسين كفاءة ${profile.department} بنسبة 30٪ خلال 6 أشهر`,
          impact_level: 'high',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          is_demo: true,
        },
        {
          id: `${profile.id}-init-2`,
          candidate_id: profile.id,
          title: 'مبادرة رقمنة العمليات الداخلية',
          description: 'أتمتة 5 عمليات يدوية ورفع سرعة الإنجاز 40٪',
          impact_level: 'medium',
          status: 'in_progress',
          start_date: '2024-07-01',
          is_demo: true,
        },
      ], { onConflict: 'id' });

      // 5. مؤشرا أداء
      await service.from('kpis').upsert([
        {
          id: `${profile.id}-kpi-1`,
          candidate_id: profile.id,
          title: 'نسبة إنجاز المهام في الوقت المحدد',
          current_value: 94,
          target_value: 90,
          unit: '٪',
          period: '2024',
          status: 'achieved',
          is_demo: true,
        },
        {
          id: `${profile.id}-kpi-2`,
          candidate_id: profile.id,
          title: 'رضا المستفيدين الداخليين',
          current_value: profile.axis_scores.team,
          target_value: 85,
          unit: '٪',
          period: '2024',
          status: profile.axis_scores.team >= 85 ? 'achieved' : 'in_progress',
          is_demo: true,
        },
      ], { onConflict: 'id' });

      // 6. البطاقة القيادية
      const { error: cardErr } = await service.from('leadership_cards').upsert({
        id: `${profile.id}-card`,
        candidate_profile_id: profile.id,
        total_score: profile.total_score,
        trust_score: profile.trust_score,
        readiness_level: profile.readiness,
        leadership_type: profile.leadership_type,
        axis_scores: profile.axis_scores,
        primary_strengths: profile.strengths,
        development_gaps: profile.gaps,
        ai_summary: `${profile.name} — ${profile.recommendation}`,
        is_published: true,
        is_demo: true,
      }, { onConflict: 'id' });
      if (cardErr) results.push(`❌ Card ${profile.name}: ${cardErr.message}`);

      // 7. خطة تطوير
      await service.from('development_plans').upsert({
        id: `${profile.id}-plan`,
        candidate_profile_id: profile.id,
        overall_status: 'approved',
        created_by_hr: true,
        notes: profile.development_plan,
        is_demo: true,
      }, { onConflict: 'id' });

      // 8. درجة ملاءمة تنظيمية
      await service.from('position_fit_scores').upsert({
        candidate_profile_id: profile.id,
        organization_unit_id: profile.unit_id,
        fit_score: profile.total_score + 5,
        fit_level: profile.total_score >= 85 ? 'high' : profile.total_score >= 70 ? 'good' : 'conditional',
        confidence_score: profile.trust_score,
        fit_reason: `${profile.strengths[0]} — ملاءمة ${profile.readiness === 'ready_now' ? 'عالية' : 'جيدة'} مع متطلبات الوحدة`,
        strengths_match_json: profile.strengths,
        gaps_json: profile.gaps,
        ai_summary: profile.recommendation,
        recommended_action: profile.development_plan,
        is_demo: true,
      }, { onConflict: 'candidate_profile_id,organization_unit_id' });

      results.push(`✅ ${profile.name}`);
    }

    // تحديث علامة البيانات التجريبية
    await service.from('demo_data_flags').upsert({
      is_demo_active: true,
      last_seeded_at: new Date().toISOString(),
    });

    // تسجيل في audit_logs
    await service.from('audit_logs').insert({
      user_id: user.id,
      action: 'demo_data_seeded',
      entity_type: 'demo_data',
      new_values: { profiles: DEMO_PROFILES.length, seeded_at: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }
}
