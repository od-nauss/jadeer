/**
 * سكربت seed لإنشاء البيانات التجريبية لمنصة جدير.
 *
 * يقوم بـ:
 * 1. إنشاء حسابات Auth الأساسية (مدير، رئيس، حوكمة، مستشار، موارد، 5 مرشحين)
 * 2. إنشاء سجلات users + ربط الأدوار
 * 3. إنشاء ملفات candidate_profiles كاملة لكل المرشحين الخمسة
 * 4. إنشاء initiatives, kpis, assessment_results
 * 5. إنشاء evaluator_nominees + approved_evaluators + evaluations_360
 * 6. إنشاء leadership_cards مع التصنيفات الصحيحة
 * 7. إنشاء development_plans
 * 8. حساب position_fit_scores
 *
 * تشغيل:
 *   npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ يجب تعيين NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// 1. الحسابات الأساسية
// ============================================================

const ACCOUNTS = [
  { email: 'admin@nauss.edu.sa', password: 'Zx.321321', full_name: 'مدير منصة جدير', job_title: 'مدير النظام', department: 'تقنية المعلومات', role: 'admin', is_demo: false },
  { email: 'president@nauss.edu.sa', password: 'Demo@2026', full_name: 'د. خالد المالكي', job_title: 'الرئيس التنفيذي', department: 'الرئاسة', role: 'president', is_demo: true },
  { email: 'governance@nauss.edu.sa', password: 'Demo@2026', full_name: 'د. ريم العيسى', job_title: 'رئيس لجنة الحوكمة', department: 'الحوكمة', role: 'governance', is_demo: true },
  { email: 'advisor@nauss.edu.sa', password: 'Demo@2026', full_name: 'أ. ماجد الزهراني', job_title: 'مستشار قيادي', department: 'المستشارية', role: 'advisor', is_demo: true },
  { email: 'hr@nauss.edu.sa', password: 'Demo@2026', full_name: 'أ. سارة الغامدي', job_title: 'مدير الموارد البشرية', department: 'الموارد البشرية', role: 'hr', is_demo: true },
];

const CANDIDATES = [
  {
    email: 'saad@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'سعد الحارثي',
    job_title: 'مدير إدارة المشاريع',
    department: 'قطاع الشؤون الأكاديمية',
    employee_number: 'EMP-1001',
    score: 78,
    trust: 85,
    leadership_type: 'strategic',
    readiness: 'ready_within_year',
    classification_label: 'جاهز خلال سنة',
    summary: 'مدير مشاريع لديه ملف قوي مع مبادرات استراتيجية موثقة، لكنه يحتاج إلى تجربة قيادية ميدانية إضافية قبل التكليف الكامل.',
    recommendation: 'برنامج إعداد قيادي 8 أشهر + تكليف بمشروع تنفيذي + إعادة تقييم بعد سنة.',
    strengths: ['تخطيط استراتيجي قوي', 'بناء شبكات علاقات', 'تحليل البيانات', 'إدارة المشاريع المعقدة'],
    gaps: ['يحتاج تطويراً في إدارة الأزمات', 'تجربة محدودة في الفرق الكبيرة'],
  },
  {
    email: 'noura@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'نورة القحطاني',
    job_title: 'رئيس قسم العمليات',
    department: 'إدارة العمليات',
    employee_number: 'EMP-1002',
    score: 87,
    trust: 91,
    leadership_type: 'operational',
    readiness: 'ready_now',
    classification_label: 'جاهز الآن',
    summary: 'بيانات متسقة جداً عبر المصادر. تقييم 360 يدعم الأداء، المبادرات موثقة، رضا الفريق عالٍ.',
    recommendation: 'تكليف قيادي مباشر + برنامج قصير في التخطيط الاستراتيجي + متابعة بعد 3 أشهر.',
    strengths: ['قوة تشغيلية', 'رضا فريق مرتفع', 'مؤشرات أداء ناضجة', 'خبرة في تحسين الإجراءات'],
    gaps: ['تعزيز التخطيط طويل المدى'],
  },
  {
    email: 'abdulaziz@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'عبدالعزيز الدوسري',
    job_title: 'مهندس بيانات أول',
    department: 'إدارة التقنية والذكاء الاصطناعي',
    employee_number: 'EMP-1003',
    score: 71,
    trust: 77,
    leadership_type: 'technical',
    readiness: 'promising',
    classification_label: 'واعد ويحتاج تطويراً موجهاً',
    summary: 'كفاءة تقنية عالية لكن بحاجة لتطوير في القيادة الناعمة قبل التكليف بإدارة كبيرة.',
    recommendation: 'برنامج التواصل القيادي + إدارة أصحاب العلاقة + تكليف بفريق صغير + إعادة تقييم بعد 6 أشهر.',
    strengths: ['تخصص تقني عميق', 'ابتكار في الحلول', 'استخدام متقدم للذكاء الاصطناعي'],
    gaps: ['التواصل القيادي', 'إدارة أصحاب العلاقة', 'محدودية في إدارة الفرق'],
  },
  {
    email: 'hind@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'هند العتيبي',
    job_title: 'مديرة وحدة دعم الفرق',
    department: 'إدارة دعم الفرق والمستفيدين',
    employee_number: 'EMP-1004',
    score: 76,
    trust: 88,
    leadership_type: 'human_leader',
    readiness: 'human_leader',
    classification_label: 'قائد إنساني محتمل',
    summary: 'قائد إنساني مناسب لفرق الدعم، لكن يحتاج تأهيلاً في إدارة بالنتائج قبل التوسع لقيادة أكبر.',
    recommendation: 'تدريب على بناء مؤشرات الأداء + تكليف بإعداد لوحة مؤشرات + متابعة الأثر بعد 3 أشهر.',
    strengths: ['ذكاء عاطفي عالٍ', 'دعم الفرق', 'إدارة الخلافات', 'رضا فريق ممتاز'],
    gaps: ['ضعف في مؤشرات الأداء', 'تحتاج تأهيلاً في المؤشرات والنتائج', 'تفكير استراتيجي محدود'],
  },
  {
    email: 'fahad@nauss.edu.sa',
    password: 'Demo@2026',
    full_name: 'فهد المطيري',
    job_title: 'مدير إدارة الجودة',
    department: 'إدارة الجودة والامتثال',
    employee_number: 'EMP-1005',
    score: 81,
    trust: 79,
    leadership_type: 'achiever',
    readiness: 'high_performance_low_satisfaction',
    classification_label: 'لا يناسب القيادة المباشرة حالياً',
    summary: 'هذا المرشح يحقق نتائج قوية، لكن تقييم رضا الفريق منخفض. ينصح بمراجعة نمط القيادة قبل اعتماد جاهزية قيادية مباشرة.',
    recommendation: 'تدريب في القيادة الإنسانية + إرشاد في إدارة الخلافات + قياس رضا الفريق لاحقاً + عدم تكليف مباشر بفريق كبير قبل التحسن.',
    strengths: ['أداء قوي', 'مبادرات مؤثرة', 'مؤشرات تشغيلية ناضجة', 'إنجازات موثقة'],
    gaps: ['رضا الفريق منخفض', 'إدارة الخلافات', 'الذكاء العاطفي', 'مرونة في التعامل'],
  },
];

async function ensureRoles() {
  // الأدوار يجب أن تكون موجودة من seed.sql
  const { data: roles } = await supabase.from('roles').select('id, code');
  if (!roles || roles.length === 0) {
    throw new Error('الأدوار غير موجودة. شغّل supabase/02_seed.sql أولاً.');
  }
  return new Map(roles.map((r) => [r.code, r.id]));
}

async function createUser(account: typeof ACCOUNTS[0], roleMap: Map<string, string>) {
  console.log(`🔵 إنشاء مستخدم: ${account.email}`);

  // تحقق ما إذا كان موجوداً مسبقاً
  const { data: existing } = await supabase.from('users').select('id').eq('email', account.email).maybeSingle();
  if (existing) {
    console.log(`   ⏭️  موجود مسبقاً، تخطي.`);
    return existing.id;
  }

  // إنشاء حساب Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.full_name },
  });

  if (authError || !authData.user) {
    console.error(`   ❌ فشل إنشاء Auth: ${authError?.message}`);
    return null;
  }

  // إنشاء سجل users
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .insert({
      auth_user_id: authData.user.id,
      email: account.email,
      full_name: account.full_name,
      job_title: account.job_title,
      department: account.department,
      employee_number: ('employee_number' in account ? (account as Record<string, unknown>).employee_number : null) as string | null,
      is_active: true,
      is_demo: account.is_demo,
    })
    .select('id')
    .single();

  if (userError || !userRow) {
    console.error(`   ❌ فشل إنشاء users: ${userError?.message}`);
    await supabase.auth.admin.deleteUser(authData.user.id);
    return null;
  }

  // ربط الدور
  const roleId = roleMap.get(account.role);
  if (roleId) {
    await supabase.from('user_roles').insert({ user_id: userRow.id, role_id: roleId });
  }

  console.log(`   ✅ تم.`);
  return userRow.id;
}

async function createCandidateProfile(userId: string, candidate: typeof CANDIDATES[0]) {
  console.log(`📋 ملف قيادي: ${candidate.full_name}`);

  // candidate_profile
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: userId,
      status: 'completed',
      completion_score: 100,
      years_of_experience: 8 + Math.floor(Math.random() * 7),
      academic_qualifications: 'ماجستير الإدارة من جامعة الملك سعود (2018)\nبكالوريوس من جامعة نايف (2014)',
      previous_experience: 'تنقل بين عدة أدوار قيادية وإدارية على مدى 10 سنوات في القطاع الأكاديمي والإداري.',
      skills_and_tools: 'إدارة المشاريع، Power BI، تحليل البيانات، Six Sigma، إدارة الأزمات',
      evaluation_track: 'individual',
      is_demo: true,
    })
    .select('id')
    .single();

  if (!profile) return null;

  // مبادرات
  await supabase.from('initiatives').insert([
    { candidate_profile_id: profile.id, title: 'مبادرة تطوير الإجراءات الرقمية', role: 'قائد المبادرة', impact: 'تقليل وقت معالجة الطلبات بنسبة 35%', witnesses: 'مدير الإدارة، 3 من فريق العمل', status: 'verified', is_demo: true },
    { candidate_profile_id: profile.id, title: 'مشروع تطوير لوحة المؤشرات الإدارية', role: 'مشرف رئيسي', impact: 'توفير رؤية لحظية للقيادة عن أداء الإدارة', witnesses: 'الرئيس التنفيذي، الإدارة العليا', status: 'verified', is_demo: true },
    { candidate_profile_id: profile.id, title: 'برنامج تأهيل الموظفين الجدد', role: 'مصمم البرنامج', impact: 'رفع جاهزية الموظفين الجدد بنسبة 50%', witnesses: 'الموارد البشرية، 12 موظف جديد', status: 'verified', is_demo: true },
  ]);

  // مؤشرات
  await supabase.from('kpis').insert([
    { candidate_profile_id: profile.id, name: 'رضا المستفيدين', target: '85%', achieved: '91%', maturity_level: 'متقدم', verification_source: 'استبيان فصلي', is_demo: true },
    { candidate_profile_id: profile.id, name: 'وقت معالجة الطلب', target: '3 أيام', achieved: '2.4 يوم', maturity_level: 'تشغيلي', verification_source: 'تقارير النظام', is_demo: true },
    { candidate_profile_id: profile.id, name: 'نسبة إنجاز المشاريع في موعدها', target: '90%', achieved: '94%', maturity_level: 'متقدم', verification_source: 'لوحة المشاريع', is_demo: true },
  ]);

  // نتائج اختبارات (نحتاج قائمة الاختبارات أولاً)
  const { data: assessments } = await supabase.from('assessments').select('id').limit(8);
  if (assessments && assessments.length > 0) {
    await supabase.from('assessment_results').insert(
      assessments.map((a) => ({
        candidate_profile_id: profile.id,
        assessment_id: a.id,
        score: 65 + Math.floor(Math.random() * 30),
        is_demo: true,
      }))
    );
  }

  // مرشحون للتقييم 360 (15 مقترح + 8 معتمدون)
  const nomineeNames = [
    'م. محمد العبدالله', 'أ. فاطمة الزهراني', 'م. عبدالله الغامدي', 'أ. منى السبيعي', 'م. أحمد القحطاني',
    'أ. ريم الحربي', 'م. سلمان الدوسري', 'أ. هدى المطيري', 'م. خالد العتيبي', 'أ. أمل العنزي',
    'م. ياسر الشهري', 'أ. لمى البلوي', 'م. فيصل الراشد', 'أ. نوف القرني', 'م. عمر الشمري',
  ];
  const relationships = ['مدير مباشر', 'زميل', 'زميل', 'مرؤوس', 'مرؤوس', 'صاحب علاقة', 'زميل', 'زميل', 'مرؤوس', 'صاحب علاقة', 'زميل', 'مرؤوس', 'صاحب علاقة', 'زميل', 'مرؤوس'];

  const nomineesData = nomineeNames.map((name, i) => ({
    candidate_profile_id: profile.id,
    evaluator_name: name,
    evaluator_email: `evaluator${i + 1}@nauss.edu.sa`,
    relationship: relationships[i],
    status: i < 8 ? 'approved' : 'pending',
    is_demo: true,
  }));
  await supabase.from('evaluator_nominees').insert(nomineesData);

  // approved_evaluators (الـ8 المعتمدون)
  const approvedNominees = nomineesData.slice(0, 8);
  const { data: approvedEvaluators } = await supabase
    .from('approved_evaluators')
    .insert(
      approvedNominees.map((n) => ({
        candidate_profile_id: profile.id,
        evaluator_name: n.evaluator_name,
        evaluator_email: n.evaluator_email,
        relationship: n.relationship,
        approved_by_committee: true,
        is_demo: true,
      }))
    )
    .select('id');

  // evaluations_360 لكل مقيم معتمد
  if (approvedEvaluators) {
    const baseScore = candidate.score;
    const variance = 10;
    for (const ev of approvedEvaluators) {
      const axisScores: Record<string, number> = {};
      const axes = ['leadership', 'strategic', 'performance', 'innovation', 'team_satisfaction', 'stakeholder_relations', 'communication', 'crisis_management', 'decision_making', 'integrity', 'tech_ai', 'data_driven', 'team_development', 'institutional_loyalty'];
      for (const axis of axes) {
        const adj = candidate.readiness === 'high_performance_low_satisfaction' && (axis === 'team_satisfaction' || axis === 'team_development')
          ? -25
          : candidate.readiness === 'human_leader' && axis === 'performance'
          ? -15
          : 0;
        axisScores[axis] = Math.max(40, Math.min(100, Math.round((baseScore + adj + (Math.random() * variance * 2 - variance)) / 10)));
      }
      await supabase.from('evaluations_360').insert({
        candidate_profile_id: profile.id,
        evaluator_id: ev.id,
        axis_scores: axisScores,
        verification_answers: { know_initiatives: 'نعم', team_satisfaction_check: 'مرتفع', recommend_for_leadership: 'نعم' },
        general_note: 'تقييم تجريبي مولّد لأغراض العرض.',
        submitted_at: new Date().toISOString(),
        is_demo: true,
      });
    }
  }

  // البطاقة القيادية
  const axisScores = {
    'القيادة والتأثير': candidate.score - 2 + Math.floor(Math.random() * 5),
    'التفكير الاستراتيجي': candidate.score - 3 + Math.floor(Math.random() * 5),
    'الأداء والإنجاز': candidate.readiness === 'high_performance_low_satisfaction' ? candidate.score + 5 : candidate.score,
    'الابتكار والمبادرات': candidate.score - 4 + Math.floor(Math.random() * 6),
    'رضا الفريق': candidate.readiness === 'high_performance_low_satisfaction' ? candidate.score - 25 : candidate.readiness === 'human_leader' ? candidate.score + 8 : candidate.score - 1,
    'استخدام التقنية': candidate.leadership_type === 'technical' ? candidate.score + 10 : candidate.score - 5,
    'النزاهة والالتزام': candidate.score + 3,
  };

  // organization_fit map
  const { data: units } = await supabase.from('organization_units').select('id, name');
  const fitMap: Record<string, number> = {};
  if (units) {
    for (const u of units.slice(0, 5)) {
      fitMap[u.name] = 60 + Math.floor(Math.random() * 35);
    }
  }

  await supabase.from('leadership_cards').insert({
    candidate_profile_id: profile.id,
    total_score: candidate.score,
    trust_score: candidate.trust,
    readiness_level: candidate.readiness,
    leadership_type: candidate.leadership_type,
    is_hidden_leader: false,
    primary_strengths: candidate.strengths,
    development_gaps: candidate.gaps,
    executive_summary: candidate.summary,
    recommendation: candidate.recommendation,
    axis_scores: axisScores,
    organization_fit: fitMap,
    is_published: true,
    approved_at: new Date().toISOString(),
    is_demo: true,
  });

  // خطة تطوير
  await supabase.from('development_plans').insert({
    candidate_profile_id: profile.id,
    summary: `خطة تطوير ${candidate.full_name} مبنية على فجوات البطاقة القيادية. مدة الخطة 12 شهراً مع متابعة فصلية.`,
    items: candidate.gaps.map((gap, i) => ({
      skill: gap,
      program: `برنامج تطوير ${gap}`,
      duration: `${4 + i * 2} أسابيع`,
      priority: i === 0 ? 'high' : 'medium',
      status: 'in_progress',
    })),
    status: 'active',
    is_demo: true,
  });

  console.log(`   ✅ ملف ${candidate.full_name} اكتمل بالكامل.`);
  return profile.id;
}

async function main() {
  console.log('🚀 بدء seed منصة جدير\n');

  // تأكد من توفر الأدوار
  const roleMap = await ensureRoles();
  console.log(`✅ ${roleMap.size} دور متاح\n`);

  // إنشاء الحسابات الأساسية
  console.log('━━━━━ الحسابات الأساسية ━━━━━');
  for (const account of ACCOUNTS) {
    await createUser(account, roleMap);
  }

  // إنشاء المرشحين
  console.log('\n━━━━━ المرشحون التجريبيون ━━━━━');
  for (const candidate of CANDIDATES) {
    const userId = await createUser({ ...candidate, role: 'candidate', is_demo: true }, roleMap);
    if (userId) {
      await createCandidateProfile(userId, candidate);
    }
  }

  // تحديث flag
  await supabase
    .from('demo_data_flags')
    .upsert({
      is_demo_active: true,
      created_at: new Date().toISOString(),
      total_demo_records: 250,
    });

  console.log('\n🎉 اكتمل seed منصة جدير!\n');
  console.log('━━━━━ بيانات الدخول ━━━━━');
  console.log('Admin    : admin@nauss.edu.sa / Zx.321321');
  console.log('President: president@nauss.edu.sa / Demo@2026');
  console.log('Governance: governance@nauss.edu.sa / Demo@2026');
  console.log('HR       : hr@nauss.edu.sa / Demo@2026');
  console.log('Advisor  : advisor@nauss.edu.sa / Demo@2026');
  console.log('Candidate: saad@nauss.edu.sa / Demo@2026 (5 مرشحين)');
  console.log('\nExecutive Center: 1170');
}

main().catch((err) => {
  console.error('❌ خطأ:', err);
  process.exit(1);
});
