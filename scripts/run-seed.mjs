import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('C:/nif/jadeer/.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const sk  = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const svc = createClient(url, sk, { auth: { autoRefreshToken: false, persistSession: false } });

const UIDS = [
  'eeee0001-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0002-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0003-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0004-cafe-beef-0000-aaaaaaaaaaaa',
  'eeee0005-cafe-beef-0000-aaaaaaaaaaaa',
];
const PIDS = [
  'ffff0001-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0002-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0003-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0004-cafe-beef-0000-aaaaaaaaaaaa',
  'ffff0005-cafe-beef-0000-aaaaaaaaaaaa',
];

const PROFILES = [
  { idx: 0, readiness: 'ready_within_year', leadType: 'strategic',                 status: 'under_governance_review',
    name: 'سعد بن محمد الحارثي',   total: 78, trust: 72,
    axes: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['تفكير استراتيجي متميز', 'رؤية الصورة الكبيرة'],
    gaps: ['يحتاج تعزيز إدارة الفريق'],
    ini1: { name: 'الخطة الاستراتيجية 2025-2030',  impact: 'رسم مسار مؤسسي لـ 850 موظف على 5 سنوات' },
    ini2: { name: 'شراكات الجامعات الدولية',         impact: '8 اتفاقيات تعاون دولية' },
    kpi1: { name: 'إنجاز مبادرات الخطة', t: '85%',  a: '87%'  },
    kpi2: { name: 'عدد الشراكات',        t: '10',   a: '12'   },
    unitId: '22222222-2222-2222-2222-222222222222',
    aiRec: 'مرشح قوي للقيادة الاستراتيجية — يوصى ببرنامج القيادة التحويلية وتكليف تجريبي',
  },
  { idx: 1, readiness: 'ready_now', leadType: 'operational', status: 'approved',
    name: 'نورة بنت عبدالله القحطاني', total: 91, trust: 89,
    axes: { leadership: 88, strategic: 74, performance: 96, innovation: 81, team: 91, technology: 84, integrity: 93 },
    strengths: ['أداء تشغيلي استثنائي 96%', 'رضا الفريق مرتفع 91%'],
    gaps: ['التخطيط الاستراتيجي بعيد المدى'],
    ini1: { name: 'مشروع التحسين التشغيلي الشامل',  impact: 'خفض 31% في زمن الإنجاز — توفير 2400 ساعة' },
    ini2: { name: 'منظومة متابعة الأداء اليومي',     impact: 'رفع الإنجاز من 71% إلى 94%' },
    kpi1: { name: 'إنجاز المهام في الوقت', t: '90%', a: '94%'    },
    kpi2: { name: 'رضا المستفيدين',        t: '4.0/5', a: '4.6/5' },
    unitId: '22222222-2222-2222-2222-222222222221',
    aiRec: 'تكليف قيادي فوري موصى به — أداؤها يتجاوز متطلبات المنصب',
  },
  { idx: 2, readiness: 'promising', leadType: 'technical', status: 'under_governance_review',
    name: 'عبدالعزيز بن سالم الدوسري', total: 62, trust: 58,
    axes: { leadership: 54, strategic: 61, performance: 82, innovation: 91, team: 52, technology: 95, integrity: 79 },
    strengths: ['خبرة تقنية نادرة في الذكاء الاصطناعي', 'ابتكار 91%'],
    gaps: ['القيادة الإنسانية 54%', 'رضا الفريق 52%'],
    ini1: { name: 'نظام تحليل المخاطر بالذكاء الاصطناعي', impact: 'خفض وقت الاستجابة 60%' },
    ini2: { name: 'برنامج تدريب الذكاء الاصطناعي',        impact: '120 موظف يستخدمون أدوات AI يومياً' },
    kpi1: { name: 'نماذج AI المطبَّقة', t: '2', a: '3'    },
    kpi2: { name: 'دقة تحليل المخاطر', t: '85%', a: '94%' },
    unitId: '22222222-2222-2222-2222-222222222223',
    aiRec: 'واعد جداً للقيادة التقنية — مسار تطوير قيادي مكثف 18 شهراً',
  },
  { idx: 3, readiness: 'human_leader', leadType: 'human', status: 'approved',
    name: 'هند بنت عمر العتيبي', total: 68, trust: 74,
    axes: { leadership: 71, strategic: 55, performance: 63, innovation: 61, team: 96, technology: 52, integrity: 91 },
    strengths: ['رضا الفريق استثنائي 96%', 'نزاهة مؤسسية 91%'],
    gaps: ['مؤشرات الأداء الكمية', 'استخدام التقنية 52%'],
    ini1: { name: 'برنامج الاندماج المؤسسي للجدد', impact: 'خفض مغادرة الجدد من 22% إلى 7%' },
    ini2: { name: 'منظومة الدعم النفسي المهني',   impact: '240 جلسة دعم، رضا 97%' },
    kpi1: { name: 'رضا المتدربين', t: '4.0/5', a: '4.85/5' },
    kpi2: { name: 'معدل مغادرة الجدد', t: '15%', a: '7%'   },
    unitId: '22222222-2222-2222-2222-222222222224',
    aiRec: 'تعيين رئاسة قسم دعم الفرق — يُشترط إتمام برنامج قياس الأثر 6 أشهر',
  },
  { idx: 4, readiness: 'high_performance_low_satisfaction', leadType: 'specialist_leadership', status: 'approved',
    name: 'فهد بن خالد المطيري', total: 45, trust: 62,
    axes: { leadership: 61, strategic: 67, performance: 97, innovation: 44, team: 31, technology: 68, integrity: 85 },
    strengths: ['أداء فردي 97% — استثنائي', 'امتثال 100% في التدقيقات'],
    gaps: ['رضا الفريق 31% — أزمة قيادية حادة'],
    ini1: { name: 'منظومة الحوكمة الداخلية المتكاملة', impact: 'اعتماد ISO 9001 لأول مرة' },
    ini2: { name: 'نظام تتبع الامتثال التنظيمي',       impact: '100% امتثال في التدقيق الأخير' },
    kpi1: { name: 'الامتثال في التدقيقات', t: '95%',   a: '100%'  },
    kpi2: { name: 'رضا الفريق',            t: '3.8/5', a: '2.1/5' },
    unitId: '22222222-2222-2222-2222-222222222225',
    aiRec: 'لا يُنصح بالتكليف القيادي المباشر — برنامج تحول قيادي إنساني مكثف',
  },
];

const cardId = i => `ca4d000${i}-cafe-beef-0000-aaaaaaaaaaaa`;
const devId  = i => `de00000${i}-cafe-beef-0000-aaaaaaaaaaaa`;
const ini1Id = i => `ab010000-cafe-beef-000${i}-aaaaaaaaaaaa`;
const ini2Id = i => `ab020000-cafe-beef-000${i}-aaaaaaaaaaaa`;
const kpi1Id = i => `b0010000-cafe-beef-000${i}-aaaaaaaaaaaa`;
const kpi2Id = i => `b0020000-cafe-beef-000${i}-aaaaaaaaaaaa`;

const EVAL_NAMES = [
  'خالد بن أحمد السالم', 'محمد بن عمر الزهراني', 'سارة بنت علي القحطاني',
  'نواف بن سعد الحربي', 'ريم بنت فيصل الشهري', 'فيصل بن ناصر الدوسري',
  'أميرة بنت خالد العتيبي',
];
const RELS = ['direct_manager', 'peer', 'peer', 'subordinate', 'subordinate', 'stakeholder', 'project_partner'];

async function ups(table, data, conflict) {
  const { error } = await svc.from(table).upsert(data, { onConflict: conflict });
  return error ? `[${table}] ${error.message.slice(0, 80)}` : null;
}
async function del(table, col, val) {
  await svc.from(table).delete().eq(col, val);
}

async function main() {
  let totalOk = 0;
  const { data: authList } = await svc.auth.admin.listUsers();

  for (const p of PROFILES) {
    const errs = [];
    const uid = UIDS[p.idx];
    const pid = PIDS[p.idx];
    const cid = cardId(p.idx + 1);
    const did = devId(p.idx + 1);

    // Clean all related data
    for (const t of ['evaluations_360', 'evaluation_links', 'approved_evaluators', 'evaluator_nominees', 'assessment_results', 'position_fit_scores', 'leadership_cards', 'kpis', 'initiatives']) {
      await del(t, 'candidate_profile_id', pid);
    }
    await del('development_plans', 'candidate_profile_id', pid);
    await del('candidate_profiles', 'id', pid);

    // Update users record (should exist from seed-staff)
    const authUser = authList?.users?.find(u => u.email === p.email);
    await svc.from('users').update({ auth_user_id: authUser?.id || null, is_demo: true }).eq('id', uid);

    // Create profile
    let e = await ups('candidate_profiles', {
      id: pid, user_id: uid,
      years_of_experience: 8 + p.idx,
      qualification: 'ماجستير', specialization: 'إدارة مؤسسية',
      status: p.status, completion_score: 88, is_demo: true,
    }, 'id');
    if (e) { console.log('PROFILE ERROR', p.name, e); continue; }

    // Initiatives
    e = await ups('initiatives', { id: ini1Id(p.idx + 1), candidate_profile_id: pid, name: p.ini1.name, initiative_type: 'institutional_improvement', achieved_impact: p.ini1.impact, evidence: 'تقرير مؤسسي موثق', is_demo: true }, 'id'); if (e) errs.push(e);
    e = await ups('initiatives', { id: ini2Id(p.idx + 1), candidate_profile_id: pid, name: p.ini2.name, initiative_type: 'process_improvement',       achieved_impact: p.ini2.impact, evidence: 'بيانات قسم العمليات', is_demo: true }, 'id'); if (e) errs.push(e);

    // KPIs
    e = await ups('kpis', { id: kpi1Id(p.idx + 1), candidate_profile_id: pid, name: p.kpi1.name, kpi_type: 'efficiency', target_value: p.kpi1.t, actual_value: p.kpi1.a, is_officially_approved: true, is_demo: true }, 'id'); if (e) errs.push(e);
    e = await ups('kpis', { id: kpi2Id(p.idx + 1), candidate_profile_id: pid, name: p.kpi2.name, kpi_type: 'quality',   target_value: p.kpi2.t, actual_value: p.kpi2.a, is_officially_approved: true, is_demo: true }, 'id'); if (e) errs.push(e);

    // Leadership card
    const isPublished = p.status === 'approved';
    e = await ups('leadership_cards', {
      id: cid, candidate_profile_id: pid,
      readiness_score: p.total, confidence_score: p.trust,
      total_score: p.total, trust_score: p.trust,
      readiness_level: p.readiness, leadership_type: p.leadType,
      axis_scores_json: p.axes, strengths_json: p.strengths, gaps_json: p.gaps,
      ai_summary: p.aiRec, is_published: isPublished, status: 'approved', is_demo: true,
    }, 'candidate_profile_id');
    if (e) errs.push(e);

    // Development plan
    e = await ups('development_plans', { id: did, candidate_profile_id: pid, readiness_level: p.readiness, leadership_type: p.leadType, overall_status: 'approved', ai_recommendations_json: { summary: p.aiRec }, is_demo: true }, 'id');
    if (e) errs.push(e);

    // Assessment results
    const { data: aRows } = await svc.from('assessments').select('id, code').in('code', ['leadership_influence', 'strategic_thinking', 'decision_making', 'emotional_intelligence']);
    const aMap = Object.fromEntries((aRows || []).map(a => [a.code, a.id]));
    const aDefs = [
      { code: 'leadership_influence', score: Math.min(95, p.total + 5) },
      { code: 'strategic_thinking',   score: Math.min(95, p.axes.strategic + 3) },
      { code: 'decision_making',      score: Math.min(95, (p.axes.leadership + p.axes.performance) / 2) },
      { code: 'emotional_intelligence', score: Math.min(95, p.axes.team + 2) },
    ];
    for (let ai = 0; ai < aDefs.length; ai++) {
      const ad = aDefs[ai];
      if (!aMap[ad.code]) continue;
      const arId = `a0${String(p.idx+1).padStart(2,'0')}${String(ai+1).padStart(2,'0')}00-cafe-beef-0000-aaaaaaaaaaaa`;
      await del('assessment_results', 'id', arId);
      e = await ups('assessment_results', { id: arId, candidate_profile_id: pid, assessment_id: aMap[ad.code], status: 'completed', score: ad.score, leadership_pattern: 'strategic', completed_at: new Date().toISOString(), is_demo: true }, 'id');
      if (e) errs.push(e);
    }

    // Position fit scores
    const fitLevel = p.total >= 85 ? 'high' : p.total >= 70 ? 'good' : p.total >= 55 ? 'conditional' : 'low';
    e = await ups('position_fit_scores', { candidate_profile_id: pid, organization_unit_id: p.unitId, fit_score: Math.min(100, p.total + 5), fit_level: fitLevel, confidence_score: p.trust, fit_reason: p.strengths[0], strengths_match_json: p.strengths, gaps_json: p.gaps, ai_summary: p.aiRec, is_demo: true }, 'candidate_profile_id,organization_unit_id');
    if (e) errs.push(e);

    // Approved evaluators + links + 360 evaluations
    for (let ev = 0; ev < 7; ev++) {
      const ci = String(p.idx).padStart(2, '0');
      const ei = String(ev + 1).padStart(2, '0');
      // UUID first segment = exactly 8 hex chars: 2+2+2+2=8
      const evId  = `bb${ci}${ei}00-cafe-beef-0000-aaaaaaaaaaaa`;
      const lnkId = `cc${ci}${ei}00-cafe-beef-0000-aaaaaaaaaaaa`;
      const e36Id = `dd${ci}${ei}00-cafe-beef-0000-aaaaaaaaaaaa`;

      e = await ups('approved_evaluators', {
        id: evId, candidate_profile_id: pid,
        full_name: EVAL_NAMES[ev],
        email: `eval${p.idx + 1}${ev + 1}@demo.jadeer.sa`,
        job_title: ['مدير إدارة', 'محلل أول', 'مشرف', 'أخصائي', 'مدير قسم', 'رئيس وحدة', 'مستشار'][ev],
        department: 'إدارة التطوير',
        relationship_type: RELS[ev],
        approved_by_committee: true,
        committee_selected: ev >= 4,
        can_verify_initiatives: ev < 4,
        can_verify_kpis: ev < 5,
        status: 'approved', is_demo: true,
      }, 'id');
      if (e) errs.push(e);

      const token = `seed-${p.idx + 1}-${ev + 1}-2026-final`;
      await svc.from('evaluation_links').delete().eq('token', token);
      e = await ups('evaluation_links', {
        id: lnkId, candidate_profile_id: pid, approved_evaluator_id: evId,
        token, expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: isPublished ? 'submitted' : 'ready',
        submitted_at: isPublished ? new Date().toISOString() : null, is_demo: true,
      }, 'id');
      if (e) errs.push(e);

      if (isPublished) {
        const drift = ev % 3 === 0 ? 3 : ev % 3 === 1 ? -2 : 1;
        e = await ups('evaluations_360', {
          id: e36Id, candidate_profile_id: pid, approved_evaluator_id: evId,
          evaluation_link_id: lnkId, relationship_type: RELS[ev],
          overall_score: Math.min(98, Math.max(40, Math.round(p.total + drift))),
          trust_score: Math.min(98, Math.max(40, Math.round(p.trust + drift))),
          scores_json: { leadership: Math.min(98, p.axes.leadership + drift), strategic: Math.min(98, p.axes.strategic + drift), performance: Math.min(98, p.axes.performance + drift), team: Math.min(98, p.axes.team + drift) },
          comments_summary: `يؤكد ${p.strengths[0]} في بيئة العمل اليومية`,
          submitted_at: new Date().toISOString(), is_demo: true,
        }, 'id');
        if (e) errs.push(e);
      }
    }

    if (errs.length === 0) { console.log('✅', p.name, '(' + p.readiness + ')'); totalOk++; }
    else { console.log('⚠️', p.name, ':', errs[0]); }
  }

  // Final verification
  const [{ count: cards }, { count: evals }, { count: inis }, { count: kpis }, { count: evs }] = await Promise.all([
    svc.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('is_demo', true),
    svc.from('evaluations_360').select('id', { count: 'exact', head: true }).eq('is_demo', true),
    svc.from('initiatives').select('id', { count: 'exact', head: true }).eq('is_demo', true),
    svc.from('kpis').select('id', { count: 'exact', head: true }).eq('is_demo', true),
    svc.from('approved_evaluators').select('id', { count: 'exact', head: true }).eq('is_demo', true),
  ]);

  console.log(`\n═══ النتيجة النهائية ═══`);
  console.log(`✅ مرشحون: ${totalOk}/5`);
  console.log(`📋 بطاقات قيادية: ${cards}`);
  console.log(`👥 مقيمون معتمدون: ${evs}`);
  console.log(`📊 تقييمات 360: ${evals}`);
  console.log(`🚀 مبادرات: ${inis}`);
  console.log(`📈 مؤشرات أداء: ${kpis}`);
}

main().catch(console.error);
