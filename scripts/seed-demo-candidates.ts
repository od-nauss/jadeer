/**
 * seed-demo-candidates.ts
 * ========================
 * سكربت إنشاء 5 مرشحين تجريبيين كاملين لمنصة جدير
 * التشغيل: npx tsx scripts/seed-demo-candidates.ts
 *
 * يُنشئ بيانات واقعية ومتسقة منطقياً لكل مرشح في جميع جداول قاعدة البيانات
 * جميع البيانات تحمل is_demo = true وتُحذف من /admin/demo-data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ متغيرات البيئة NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY مطلوبة');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────
// بيانات المرشحين الخمسة
// ─────────────────────────────────────────────────────────────

const DEMO_CANDIDATES = [
  // ══════════════════════════════════════════════════════════
  // النموذج 1: قائد استراتيجي جاهز خلال سنة
  // ══════════════════════════════════════════════════════════
  {
    meta: {
      authEmail: 'saad.harthy.demo@jadeer.sa',
      authPassword: 'Jadeer@Demo2025',
      userId: 'demo1111-0000-0000-0000-000000000001',
      profileId: 'prof1111-0000-0000-0000-000000000001',
    },
    user: {
      id: 'demo1111-0000-0000-0000-000000000001',
      full_name: 'سعد بن محمد الحارثي',
      email: 'saad.harthy.demo@jadeer.sa',
      job_title: 'مدير التخطيط الاستراتيجي',
      department: 'إدارة المشاريع الاستراتيجية',
      employee_number: 'EMP-1042',
      is_active: true,
      is_demo: true,
    },
    profile: {
      id: 'prof1111-0000-0000-0000-000000000001',
      user_id: 'demo1111-0000-0000-0000-000000000001',
      years_of_experience: 12,
      qualification: 'ماجستير إدارة الأعمال',
      specialization: 'التخطيط الاستراتيجي والسياسات المؤسسية',
      educational_institution: 'جامعة الملك عبدالعزيز',
      graduation_year: 2014,
      internal_experience: 'قاد فريق التخطيط الاستراتيجي لمدة 5 سنوات، أشرف على إعداد الخطة الاستراتيجية للجامعة 2025-2030، وشارك في 12 لجنة مؤسسية عليا.',
      past_leadership_tasks: 'رئيس لجنة التحول الرقمي، عضو مجلس الجودة المؤسسي، منسق الشراكات الأكاديمية الدولية.',
      completion_score: 91,
      status: 'approved',
      evaluation_track: 'individual',
      is_demo: true,
    },
    card: {
      id: 'card1111-0000-0000-0000-000000000001',
      readiness_level: 'ready_within_year',
      leadership_type: 'strategic',
      total_score: 78,
      trust_score: 81,
      axis_scores: { leadership: 80, strategic: 91, performance: 74, innovation: 79, team: 68, technology: 76, integrity: 88 },
      primary_strengths: [
        'تفكير استراتيجي متميز — يرى الصورة الكبيرة ويربط الأهداف بالموارد بدقة',
        'إتقان عالٍ في بناء السياسات والأطر المؤسسية',
        'خبرة واسعة في الشراكات الأكاديمية والمؤسسية',
      ],
      development_gaps: [
        'يحتاج تعزيز رضا الفريق وأساليب الإدارة التشاركية',
        'تطوير مهارات التواصل القيادي مع مختلف المستويات الوظيفية',
        'بناء سجل أكبر في القيادة التنفيذية المباشرة لفرق كبيرة (أكثر من 20 موظف)',
      ],
      ai_summary: `سعد الحارثي كفاءة استراتيجية نادرة بالمنظومة الأمنية الأكاديمية. درجة ثقة في التصنيف: عالية (81%). يُوصى بمسار تأهيل لمنصب مدير عام خلال 12 شهراً، مشروطاً بإتمام برنامج القيادة التحويلية وتكليف إداري تجريبي. أبرز مخاطر التصنيف: رضا الفريق 68% يُشير إلى فجوة في الأسلوب القيادي اليومي رغم القوة الاستراتيجية العالية.`,
      is_published: true,
      is_demo: true,
    },
    initiatives: [
      { title: 'الخطة الاستراتيجية 2025-2030', description: 'قيادة فريق إعداد الخطة الاستراتيجية متعددة السنوات بمشاركة 40 قيادياً', impact_level: 'high', status: 'completed', start_date: '2023-01-15', end_date: '2023-09-30', achievement_percentage: 100, estimated_impact: 'رسم مسار مؤسسي لـ 850 موظف على 5 سنوات' },
      { title: 'مشروع شراكات الجامعات الأمنية الدولية', description: 'توسيع شبكة الشراكات الأكاديمية مع 8 جامعات أمنية عالمية', impact_level: 'high', status: 'completed', start_date: '2022-06-01', end_date: '2023-03-31', achievement_percentage: 100, estimated_impact: '8 اتفاقيات تعاون دولية جديدة' },
      { title: 'نظام قياس الأداء المؤسسي', description: 'بناء منظومة KPIs مؤسسية متكاملة لقياس الأداء على مستوى الجامعة', impact_level: 'high', status: 'completed', start_date: '2022-02-01', end_date: '2022-11-30', achievement_percentage: 100, estimated_impact: 'تحسين نسبة الإنجاز المؤسسي 23%' },
      { title: 'برنامج القيادة الاستراتيجية الداخلي', description: 'تصميم وتنفيذ برنامج تطوير قيادي للمستويات المتوسطة', impact_level: 'medium', status: 'in_progress', start_date: '2024-03-01', achievement_percentage: 65, estimated_impact: '35 قائداً في مسار التطوير' },
    ],
    kpis: [
      { title: 'نسبة إنجاز مبادرات الخطة الاستراتيجية', current_value: 87, target_value: 85, unit: '%', period: '2024', status: 'achieved' },
      { title: 'عدد الشراكات الدولية النشطة', current_value: 12, target_value: 10, unit: 'شراكة', period: '2024', status: 'achieved' },
      { title: 'درجة رضا القيادة عن جودة التقارير الاستراتيجية', current_value: 4.3, target_value: 4.0, unit: '/5', period: '2024', status: 'achieved' },
      { title: 'نسبة مشاركة الإدارات في جلسات التخطيط', current_value: 78, target_value: 90, unit: '%', period: '2024', status: 'in_progress' },
      { title: 'متوسط سرعة إعداد التقارير الاستراتيجية', current_value: 4.2, target_value: 3.0, unit: 'يوم', period: '2024', status: 'in_progress' },
    ],
    evaluators: [
      { name: 'د. عبدالرحمن الزهراني', relation: 'manager', email: 'alzahrani.demo@jadeer.sa', status: 'submitted' },
      { name: 'م. نوف العتيبي', relation: 'colleague', email: 'notaibi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. سلطان البقمي', relation: 'colleague', email: 'albaqmi.demo@jadeer.sa', status: 'submitted' },
      { name: 'د. مها السهلي', relation: 'subordinate', email: 'alsahli.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. فيصل الدوسري', relation: 'internal_client', email: 'aldosari.demo@jadeer.sa', status: 'submitted' },
    ],
    eval360Scores: { leadership: 74, strategic: 89, performance: 71, innovation: 78, team: 62, technology: 73, integrity: 85 },
    devPlan: {
      overall_status: 'approved',
      notes: 'خطة تطوير قيادي مكثفة لتأهيل المرشح لمنصب قيادي استراتيجي خلال 12 شهراً',
      items: [
        { title: 'برنامج القيادة التحويلية', category: 'training', description: 'برنامج قيادي متقدم مع أكاديمية هارفارد للقيادة', due_date: '2025-06-30', status: 'in_progress', responsible: 'إدارة الموارد البشرية' },
        { title: 'تكليف تجريبي — رئيس قسم التطوير المؤسسي', category: 'assignment', description: 'تكليف تنفيذي لمدة 6 أشهر لبناء سجل قيادي عملي', due_date: '2025-09-30', status: 'pending', responsible: 'الرئيس المباشر' },
        { title: 'برنامج إدارة الفرق عالية الأداء', category: 'coaching', description: 'تطوير مهارات القيادة التشاركية وإدارة التنوع في الفريق', due_date: '2025-04-30', status: 'in_progress', responsible: 'مستشار قيادي خارجي' },
        { title: 'إتقان أدوات قيادة الاجتماعات والقرار الجماعي', category: 'skill', description: 'ورش عمل تطبيقية في تسهيل الجلسات القيادية', due_date: '2025-03-31', status: 'pending', responsible: 'مدير التدريب' },
        { title: 'إعادة تقييم شامل', category: 'assessment', description: 'إعادة تقييم 360 وتحديث البطاقة القيادية', due_date: '2025-12-31', status: 'pending', responsible: 'لجنة الحوكمة' },
      ],
    },
    govDecision: {
      decision_type: 'conditional_approval',
      reason: 'بعد مراجعة الملف القيادي والتقييم المتعدد المصادر، ترى لجنة الحوكمة أن المرشح سعد الحارثي يمتلك كفاءة استراتيجية عالية تؤهله للمناصب القيادية العليا. يُشترط إتمام برنامج القيادة التحويلية والتكليف التجريبي المقرر قبل صدور القرار النهائي بالترقية.',
      conditions: ['إتمام برنامج القيادة التحويلية بدرجة لا تقل عن 85%', 'تقييم 360 محدّث بعد التكليف التجريبي يُظهر تحسناً في رضا الفريق بنسبة 15% على الأقل'],
    },
    unitId: '22222222-2222-2222-2222-222222222222',
  },

  // ══════════════════════════════════════════════════════════
  // النموذج 2: قائد تشغيلي جاهز الآن
  // ══════════════════════════════════════════════════════════
  {
    meta: {
      authEmail: 'noura.qahtani.demo@jadeer.sa',
      authPassword: 'Jadeer@Demo2025',
      userId: 'demo2222-0000-0000-0000-000000000002',
      profileId: 'prof2222-0000-0000-0000-000000000002',
    },
    user: {
      id: 'demo2222-0000-0000-0000-000000000002',
      full_name: 'نورة بنت عبدالله القحطاني',
      email: 'noura.qahtani.demo@jadeer.sa',
      job_title: 'رئيسة قسم العمليات والجودة',
      department: 'إدارة العمليات',
      employee_number: 'EMP-0857',
      is_active: true,
      is_demo: true,
    },
    profile: {
      id: 'prof2222-0000-0000-0000-000000000002',
      user_id: 'demo2222-0000-0000-0000-000000000002',
      years_of_experience: 9,
      qualification: 'بكالوريوس هندسة صناعية',
      specialization: 'إدارة العمليات وتحسين الجودة',
      educational_institution: 'جامعة الملك فهد للبترول والمعادن',
      graduation_year: 2016,
      internal_experience: 'ترأست قسم العمليات منذ 2021، حققت خفض 31% في زمن المعالجة التشغيلية، وطورت منظومة متابعة أداء يومية تُعتمد من 3 إدارات.',
      past_leadership_tasks: 'قائدة مشروع التحسين التشغيلي 2022-2024، مسؤولة جودة الإجراءات الداخلية، منسقة تحديث أنظمة العمل.',
      completion_score: 96,
      status: 'approved',
      evaluation_track: 'individual',
      is_demo: true,
    },
    card: {
      id: 'card2222-0000-0000-0000-000000000002',
      readiness_level: 'ready_now',
      leadership_type: 'operational',
      total_score: 91,
      trust_score: 89,
      axis_scores: { leadership: 88, strategic: 74, performance: 96, innovation: 81, team: 91, technology: 84, integrity: 93 },
      primary_strengths: [
        'أداء تشغيلي استثنائي — أعلى درجة في محور الأداء (96%) بين جميع المرشحين',
        'رضا الفريق 91% — أداة بناء فرق عالية الأداء والإلهام المهني',
        'نزاهة مؤسسية عالية (93%) — يُشهد لها بالشفافية والمسؤولية',
        'تحسين مستمر ومُقاس للإجراءات التشغيلية',
      ],
      development_gaps: [
        'التفكير الاستراتيجي بعيد المدى — التركيز حالياً على العمليات اليومية',
        'تعزيز الحضور في الاجتماعات القيادية العليا وإبداء الرأي الاستراتيجي',
      ],
      ai_summary: `نورة القحطاني نموذج القائد التشغيلي الجاهز فوراً. درجة ثقة عالية جداً (89%). يُوصى بتعيينها مديرة إدارة العمليات في أقرب فرصة ممكنة. أداؤها الموثق يتجاوز متطلبات المنصب بمرحلتين. الفجوة الوحيدة (التفكير الاستراتيجي 74%) لا تُعيق القرار الفوري وتُعالج بسهولة خلال السنة الأولى في المنصب.`,
      is_published: true,
      is_demo: true,
    },
    initiatives: [
      { title: 'مشروع التحسين التشغيلي الشامل', description: 'إعادة هيكلة 18 إجراءً تشغيلياً وتحقيق خفض 31% في زمن الإنجاز', impact_level: 'high', status: 'completed', start_date: '2022-09-01', end_date: '2024-02-28', achievement_percentage: 100, estimated_impact: 'توفير 2400 ساعة عمل سنوياً' },
      { title: 'منظومة متابعة الأداء اليومي', description: 'بناء نظام داشبورد تشغيلي يومي مرتبط بـ KPIs الإدارة', impact_level: 'high', status: 'completed', start_date: '2023-01-01', end_date: '2023-06-30', achievement_percentage: 100, estimated_impact: 'رفع نسبة الإنجاز في الوقت المحدد من 71% إلى 94%' },
      { title: 'برنامج تطوير المهارات التشغيلية للفريق', description: 'برنامج تدريبي داخلي لتطوير كفاءات 24 موظفاً', impact_level: 'medium', status: 'completed', start_date: '2023-07-01', end_date: '2023-12-31', achievement_percentage: 100, estimated_impact: '18 موظفاً حصلوا على شهادات احترافية' },
      { title: 'مبادرة رقمنة طلبات الخدمة الداخلية', description: 'تحويل 100% من طلبات الخدمة الورقية إلى نظام رقمي', impact_level: 'high', status: 'in_progress', start_date: '2024-06-01', achievement_percentage: 78, estimated_impact: 'خفض وقت المعالجة 45%' },
      { title: 'نظام إدارة شكاوى المستفيدين الداخليين', description: 'منظومة متكاملة لاستقبال وحل الشكاوى في 48 ساعة', impact_level: 'medium', status: 'completed', start_date: '2024-01-01', end_date: '2024-04-30', achievement_percentage: 100, estimated_impact: 'رفع رضا المستفيدين من 74% إلى 91%' },
    ],
    kpis: [
      { title: 'نسبة إنجاز المهام في الوقت المحدد', current_value: 94, target_value: 90, unit: '%', period: '2024', status: 'achieved' },
      { title: 'درجة رضا المستفيدين الداخليين', current_value: 4.6, target_value: 4.0, unit: '/5', period: '2024', status: 'achieved' },
      { title: 'نسبة خفض وقت المعالجة التشغيلية', current_value: 31, target_value: 25, unit: '%', period: '2024', status: 'achieved' },
      { title: 'نسبة إتمام مبادرات التحسين المجدولة', current_value: 92, target_value: 85, unit: '%', period: '2024', status: 'achieved' },
      { title: 'معدل دوران الموظفين في القسم', current_value: 3, target_value: 8, unit: '%', period: '2024', status: 'achieved' },
      { title: 'درجة رضا الفريق الداخلي', current_value: 4.7, target_value: 4.2, unit: '/5', period: '2024', status: 'achieved' },
    ],
    evaluators: [
      { name: 'م. عبدالكريم الشمري', relation: 'manager', email: 'alshamri.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. ريم الحربي', relation: 'colleague', email: 'alharbi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. تركي العنزي', relation: 'subordinate', email: 'alanazi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. منال السلمي', relation: 'subordinate', email: 'alsalmi.demo@jadeer.sa', status: 'submitted' },
      { name: 'م. بندر الزهراني', relation: 'internal_client', email: 'bzahrani.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. لمياء العسيري', relation: 'colleague', email: 'alasiri.demo@jadeer.sa', status: 'submitted' },
    ],
    eval360Scores: { leadership: 87, strategic: 71, performance: 95, innovation: 80, team: 92, technology: 83, integrity: 94 },
    devPlan: {
      overall_status: 'approved',
      notes: 'خطة تطوير مكملة لتعزيز البُعد الاستراتيجي دون تأخير التعيين',
      items: [
        { title: 'برنامج القيادة الاستراتيجية للقادة التشغيليين', category: 'training', description: 'برنامج 3 أشهر في التحليل الاستراتيجي وصنع القرار على مستوى الإدارة العليا', due_date: '2025-06-30', status: 'pending', responsible: 'إدارة الموارد البشرية' },
        { title: 'المشاركة في الاجتماعات الاستراتيجية كمستمعة نشطة', category: 'exposure', description: 'حضور 12 اجتماعاً للقيادة العليا مع مشاركة تحليلية', due_date: '2025-12-31', status: 'in_progress', responsible: 'المدير المباشر' },
        { title: 'إعداد ورقة سياسة مؤسسية', category: 'assignment', description: 'قيادة إعداد ورقة سياسة تشغيلية وتقديمها لمجلس الإدارة', due_date: '2025-09-30', status: 'pending', responsible: 'إدارة التخطيط' },
      ],
    },
    govDecision: {
      decision_type: 'approved',
      reason: 'بعد مراجعة معمّقة لملف المرشحة نورة القحطاني، يُقرر مجلس الحوكمة الاعتماد الكامل بالإجماع. تمتلك المرشحة سجلاً تشغيلياً استثنائياً موثقاً بمؤشرات قابلة للقياس، وتقييم 360° ممتاز يعكس ثقة الفريق والمستفيدين. تُوصي اللجنة بالترقية الفورية لمنصب مديرة إدارة العمليات.',
      conditions: [],
    },
    unitId: '22222222-2222-2222-2222-222222222221',
  },

  // ══════════════════════════════════════════════════════════
  // النموذج 3: قائد تقني واعد — يحتاج 18 شهراً
  // ══════════════════════════════════════════════════════════
  {
    meta: {
      authEmail: 'abdulaziz.dosari.demo@jadeer.sa',
      authPassword: 'Jadeer@Demo2025',
      userId: 'demo3333-0000-0000-0000-000000000003',
      profileId: 'prof3333-0000-0000-0000-000000000003',
    },
    user: {
      id: 'demo3333-0000-0000-0000-000000000003',
      full_name: 'عبدالعزيز بن سالم الدوسري',
      email: 'abdulaziz.dosari.demo@jadeer.sa',
      job_title: 'مهندس أنظمة ذكاء اصطناعي أول',
      department: 'إدارة التقنية والذكاء الاصطناعي',
      employee_number: 'EMP-1178',
      is_active: true,
      is_demo: true,
    },
    profile: {
      id: 'prof3333-0000-0000-0000-000000000003',
      user_id: 'demo3333-0000-0000-0000-000000000003',
      years_of_experience: 7,
      qualification: 'بكالوريوس علوم الحاسب',
      specialization: 'الذكاء الاصطناعي وتعلم الآلة',
      educational_institution: 'جامعة الملك عبدالله للعلوم والتقنية (كاوست)',
      graduation_year: 2018,
      internal_experience: 'طوّر 3 نماذج ذكاء اصطناعي مُطبَّقة داخلياً، وقاد فريقاً تقنياً صغيراً (4 مهندسين) لمدة سنة واحدة.',
      past_leadership_tasks: 'قائد تقني لمشاريع الذكاء الاصطناعي، مسؤول التدريب التقني الداخلي.',
      completion_score: 84,
      status: 'approved',
      evaluation_track: 'individual',
      is_demo: true,
    },
    card: {
      id: 'card3333-0000-0000-0000-000000000003',
      readiness_level: 'promising',
      leadership_type: 'technical',
      total_score: 62,
      trust_score: 58,
      axis_scores: { leadership: 54, strategic: 61, performance: 82, innovation: 91, team: 52, technology: 95, integrity: 79 },
      primary_strengths: [
        'استخدام التقنية والذكاء الاصطناعي 95% — الأعلى بين جميع المرشحين',
        'ابتكار متميز (91%) — يُقدّم حلولاً جذرية لمشكلات معقدة',
        'أداء فردي عالٍ في المهام التقنية المتخصصة (82%)',
      ],
      development_gaps: [
        'القيادة والتأثير 54% — يجد صعوبة في إقناع غير التقنيين بالأولويات',
        'رضا الفريق 52% — أسلوب قيادي تقني صارم يفتقر للجانب الإنساني',
        'التفكير الاستراتيجي 61% — يُتقن الحلول التقنية لكنه يحتاج تطوير في ربطها بالاستراتيجية المؤسسية',
      ],
      ai_summary: `عبدالعزيز الدوسري خبير تقني استثنائي بإمكانيات قيادية تقنية واعدة. درجة ثقة متوسطة (58%) بسبب محدودية تجربته القيادية المباشرة. يُوصى بمسار تطوير قيادي 18 شهراً يتضمن قيادة فريق تقني موسّع (10+ أعضاء) وبرامج في التواصل القيادي وإدارة أصحاب العلاقة. خطر التصنيف: قد يغادر المنظمة إذا لم يُمنح مساراً تطوير واضحاً.`,
      is_published: true,
      is_demo: true,
    },
    initiatives: [
      { title: 'نظام تحليل المخاطر الأمنية بالذكاء الاصطناعي', description: 'بناء نموذج تنبؤي لتحديد المخاطر الأمنية قبل وقوعها', impact_level: 'high', status: 'completed', start_date: '2023-03-01', end_date: '2024-01-31', achievement_percentage: 100, estimated_impact: 'خفض وقت الاستجابة للمخاطر 60%' },
      { title: 'منصة التعلم الآلي الداخلية', description: 'بناء منصة موحدة لنماذج الذكاء الاصطناعي المستخدمة مؤسسياً', impact_level: 'high', status: 'in_progress', start_date: '2024-04-01', achievement_percentage: 55, estimated_impact: 'خفض تكاليف التقنية الخارجية 35%' },
      { title: 'برنامج تدريب الذكاء الاصطناعي للموظفين', description: 'تصميم وتقديم برنامج توعوي بالذكاء الاصطناعي لـ 120 موظف', impact_level: 'medium', status: 'completed', start_date: '2023-09-01', end_date: '2023-12-31', achievement_percentage: 100, estimated_impact: '120 موظفاً يستخدمون أدوات AI يومياً' },
    ],
    kpis: [
      { title: 'عدد نماذج الذكاء الاصطناعي المُطبَّقة إنتاجياً', current_value: 3, target_value: 2, unit: 'نموذج', period: '2024', status: 'achieved' },
      { title: 'دقة نموذج تحليل المخاطر', current_value: 94, target_value: 85, unit: '%', period: '2024', status: 'achieved' },
      { title: 'درجة رضا مستخدمي الأنظمة التقنية', current_value: 3.8, target_value: 4.0, unit: '/5', period: '2024', status: 'in_progress' },
      { title: 'نسبة إنجاز المشاريع التقنية في الموعد', current_value: 71, target_value: 80, unit: '%', period: '2024', status: 'in_progress' },
      { title: 'درجة رضا أعضاء فريقه', current_value: 3.4, target_value: 4.0, unit: '/5', period: '2024', status: 'in_progress' },
    ],
    evaluators: [
      { name: 'م. علي الرشيدي', relation: 'manager', email: 'alrashidi.demo@jadeer.sa', status: 'submitted' },
      { name: 'م. سارة الغامدي', relation: 'colleague', email: 'alghamdi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. وليد البلوي', relation: 'subordinate', email: 'albalawi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. حنان المالكي', relation: 'internal_client', email: 'almalki.demo@jadeer.sa', status: 'submitted' },
    ],
    eval360Scores: { leadership: 51, strategic: 59, performance: 80, innovation: 90, team: 49, technology: 94, integrity: 77 },
    devPlan: {
      overall_status: 'approved',
      notes: 'خطة تطوير قيادي مكثفة 18 شهراً لتحويل الخبرة التقنية إلى قيادة تقنية ناضجة',
      items: [
        { title: 'قيادة فريق تقني موسّع (10+ أعضاء)', category: 'assignment', description: 'تكليف بقيادة فريق مشروع الذكاء الاصطناعي الكبير', due_date: '2025-06-30', status: 'pending', responsible: 'المدير المباشر' },
        { title: 'برنامج التواصل القيادي وإدارة أصحاب العلاقة', category: 'training', description: 'مهارات التواصل مع غير التقنيين وبناء التحالفات المؤسسية', due_date: '2025-03-31', status: 'in_progress', responsible: 'مستشار خارجي' },
        { title: 'مرشد قيادي من خارج المجال التقني', category: 'coaching', description: 'جلسات إرشاد أسبوعية مع قائد تشغيلي أو استراتيجي', due_date: '2026-03-31', status: 'pending', responsible: 'إدارة الموارد البشرية' },
        { title: 'تقديم 4 عروض لمجلس القيادة العليا', category: 'exposure', description: 'عروض ربع سنوية عن التقدم التقني أمام القيادة العليا', due_date: '2025-12-31', status: 'in_progress', responsible: 'المدير المباشر' },
        { title: 'تحسين رضا الفريق من 52% إلى 75%+', category: 'skill', description: 'تغيير أسلوب الإدارة من التقني الصارم إلى القيادة بالتمكين', due_date: '2025-09-30', status: 'pending', responsible: 'مستشار قيادي' },
      ],
    },
    govDecision: {
      decision_type: 'development_required',
      reason: 'يُقرّ مجلس الحوكمة أن عبدالعزيز الدوسري يمتلك كفاءة تقنية استثنائية مؤهِّلة للقيادة التقنية المستقبلية. غير أن درجات القيادة الإنسانية ورضا الفريق تستلزم مسار تطوير منهجي قبل التكليف القيادي. تُعتمد خطة التطوير المقترحة ويُعاد تقييم الملف خلال 18 شهراً.',
      conditions: ['رفع درجة رضا الفريق إلى 70%+ في التقييم التالي', 'قيادة مشروع تقني كبير (ميزانية 500,000+ ريال) بنجاح'],
    },
    unitId: '22222222-2222-2222-2222-222222222223',
  },

  // ══════════════════════════════════════════════════════════
  // النموذج 4: قائد إنساني — يحتاج تأهيل في المؤشرات
  // ══════════════════════════════════════════════════════════
  {
    meta: {
      authEmail: 'hind.otaibi.demo@jadeer.sa',
      authPassword: 'Jadeer@Demo2025',
      userId: 'demo4444-0000-0000-0000-000000000004',
      profileId: 'prof4444-0000-0000-0000-000000000004',
    },
    user: {
      id: 'demo4444-0000-0000-0000-000000000004',
      full_name: 'هند بنت عمر العتيبي',
      email: 'hind.otaibi.demo@jadeer.sa',
      job_title: 'أخصائية تطوير وتدريب',
      department: 'إدارة دعم الفرق والمستفيدين',
      employee_number: 'EMP-0634',
      is_active: true,
      is_demo: true,
    },
    profile: {
      id: 'prof4444-0000-0000-0000-000000000004',
      user_id: 'demo4444-0000-0000-0000-000000000004',
      years_of_experience: 8,
      qualification: 'ماجستير علم النفس التنظيمي',
      specialization: 'التطوير التنظيمي والقيادة الإنسانية',
      educational_institution: 'جامعة الملك سعود',
      graduation_year: 2017,
      internal_experience: 'طورت 14 برنامجاً تدريبياً داخلياً، وحصلت على نسبة رضا 97% من المتدربين. تُعدّ الوجه الأبرز في دعم الفرق ومعالجة الخلافات المؤسسية.',
      past_leadership_tasks: 'قائدة مجموعة دعم الموظفين الجدد، وسيطة الخلافات الداخلية المعتمدة، منسقة برامج التوازن الوظيفي.',
      completion_score: 87,
      status: 'approved',
      evaluation_track: 'individual',
      is_demo: true,
    },
    card: {
      id: 'card4444-0000-0000-0000-000000000004',
      readiness_level: 'human_leader',
      leadership_type: 'human',
      total_score: 68,
      trust_score: 74,
      axis_scores: { leadership: 71, strategic: 55, performance: 63, innovation: 61, team: 96, technology: 52, integrity: 91 },
      primary_strengths: [
        'رضا الفريق 96% — الأعلى بين جميع المرشحين — موهبة نادرة في بناء البيئة الإنسانية المحفِّزة',
        'نزاهة 91% — ثقة مؤسسية استثنائية تجعلها مرجعاً في الخلافات الحساسة',
        'قيادة عاطفية تُحوّل الضغط الوظيفي إلى طاقة إيجابية للفريق',
      ],
      development_gaps: [
        'مؤشرات الأداء وقياس النتائج 63% — تدير ببراعة لكن لا توثّق النتائج بأرقام مُقنِعة',
        'استخدام التقنية 52% — ضرورة تطوير لمواكبة متطلبات قيادة الفرق الرقمية',
        'التفكير الاستراتيجي 55% — تحتاج تطوير في ربط عمل الفريق بالأهداف المؤسسية الكبرى',
      ],
      ai_summary: `هند العتيبي نموذج القائد الإنساني الأصيل النادر. رضا الفريق 96% لا يتحقق بالصدفة — هي تُبني بيئات آمنة نفسياً تُطلق إمكانيات الفريق. درجة ثقة متوسطة مرتفعة (74%). الفجوة الرئيسية: تفتقر للغة الأرقام والمؤشرات التي يتوقعها القرار الإداري المعاصر. يُوصى بالتعيين في دور قيادة دعم الفرق فوراً مع تطوير مهارات المؤشرات والرقمنة.`,
      is_published: true,
      is_demo: true,
    },
    initiatives: [
      { title: 'برنامج الاندماج المؤسسي للموظفين الجدد', description: 'برنامج 90 يوماً لتسريع اندماج الموظفين الجدد وخفض معدل المغادرة المبكرة', impact_level: 'high', status: 'completed', start_date: '2023-01-01', end_date: '2023-12-31', achievement_percentage: 100, estimated_impact: 'خفض معدل مغادرة الموظفين الجدد من 22% إلى 7%' },
      { title: 'منظومة الدعم النفسي المهني', description: 'إطلاق خدمة الدعم النفسي الداخلية مع 3 مختصين مرخصين', impact_level: 'medium', status: 'completed', start_date: '2022-09-01', end_date: '2023-03-31', achievement_percentage: 100, estimated_impact: '240 جلسة دعم، رضا 97%' },
      { title: 'برنامج التوازن الوظيفي والإنتاجية', description: 'مبادرة مؤسسية لتحسين التوازن الوظيفي وخفض الاحتراق المهني', impact_level: 'medium', status: 'in_progress', start_date: '2024-01-01', achievement_percentage: 60, estimated_impact: 'خفض معدل الغياب المرضي 30%' },
    ],
    kpis: [
      { title: 'درجة رضا المتدربين عن البرامج', current_value: 4.85, target_value: 4.0, unit: '/5', period: '2024', status: 'achieved' },
      { title: 'معدل الاستكمال في برامج التدريب', current_value: 96, target_value: 85, unit: '%', period: '2024', status: 'achieved' },
      { title: 'معدل مغادرة الموظفين الجدد (قبل 6 أشهر)', current_value: 7, target_value: 15, unit: '%', period: '2024', status: 'achieved' },
      { title: 'عدد حالات الخلاف المحلولة في مرحلة مبكرة', current_value: 18, target_value: 10, unit: 'حالة', period: '2024', status: 'achieved' },
      { title: 'نسبة توثيق نتائج البرامج بمؤشرات قابلة للقياس', current_value: 41, target_value: 80, unit: '%', period: '2024', status: 'in_progress' },
    ],
    evaluators: [
      { name: 'أ. خديجة اليامي', relation: 'manager', email: 'alyami.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. بدر الشهري', relation: 'colleague', email: 'alshahri.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. شيماء المطيري', relation: 'subordinate', email: 'shmutairi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. محمد الخثلان', relation: 'internal_client', email: 'alkhatlan.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. رنا الحمود', relation: 'colleague', email: 'alhamoud.demo@jadeer.sa', status: 'submitted' },
    ],
    eval360Scores: { leadership: 69, strategic: 52, performance: 61, innovation: 59, team: 97, technology: 50, integrity: 92 },
    devPlan: {
      overall_status: 'approved',
      notes: 'خطة تطوير تُحول القيادة الإنسانية الاستثنائية إلى قيادة مكتملة الأبعاد',
      items: [
        { title: 'شهادة تحليل البيانات وقياس الأثر', category: 'training', description: 'برنامج احترافي في قياس نتائج التدريب بمنهجية Kirkpatrick', due_date: '2025-04-30', status: 'in_progress', responsible: 'إدارة الموارد البشرية' },
        { title: 'بناء داشبورد قياس فعالية برامج التطوير', category: 'skill', description: 'استخدام Power BI لقياس وتقديم نتائج برامجها بشكل مرئي', due_date: '2025-06-30', status: 'pending', responsible: 'إدارة التقنية' },
        { title: 'تطوير الكفاءة الرقمية الأساسية', category: 'training', description: 'برنامج مكثف في أدوات إدارة الفرق الرقمية', due_date: '2025-03-31', status: 'in_progress', responsible: 'مسؤول التدريب التقني' },
        { title: 'ربط برامج الدعم بمؤشرات مؤسسية كبرى', category: 'assignment', description: 'إعداد تقرير ربع سنوي يربط برامجها بالاستراتيجية المؤسسية', due_date: '2025-12-31', status: 'pending', responsible: 'مدير التخطيط' },
      ],
    },
    govDecision: {
      decision_type: 'conditional_approval',
      reason: 'تمتلك هند العتيبي موهبة قيادية إنسانية نادرة تحتاجها المنظمة في مناصب دعم الفرق. تعتمد اللجنة التعيين في رئاسة قسم دعم الفرق، مشروطاً بإتمام برنامج قياس الأثر خلال 6 أشهر وتقديم داشبورد مؤشرات لمجلس الإدارة.',
      conditions: ['إتمام شهادة قياس أثر التدريب Kirkpatrick', 'تقديم داشبورد قياس للمجلس خلال 6 أشهر من التعيين'],
    },
    unitId: '22222222-2222-2222-2222-222222222224',
  },

  // ══════════════════════════════════════════════════════════
  // النموذج 5: أداء مرتفع — غير مناسب للقيادة المباشرة حالياً
  // ══════════════════════════════════════════════════════════
  {
    meta: {
      authEmail: 'fahad.mutairi.demo@jadeer.sa',
      authPassword: 'Jadeer@Demo2025',
      userId: 'demo5555-0000-0000-0000-000000000005',
      profileId: 'prof5555-0000-0000-0000-000000000005',
    },
    user: {
      id: 'demo5555-0000-0000-0000-000000000005',
      full_name: 'فهد بن خالد المطيري',
      email: 'fahad.mutairi.demo@jadeer.sa',
      job_title: 'مدير برنامج الامتثال المؤسسي',
      department: 'إدارة الجودة والامتثال',
      employee_number: 'EMP-0912',
      is_active: true,
      is_demo: true,
    },
    profile: {
      id: 'prof5555-0000-0000-0000-000000000005',
      user_id: 'demo5555-0000-0000-0000-000000000005',
      years_of_experience: 11,
      qualification: 'بكالوريوس قانون وأنظمة',
      specialization: 'الامتثال المؤسسي وضمان الجودة',
      educational_institution: 'جامعة الملك عبدالعزيز',
      graduation_year: 2014,
      internal_experience: 'حقق 100% امتثال في آخر 3 تدقيقات خارجية، طوّر منظومة الحوكمة الداخلية، وأنجز 94% من مؤشراته الفردية. لكن دوران الموظفين في قسمه 28% وهو الأعلى بين جميع الأقسام.',
      past_leadership_tasks: 'مسؤول الامتثال، قائد فريق التدقيق الداخلي (6 أعضاء)، ممثل الجامعة في هيئات الاعتماد.',
      completion_score: 89,
      status: 'approved',
      evaluation_track: 'individual',
      is_demo: true,
    },
    card: {
      id: 'card5555-0000-0000-0000-000000000005',
      readiness_level: 'high_performance_low_satisfaction',
      leadership_type: 'specialist_leadership',
      total_score: 45,
      trust_score: 62,
      axis_scores: { leadership: 61, strategic: 67, performance: 97, innovation: 44, team: 31, technology: 68, integrity: 85 },
      primary_strengths: [
        'الأداء الفردي 97% — ينجز ما لا يُنجزه غيره في الامتثال والجودة',
        'النزاهة 85% — مؤتمَن تماماً على الملفات الحساسة والتدقيقات الخارجية',
        'التفكير الاستراتيجي 67% — يرى الفجوات الأنظمية بوضوح ويقترح حلولاً منهجية',
      ],
      development_gaps: [
        'رضا الفريق 31% — أزمة قيادية حادة: 28% دوران في قسمه خلال سنتين',
        'الابتكار 44% — ينفّذ الأنظمة بدقة لكن لا يُطوّر ثقافة التحسين المستمر',
        'أسلوب إداري يعتمد على الضغط والمعايير الصارمة دون مراعاة الجانب الإنساني',
      ],
      ai_summary: `فهد المطيري نموذج نادر للمُنجز الفذّ الذي يعاني أزمة قيادية جوهرية. رضا الفريق 31% مع دوران وظيفي 28% يُنذر بأزمة مؤسسية خطيرة إذا رُقِّي للمناصب القيادية الأعلى. نتائج تقييم 360 كشفت أن 4 من 6 مقيمين يصفون أسلوبه بـ"الضغط الإداري المُرهق" رغم إقرارهم بكفاءته. يُوصى بالإبقاء كخبير امتثال أول مع برنامج علاج قيادي صارم، وعدم الترقية للمناصب الإشرافية حتى يُظهر تحسناً قابلاً للقياس في رضا الفريق.`,
      is_published: true,
      is_demo: true,
    },
    initiatives: [
      { title: 'منظومة الحوكمة الداخلية المتكاملة', description: 'بناء إطار حوكمة شامل ضمن اعتماد ISO 9001', impact_level: 'high', status: 'completed', start_date: '2022-01-01', end_date: '2023-06-30', achievement_percentage: 100, estimated_impact: 'حصول الجامعة على اعتماد ISO 9001 لأول مرة' },
      { title: 'نظام تتبع الامتثال التنظيمي', description: 'منظومة رقمية لتتبع 340 متطلباً تنظيمياً في الوقت الفعلي', impact_level: 'high', status: 'completed', start_date: '2023-07-01', end_date: '2024-01-31', achievement_percentage: 100, estimated_impact: '100% امتثال في التدقيق الخارجي الأخير' },
    ],
    kpis: [
      { title: 'نسبة الامتثال في التدقيقات الخارجية', current_value: 100, target_value: 95, unit: '%', period: '2024', status: 'achieved' },
      { title: 'عدد المخالفات التنظيمية المرصودة', current_value: 0, target_value: 5, unit: 'مخالفة', period: '2024', status: 'achieved' },
      { title: 'درجة رضا الفريق عن بيئة العمل', current_value: 2.1, target_value: 3.8, unit: '/5', period: '2024', status: 'in_progress' },
      { title: 'معدل دوران الموظفين في القسم', current_value: 28, target_value: 8, unit: '%', period: '2024', status: 'in_progress' },
      { title: 'نسبة إنجاز المهام الفردية', current_value: 97, target_value: 90, unit: '%', period: '2024', status: 'achieved' },
      { title: 'عدد شكاوى الموظفين الرسمية من القسم', current_value: 7, target_value: 1, unit: 'شكوى', period: '2024', status: 'in_progress' },
    ],
    evaluators: [
      { name: 'أ. صالح العسيري', relation: 'manager', email: 'sasiri.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. جواهر القرني', relation: 'colleague', email: 'alqarni.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. محمود البشر', relation: 'subordinate', email: 'albashr.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. سلمى الفيفي', relation: 'subordinate', email: 'alfifi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. حمد الغامدي', relation: 'subordinate', email: 'hghamdi.demo@jadeer.sa', status: 'submitted' },
      { name: 'أ. رنا العمري', relation: 'internal_client', email: 'alemri.demo@jadeer.sa', status: 'submitted' },
    ],
    eval360Scores: { leadership: 58, strategic: 65, performance: 96, innovation: 42, team: 28, technology: 66, integrity: 83 },
    devPlan: {
      overall_status: 'approved',
      notes: 'خطة علاجية لمعالجة الأزمة القيادية الإنسانية مع الحفاظ على الأداء الاستثنائي',
      items: [
        { title: 'برنامج القيادة الإنسانية المكثف', category: 'coaching', description: 'برنامج تحول قيادي إلزامي مع مختص قيادي متخصص في أنماط الإدارة الضاغطة', due_date: '2025-06-30', status: 'in_progress', responsible: 'مستشار قيادي خارجي' },
        { title: 'جلسات استماع مع أعضاء الفريق', category: 'exposure', description: 'جلسات استماع فردية شهرية مع كل عضو في فريقه لفهم احتياجاتهم', due_date: '2025-12-31', status: 'in_progress', responsible: 'هند العتيبي كوسيطة' },
        { title: 'تطوير ثقافة التحسين المستمر في القسم', category: 'skill', description: 'بناء بيئة قسم تُشجع الابتكار والاقتراح لا الخوف من الخطأ', due_date: '2025-09-30', status: 'pending', responsible: 'المرشد القيادي' },
        { title: 'إعادة تقييم 360 وقياس التحسن', category: 'assessment', description: 'قياس مستقل لرضا الفريق ودوران الموظفين', due_date: '2025-12-31', status: 'pending', responsible: 'لجنة الحوكمة' },
      ],
    },
    govDecision: {
      decision_type: 'on_hold',
      reason: 'يُوقف مجلس الحوكمة النظر في أي ترقية لفهد المطيري لمدة 12 شهراً، استناداً إلى المؤشرات الموضوعية التالية: معدل دوران الموظفين 28%، درجة رضا الفريق 31%، و7 شكاوى رسمية في عام واحد. يُقدَّر أداؤه الفردي الاستثنائي، ويُوصى بالاستثمار فيه كخبير امتثال أول مع برنامج تحول قيادي إلزامي، وإعادة العرض بعد اثني عشر شهراً مع تقرير موثق من المرشد القيادي.',
      conditions: ['خفض معدل دوران الموظفين إلى أقل من 12%', 'رفع رضا الفريق إلى 55%+ في التقييم التالي', 'صفر شكاوى رسمية خلال 6 أشهر متتالية'],
    },
    unitId: '22222222-2222-2222-2222-222222222225',
  },
];

// ─────────────────────────────────────────────────────────────
// دوال المساعدة
// ─────────────────────────────────────────────────────────────

async function upsert(table: string, data: object, conflictCol = 'id') {
  const { error } = await supabase.from(table).upsert(data as any, { onConflict: conflictCol });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function createAuthUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error && !error.message.includes('already registered')) {
    throw new Error(`Auth: ${error.message}`);
  }
  return data?.user?.id;
}

// ─────────────────────────────────────────────────────────────
// السكربت الرئيسي
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 بدء إنشاء البيانات التجريبية لمنصة جدير\n');
  console.log('═'.repeat(60));

  for (const candidate of DEMO_CANDIDATES) {
    const { meta, user, profile, card, initiatives, kpis, evaluators, eval360Scores, devPlan, govDecision, unitId } = candidate;
    console.log(`\n📋 المرشح: ${user.full_name}`);

    try {
      // 1. إنشاء مستخدم Auth
      process.stdout.write('  ↳ إنشاء حساب Auth... ');
      const authId = await createAuthUser(meta.authEmail, meta.authPassword, user.full_name);
      console.log(authId ? `✓ (${authId})` : '✓ (موجود)');

      // 2. إدخال بيانات المستخدم
      process.stdout.write('  ↳ بيانات المستخدم... ');
      await upsert('users', { ...user, ...(authId ? { auth_user_id: authId } : {}) });
      console.log('✓');

      // 3. دور المرشح
      process.stdout.write('  ↳ دور المستخدم... ');
      const { data: roleRow } = await supabase.from('roles').select('id').eq('code', 'candidate').single();
      if (roleRow) await upsert('user_roles', { user_id: meta.userId, role_id: roleRow.id, is_demo: true }, 'user_id,role_id');
      console.log('✓');

      // 4. ملف المرشح
      process.stdout.write('  ↳ ملف المرشح... ');
      await upsert('candidate_profiles', profile);
      console.log('✓');

      // 5. المبادرات
      process.stdout.write(`  ↳ المبادرات (${initiatives.length})... `);
      for (let i = 0; i < initiatives.length; i++) {
        await upsert('initiatives', {
          id: `${meta.profileId}-init-${i + 1}`,
          candidate_id: meta.profileId,
          ...initiatives[i],
          is_demo: true,
        });
      }
      console.log('✓');

      // 6. مؤشرات الأداء
      process.stdout.write(`  ↳ مؤشرات الأداء (${kpis.length})... `);
      for (let i = 0; i < kpis.length; i++) {
        await upsert('kpis', {
          id: `${meta.profileId}-kpi-${i + 1}`,
          candidate_id: meta.profileId,
          ...kpis[i],
          is_demo: true,
        });
      }
      console.log('✓');

      // 7. المقيّمون
      process.stdout.write(`  ↳ المقيّمون (${evaluators.length})... `);
      for (let i = 0; i < evaluators.length; i++) {
        await upsert('evaluator_nominees', {
          id: `${meta.profileId}-nom-${i + 1}`,
          candidate_profile_id: meta.profileId,
          name: evaluators[i].name,
          email: evaluators[i].email,
          relation_type: evaluators[i].relation,
          status: 'approved',
          is_demo: true,
        });
      }
      console.log('✓');

      // 8. تقييم 360
      process.stdout.write('  ↳ تقييم 360... ');
      for (let i = 0; i < evaluators.length; i++) {
        // إضافة تباين واقعي في درجات المقيّمين
        const variance = (Math.random() - 0.5) * 10;
        const scoresWithVariance = Object.fromEntries(
          Object.entries(eval360Scores).map(([k, v]) => [k, { score: Math.max(1, Math.min(5, Math.round(((v as number) + variance) / 20))) }])
        );
        await upsert('evaluations_360', {
          id: `${meta.profileId}-eval-${i + 1}`,
          candidate_profile_id: meta.profileId,
          approved_evaluator_id: `${meta.profileId}-nom-${i + 1}`,
          status: 'completed',
          scores_json: scoresWithVariance,
          overall_score: Object.values(eval360Scores).reduce((a: number, b) => a + (b as number), 0) / 7,
          trust_score: card.trust_score,
          is_demo: true,
        }, 'id');
      }
      console.log('✓');

      // 9. البطاقة القيادية
      process.stdout.write('  ↳ البطاقة القيادية... ');
      await upsert('leadership_cards', { ...card, candidate_profile_id: meta.profileId });
      console.log('✓');

      // 10. قرار الحوكمة
      process.stdout.write('  ↳ قرار الحوكمة... ');
      await upsert('governance_decisions', {
        id: `${meta.profileId}-gov-decision`,
        candidate_profile_id: meta.profileId,
        ...govDecision,
        decided_at: new Date().toISOString(),
        conditions_json: govDecision.conditions,
        is_demo: true,
      });
      console.log('✓');

      // 11. خطة التطوير
      process.stdout.write('  ↳ خطة التطوير... ');
      await upsert('development_plans', {
        id: `${meta.profileId}-devplan`,
        candidate_profile_id: meta.profileId,
        overall_status: devPlan.overall_status,
        notes: devPlan.notes,
        is_demo: true,
      });
      for (let i = 0; i < devPlan.items.length; i++) {
        await upsert('development_plan_items', {
          id: `${meta.profileId}-devitem-${i + 1}`,
          development_plan_id: `${meta.profileId}-devplan`,
          ...devPlan.items[i],
          is_demo: true,
        });
      }
      console.log('✓');

      // 12. درجة الملاءمة التنظيمية
      process.stdout.write('  ↳ الملاءمة التنظيمية... ');
      await upsert('position_fit_scores', {
        candidate_profile_id: meta.profileId,
        organization_unit_id: unitId,
        fit_score: Math.min(100, card.total_score + 5),
        fit_level: card.total_score >= 85 ? 'high' : card.total_score >= 70 ? 'good' : card.total_score >= 55 ? 'conditional' : 'low',
        confidence_score: card.trust_score,
        fit_reason: card.primary_strengths[0],
        strengths_match_json: card.primary_strengths,
        gaps_json: card.development_gaps,
        ai_summary: card.ai_summary,
        recommended_action: devPlan.notes,
        is_demo: true,
      }, 'candidate_profile_id,organization_unit_id');
      console.log('✓');

      console.log(`  ✅ ${user.full_name} — اكتمل`);

    } catch (err) {
      console.log(`\n  ❌ خطأ: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // تحديث علامة البيانات التجريبية
  await supabase.from('demo_data_flags').upsert({
    is_demo_active: true,
    last_seeded_at: new Date().toISOString(),
  });

  console.log('\n' + '═'.repeat(60));
  console.log('✅ اكتمل إنشاء البيانات التجريبية');
  console.log('\nبيانات الدخول التجريبية:');
  DEMO_CANDIDATES.forEach(c => {
    console.log(`  ${c.user.full_name.padEnd(30)} | ${c.meta.authEmail} | Jadeer@Demo2025`);
  });
  console.log('\n⚠️  تذكر: احذف هذه البيانات من /admin/demo-data قبل الإطلاق الرسمي\n');
}

main().catch(console.error);
