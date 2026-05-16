import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';

// ─── جميع UUIDs صالحة (hex: 0-9, a-f فقط) ───────────────────────────────

// مستخدمون
const UIDS = [
  'eeee0001-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0002-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0003-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0004-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0005-cafe-beef-0000-aaaaaaaaaaaa',
] as const;

// ملفات المرشحين
const PIDS = [
  'ffff0001-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0002-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0003-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0004-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0005-cafe-beef-0000-aaaaaaaaaaaa',
] as const;

// IDs مشتقة (كلها hex صالحة)
const cardId   = (i: number) => `ca4d000${i}-cafe-beef-0000-aaaaaaaaaaaa`;
const plan1Id  = (i: number) => `de00000${i}-cafe-beef-0000-aaaaaaaaaaaa`;
const ini1Id   = (i: number) => `ab010000-cafe-beef-000${i}-aaaaaaaaaaaa`;
const ini2Id   = (i: number) => `ab020000-cafe-beef-000${i}-aaaaaaaaaaaa`;
const kpi1Id   = (i: number) => `b0010000-cafe-beef-000${i}-aaaaaaaaaaaa`;
const kpi2Id   = (i: number) => `b0020000-cafe-beef-000${i}-aaaaaaaaaaaa`;

const PROFILES = [
  {
    idx: 0,
    name: 'سعد بن محمد الحارثي',
    email: 'saad.harthy@demo.jadeer.sa',
    jobTitle: 'مدير التخطيط الاستراتيجي',
    dept: 'إدارة المشاريع الاستراتيجية',
    exp: 12,
    // under_governance_review → يظهر في لوحة الحوكمة ولوحة الرئيس
    status: 'under_governance_review' as const,
    readiness: 'ready_within_year',
    leadType: 'strategic',
    total: 78, trust: 72,
    axes: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['تفكير استراتيجي متميز', 'رؤية الصورة الكبيرة', 'خبرة تحليل البيانات المعقدة'],
    gaps: ['يحتاج تعزيز إدارة الفريق', 'تطوير التواصل القيادي اليومي'],
    aiRec: 'مرشح قوي للقيادة الاستراتيجية خلال 12 شهراً — يُوصى ببرنامج القيادة التحويلية وتكليف تجريبي',
    unitId: '22222222-2222-2222-2222-222222222222',
    ini1Name: 'الخطة الاستراتيجية 2025-2030',       ini1Impact: 'رسم مسار مؤسسي لـ 850 موظف على 5 سنوات',
    ini2Name: 'شراكات الجامعات الأمنية الدولية',      ini2Impact: '8 اتفاقيات تعاون دولية جديدة',
    kpi1Name: 'نسبة إنجاز مبادرات الخطة', kpi1T: '85%',  kpi1A: '87%',
    kpi2Name: 'عدد الشراكات الدولية',     kpi2T: '10',   kpi2A: '12',
  },
  {
    idx: 1,
    name: 'نورة بنت عبدالله القحطاني',
    email: 'noura.qahtani@demo.jadeer.sa',
    jobTitle: 'رئيسة قسم العمليات والجودة',
    dept: 'إدارة العمليات',
    exp: 9,
    status: 'approved' as const,
    readiness: 'ready_now',
    leadType: 'operational',
    total: 91, trust: 89,
    axes: { leadership: 88, strategic: 74, performance: 96, innovation: 81, team: 91, technology: 84, integrity: 93 },
    strengths: ['أداء تشغيلي استثنائي (96%)', 'رضا الفريق مرتفع جداً (91%)', 'مؤشرات أداء موثقة'],
    gaps: ['التخطيط الاستراتيجي بعيد المدى', 'تعزيز الحضور في الاجتماعات العليا'],
    aiRec: 'تكليف قيادي فوري في إدارة العمليات — أداؤها يتجاوز متطلبات المنصب',
    unitId: '22222222-2222-2222-2222-222222222221',
    ini1Name: 'مشروع التحسين التشغيلي الشامل',         ini1Impact: 'خفض 31% في زمن الإنجاز — توفير 2400 ساعة سنوياً',
    ini2Name: 'منظومة متابعة الأداء اليومي',           ini2Impact: 'رفع نسبة الإنجاز في الوقت من 71% إلى 94%',
    kpi1Name: 'نسبة إنجاز المهام في الوقت المحدد', kpi1T: '90%',  kpi1A: '94%',
    kpi2Name: 'رضا المستفيدين الداخليين',          kpi2T: '4.0/5', kpi2A: '4.6/5',
  },
  {
    idx: 2,
    name: 'عبدالعزيز بن سالم الدوسري',
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    jobTitle: 'مهندس أنظمة ذكاء اصطناعي أول',
    dept: 'إدارة التقنية والذكاء الاصطناعي',
    exp: 7,
    status: 'under_governance_review' as const,
    readiness: 'promising',
    leadType: 'technical',
    total: 62, trust: 58,
    axes: { leadership: 54, strategic: 61, performance: 82, innovation: 91, team: 52, technology: 95, integrity: 79 },
    strengths: ['خبرة تقنية نادرة في الذكاء الاصطناعي', 'ابتكار وحل مشكلات (91%)'],
    gaps: ['القيادة الإنسانية (54%)', 'رضا الفريق (52%)', 'التواصل مع غير التقنيين'],
    aiRec: 'واعد جداً للقيادة التقنية خلال 18 شهراً — مسار تطوير قيادي مكثف',
    unitId: '22222222-2222-2222-2222-222222222223',
    ini1Name: 'نظام تحليل المخاطر الأمنية بالذكاء الاصطناعي', ini1Impact: 'خفض وقت الاستجابة للمخاطر 60%',
    ini2Name: 'برنامج تدريب الذكاء الاصطناعي للموظفين',       ini2Impact: '120 موظف يستخدمون أدوات AI يومياً',
    kpi1Name: 'نماذج الذكاء الاصطناعي المطبَّقة', kpi1T: '2 نماذج', kpi1A: '3 نماذج',
    kpi2Name: 'دقة نموذج تحليل المخاطر',         kpi2T: '85%',      kpi2A: '94%',
  },
  {
    idx: 3,
    name: 'هند بنت عمر العتيبي',
    email: 'hind.otaibi@demo.jadeer.sa',
    jobTitle: 'أخصائية تطوير وتدريب',
    dept: 'إدارة دعم الفرق والمستفيدين',
    exp: 8,
    status: 'approved' as const,
    readiness: 'human_leader',
    leadType: 'human',
    total: 68, trust: 74,
    axes: { leadership: 71, strategic: 55, performance: 63, innovation: 61, team: 96, technology: 52, integrity: 91 },
    strengths: ['رضا الفريق استثنائي (96%) — موهبة نادرة', 'نزاهة مؤسسية (91%)'],
    gaps: ['مؤشرات الأداء الكمية', 'استخدام التقنية (52%)', 'التفكير الاستراتيجي'],
    aiRec: 'تعيين في رئاسة قسم دعم الفرق — يُشترط إتمام برنامج قياس الأثر خلال 6 أشهر',
    unitId: '22222222-2222-2222-2222-222222222224',
    ini1Name: 'برنامج الاندماج المؤسسي للموظفين الجدد', ini1Impact: 'خفض مغادرة الجدد من 22% إلى 7%',
    ini2Name: 'منظومة الدعم النفسي المهني',             ini2Impact: '240 جلسة دعم، رضا 97%',
    kpi1Name: 'رضا المتدربين عن البرامج',          kpi1T: '4.0/5', kpi1A: '4.85/5',
    kpi2Name: 'معدل مغادرة الموظفين الجدد قبل 6 أشهر', kpi2T: '15%', kpi2A: '7%',
  },
  {
    idx: 4,
    name: 'فهد بن خالد المطيري',
    email: 'fahad.mutairi@demo.jadeer.sa',
    jobTitle: 'مدير برنامج الامتثال المؤسسي',
    dept: 'إدارة الجودة والامتثال',
    exp: 11,
    status: 'approved' as const,
    readiness: 'high_performance_low_satisfaction',
    leadType: 'specialist_leadership',
    total: 45, trust: 62,
    axes: { leadership: 61, strategic: 67, performance: 97, innovation: 44, team: 31, technology: 68, integrity: 85 },
    strengths: ['الأداء الفردي 97% — استثنائي', 'امتثال 100% في التدقيقات الخارجية'],
    gaps: ['رضا الفريق 31% — أزمة قيادية حادة', 'دوران الموظفين 28%'],
    aiRec: 'لا يُنصح بالتكليف القيادي — برنامج تحول قيادي إنساني مكثف، إعادة تقييم بعد 12 شهراً',
    unitId: '22222222-2222-2222-2222-222222222225',
    ini1Name: 'منظومة الحوكمة الداخلية المتكاملة',     ini1Impact: 'اعتماد ISO 9001 لأول مرة',
    ini2Name: 'نظام تتبع الامتثال التنظيمي',           ini2Impact: '100% امتثال في التدقيق الخارجي الأخير',
    kpi1Name: 'نسبة الامتثال في التدقيقات',      kpi1T: '95%',   kpi1A: '100%',
    kpi2Name: 'رضا الفريق عن بيئة العمل',        kpi2T: '3.8/5', kpi2A: '2.1/5 ⚠️',
  },
];

async function del(svc: any, table: string, col: string, val: string) {
  await svc.from(table).delete().eq(col, val);
}

async function ups(svc: any, table: string, data: object, conflict: string): Promise<string | null> {
  const { error } = await svc.from(table).upsert(data as any, { onConflict: conflict });
  return error ? `[${table}] ${error.message.slice(0, 80)}` : null;
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const svc = createServiceClient();
  const results: string[] = [];
  let ok = 0;

  for (const p of PROFILES) {
    const errs: string[] = [];

    // ─── حل تعارض IDs: ابحث عن المستخدم الفعلي بالإيميل ────────────────
    const { data: existingUser } = await svc.from('users').select('id, auth_user_id').eq('email', p.email).maybeSingle();
    const uid = existingUser?.id || UIDS[p.idx]; // استخدم الـ ID الفعلي إن وُجد

    // ابحث عن الملف الفعلي بـ user_id
    const { data: existingProfile } = await svc.from('candidate_profiles').select('id').eq('user_id', uid).maybeSingle();
    const pid = PIDS[p.idx]; // نريد ID ثابت للملف حتى تعمل IDs الأبناء
    const cid = cardId(p.idx + 1);
    const did = plan1Id(p.idx + 1);

    // ─── حذف كل البيانات المرتبطة بالملف الفعلي أو الثابت ───────────────
    const pidsToClean = existingProfile ? [existingProfile.id, pid] : [pid];
    for (const pidToClean of [...new Set(pidsToClean)]) {
      await del(svc, 'evaluations_360',     'candidate_profile_id', pidToClean);
      await del(svc, 'evaluation_links',    'candidate_profile_id', pidToClean);
      await del(svc, 'approved_evaluators', 'candidate_profile_id', pidToClean);
      await del(svc, 'evaluator_nominees',  'candidate_profile_id', pidToClean);
      await del(svc, 'assessment_results',  'candidate_profile_id', pidToClean);
      await del(svc, 'position_fit_scores', 'candidate_profile_id', pidToClean);
      await del(svc, 'leadership_cards',    'candidate_profile_id', pidToClean);
      await del(svc, 'kpis',               'candidate_profile_id', pidToClean);
      await del(svc, 'initiatives',         'candidate_profile_id', pidToClean);
    }
    await del(svc, 'development_plan_items', 'development_plan_id', did);
    await del(svc, 'development_plans', 'candidate_profile_id', pid);
    if (existingProfile?.id && existingProfile.id !== pid) {
      await svc.from('development_plans').delete().eq('candidate_profile_id', existingProfile.id);
    }
    // احذف جميع ملفات المرشح لهذا المستخدم ثم أعد بناءها بـ ID ثابت
    await svc.from('candidate_profiles').delete().eq('user_id', uid);
    // احذف المستخدم القديم إذا كان بـ ID مختلف عن الثابت
    if (existingUser && existingUser.id !== UIDS[p.idx]) {
      await del(svc, 'users', 'id', existingUser.id);
    } else {
      await del(svc, 'users', 'id', UIDS[p.idx]);
    }

    // ─── إنشاء المستخدم بـ ID ثابت مع ربط auth_user_id ──────────────────
    // ابحث عن الحساب الأصلي في Supabase Auth بالإيميل
    const { data: authList } = await svc.auth.admin.listUsers();
    const authUser = authList?.users?.find((u: any) => u.email === p.email);
    const authUserId = authUser?.id || null;

    const e1 = await ups(svc, 'users', {
      id: UIDS[p.idx],
      auth_user_id: authUserId,
      full_name: p.name, email: p.email,
      job_title: p.jobTitle, department: p.dept,
      is_active: true, is_demo: true,
    }, 'id');
    if (e1) errs.push(e1);

    const e2 = await ups(svc, 'candidate_profiles', {
      id: pid, user_id: UIDS[p.idx],
      years_of_experience: p.exp, qualification: 'ماجستير',
      specialization: p.dept, status: p.status,
      completion_score: 88, is_demo: true,
    }, 'id');
    if (e2) errs.push(e2);

    // مبادرات — اسم العمود الصحيح: candidate_profile_id + name
    const e3a = await ups(svc, 'initiatives', {
      id: ini1Id(p.idx + 1), candidate_profile_id: pid,
      name: p.ini1Name, initiative_type: 'institutional_improvement',
      achieved_impact: p.ini1Impact, is_demo: true,
    }, 'id');
    if (e3a) errs.push(e3a);

    const e3b = await ups(svc, 'initiatives', {
      id: ini2Id(p.idx + 1), candidate_profile_id: pid,
      name: p.ini2Name, initiative_type: 'process_improvement',
      achieved_impact: p.ini2Impact, is_demo: true,
    }, 'id');
    if (e3b) errs.push(e3b);

    // KPIs — target_value/actual_value هما TEXT في الـ schema
    const e4a = await ups(svc, 'kpis', {
      id: kpi1Id(p.idx + 1), candidate_profile_id: pid,
      name: p.kpi1Name, kpi_type: 'efficiency',
      target_value: p.kpi1T, actual_value: p.kpi1A,
      is_officially_approved: true, is_demo: true,
    }, 'id');
    if (e4a) errs.push(e4a);

    const e4b = await ups(svc, 'kpis', {
      id: kpi2Id(p.idx + 1), candidate_profile_id: pid,
      name: p.kpi2Name, kpi_type: 'quality',
      target_value: p.kpi2T, actual_value: p.kpi2A,
      is_officially_approved: true, is_demo: true,
    }, 'id');
    if (e4b) errs.push(e4b);

    // البطاقة القيادية — أسماء الأعمدة الصحيحة من السكيما الفعلية
    const isPublished = p.status === 'approved';
    const e5 = await ups(svc, 'leadership_cards', {
      id: cid, candidate_profile_id: pid,
      // الأعمدة الأصلية
      readiness_score:  p.total,
      confidence_score: p.trust,
      // الأعمدة التي أضفناها
      total_score:      p.total,
      trust_score:      p.trust,
      readiness_level:  p.readiness,
      leadership_type:  p.leadType,
      // JSONB — أسماء الأعمدة الفعلية في السكيما
      axis_scores_json: p.axes,
      strengths_json:   p.strengths,
      gaps_json:        p.gaps,
      ai_summary:       p.aiRec,
      is_published: isPublished, status: 'approved', is_demo: true,
    }, 'candidate_profile_id');
    if (e5) errs.push(e5);

    // خطة التطوير — لا عمود notes، نستخدم ai_recommendations_json
    const e6 = await ups(svc, 'development_plans', {
      id: did, candidate_profile_id: pid,
      readiness_level: p.readiness, leadership_type: p.leadType,
      overall_status: 'approved',
      ai_recommendations_json: { summary: p.aiRec },
      is_demo: true,
    }, 'id');
    if (e6) errs.push(e6);

    // نتائج الاختبارات التجريبية (4 اختبارات لكل مرشح)
    const assessmentData = [
      { code: 'leadership_influence', score: Math.min(95, p.total + 5), pattern: 'تحليلي متوازن' },
      { code: 'strategic_thinking', score: Math.min(95, p.axes.strategic + 3), pattern: 'استراتيجي بعيد المدى' },
      { code: 'decision_making', score: Math.min(95, (p.axes.leadership + p.axes.performance) / 2), pattern: 'موجّه نحو الإنجاز' },
      { code: 'emotional_intelligence', score: Math.min(95, p.axes.team + 2), pattern: 'إنساني تشاركي' },
    ];
    const { data: assessmentRows } = await svc.from('assessments').select('id, code').in('code', assessmentData.map(a => a.code));
    const assessmentMap = Object.fromEntries((assessmentRows || []).map(a => [a.code, a.id]));
    for (let ai = 0; ai < assessmentData.length; ai++) {
      const ad = assessmentData[ai];
      const assessId = assessmentMap[ad.code];
      if (!assessId) continue;
      const arId = `a0${p.idx + 1}00${ai + 1}0-cafe-beef-0000-aaaaaaaaaaaa`;
      await svc.from('assessment_results').delete().eq('id', arId);
      await ups(svc, 'assessment_results', {
        id: arId, candidate_profile_id: pid, assessment_id: assessId,
        status: 'completed', score: ad.score,
        thinking_pattern: ad.pattern, leadership_pattern: 'strategic',
        completed_at: new Date().toISOString(), is_demo: true,
      }, 'id');
    }

    // الملاءمة التنظيمية
    const fitLevel = p.total >= 85 ? 'high' : p.total >= 70 ? 'good' : p.total >= 55 ? 'conditional' : 'low';
    const e7 = await ups(svc, 'position_fit_scores', {
      candidate_profile_id: pid, organization_unit_id: p.unitId,
      fit_score: Math.min(100, p.total + 5), fit_level: fitLevel,
      confidence_score: p.trust, fit_reason: p.strengths[0],
      strengths_match_json: p.strengths, gaps_json: p.gaps,
      ai_summary: p.aiRec, recommended_action: p.aiRec, is_demo: true,
    }, 'candidate_profile_id,organization_unit_id');
    if (e7) errs.push(e7);

    // ─── مقيمون معتمدون + روابط تقييم + تقييمات 360 ──────────────────────
    const EVAL_NAMES = [
      'خالد بن أحمد السالم', 'محمد بن عمر الزهراني', 'سارة بنت علي القحطاني',
      'نواف بن سعد الحربي', 'ريم بنت فيصل الشهري', 'فيصل بن ناصر الدوسري',
      'أميرة بنت خالد العتيبي',
    ];
    const RELATIONSHIPS = [
      'direct_manager', 'peer', 'peer', 'subordinate',
      'subordinate', 'stakeholder', 'project_partner',
    ];
    const evalCount = 7; // نصنع 7 مقيمين لكل مرشح
    const isApproved = p.status === 'approved';

    for (let ev = 0; ev < evalCount; ev++) {
      const ci = String(p.idx).padStart(2, '0');
      const ei = String(ev + 1).padStart(2, '0');
      const evId  = `bb00${ci}${ei}00-cafe-beef-0000-aaaaaaaaaaaa`;
      const lnkId = `cc00${ci}${ei}00-cafe-beef-0000-aaaaaaaaaaaa`;
      const e36Id = `dd00${ci}${ei}00-cafe-beef-0000-aaaaaaaaaaaa`;

      // المقيم المعتمد
      const eApproved = await ups(svc, 'approved_evaluators', {
        id: evId, candidate_profile_id: pid,
        full_name: EVAL_NAMES[ev],
        email: `eval${p.idx + 1}${ev + 1}@demo.jadeer.sa`,
        job_title: ['مدير إدارة', 'محلل أول', 'مشرف', 'أخصائي', 'مدير قسم', 'رئيس وحدة', 'مستشار'][ev],
        department: p.dept,
        relationship_type: RELATIONSHIPS[ev],
        approved_by_committee: true,
        committee_selected: ev >= 4, // 3 من اختيار اللجنة = 42% ← نستوفي 60% تقريباً
        can_verify_initiatives: ev < 4,
        can_verify_kpis: ev < 5,
        status: 'approved',
        is_demo: true,
      }, 'id');
      if (eApproved) errs.push(eApproved);

      // رابط التقييم (token ثابت لكل تشغيل)
      const token = `seed-${p.idx + 1}-${ev + 1}-demo-2026`;
      // حذف أي رابط قديم بنفس التوكن قبل الإدراج
      await svc.from('evaluation_links').delete().eq('token', token);
      const eLnk = await ups(svc, 'evaluation_links', {
        id: lnkId,
        candidate_profile_id: pid,
        approved_evaluator_id: evId,
        token,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: isApproved ? 'submitted' : (ev < 3 ? 'opened' : 'ready'),
        submitted_at: isApproved ? new Date().toISOString() : null,
        is_demo: true,
      }, 'id');
      if (eLnk) errs.push(eLnk);

      // تقييم 360 — فقط للمرشحين المعتمدين
      if (isApproved) {
        const drift = (ev % 3 === 0 ? 3 : ev % 3 === 1 ? -2 : 1);
        const e360 = await ups(svc, 'evaluations_360', {
          id: e36Id,
          candidate_profile_id: pid,
          approved_evaluator_id: evId,
          evaluation_link_id: lnkId,
          relationship_type: RELATIONSHIPS[ev],
          overall_score: Math.min(98, Math.max(40, Math.round(p.total + drift))),
          trust_score: Math.min(98, Math.max(40, Math.round(p.trust + drift))),
          scores_json: {
            leadership:  Math.min(98, p.axes.leadership  + drift),
            strategic:   Math.min(98, p.axes.strategic   + drift),
            performance: Math.min(98, p.axes.performance + drift),
            innovation:  Math.min(98, p.axes.innovation  + drift),
            team:        Math.min(98, p.axes.team        + drift),
          },
          comments_summary: `يؤكد ${p.strengths[0] || 'الأداء المتميز'} في بيئة العمل اليومية`,
          submitted_at: new Date().toISOString(),
          is_demo: true,
        }, 'id');
        if (e360) errs.push(e360);
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    if (errs.length === 0) {
      results.push(`✅ ${p.name} (${p.readiness})`);
      ok++;
    } else {
      results.push(`⚠️ ${p.name}: ${errs.slice(0, 2).join(' | ')}`);
    }
  }

  await svc.from('demo_data_flags').upsert({ is_demo_active: true, last_seeded_at: new Date().toISOString() });

  try {
    await svc.from('audit_logs').insert({
      user_id: user.id,
      user_role: user.primaryRole,
      operation_type: 'demo_data_seeded',
      description: `تهيئة البيانات التجريبية: ${ok}/${PROFILES.length} مرشحين`,
      sensitivity: 'normal',
    });
  } catch {}

  return NextResponse.json({
    ok: ok > 0,
    results,
    summary: `${ok}/${PROFILES.length} مرشحين تم إنشاؤهم بنجاح`,
  });
}
