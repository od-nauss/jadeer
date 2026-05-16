-- =============================================================
-- 11 — بيانات تجريبية: تضارب مصالح + قرارات اللجنة
-- شغّل هذا الملف في Supabase SQL Editor
-- =============================================================

-- ── 1. حالات تضارب مصالح تجريبية ──────────────────────────────
-- إضافة علاقة شخصية لأحد المرشَّحين لمرشح ffff0001
INSERT INTO evaluator_nominees (
  id, candidate_profile_id,
  full_name, email, phone, department, job_title,
  relationship_type, knowledge_duration, knowledge_type,
  selection_justification,
  has_personal_relationship,
  can_verify_initiatives, can_verify_kpis,
  is_demo
) VALUES (
  'eeee0001-demo-conf-0001-000000000001',
  'ffff0001-cafe-beef-0000-aaaaaaaaaaaa',
  'خالد بن عبدالله العتيبي',
  'khalid.otaibi@demo.sa',
  '0501234567',
  'إدارة العمليات',
  'مدير قسم المتابعة',
  'peer',
  '5 سنوات',
  'زمالة في مشاريع مشتركة',
  'من زملاء العمل ولديه خبرة مباشرة بأداء المرشح',
  TRUE,   -- has_personal_relationship
  TRUE, FALSE,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- إضافة مقيّم آخر أعطى درجة متطرفة (سيكون واضحاً في تقييم 360)
INSERT INTO evaluator_nominees (
  id, candidate_profile_id,
  full_name, email, phone, department, job_title,
  relationship_type, knowledge_duration, knowledge_type,
  selection_justification,
  has_personal_relationship,
  can_verify_initiatives, can_verify_kpis,
  is_demo
) VALUES (
  'eeee0002-demo-conf-0002-000000000002',
  'ffff0002-cafe-beef-0000-aaaaaaaaaaaa',
  'محمد بن سعد الدوسري',
  'mohammed.dosari@demo.sa',
  '0559876543',
  'إدارة التقنية',
  'مسؤول أنظمة المعلومات',
  'subordinate',
  '3 سنوات',
  'علاقة عمل مباشرة',
  'عمل تحت إشراف المرشح مباشرة لمدة ثلاث سنوات',
  FALSE,
  FALSE, TRUE,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- تقييم 360 بدرجة متطرفة منخفضة (15%) لإثارة تنبيه التحيز
INSERT INTO evaluations_360 (
  id, candidate_profile_id,
  approved_evaluator_id,
  overall_score, trust_score,
  scores_json,
  comments_summary,
  initiative_verifications_json, kpi_verifications_json,
  is_extreme,
  submitted_at,
  is_demo
) VALUES (
  'evev0001-demo-extr-0001-000000000001',
  'ffff0001-cafe-beef-0000-aaaaaaaaaaaa',
  NULL,
  15, 30,
  '{"leadership":{"score":10},"strategic":{"score":20},"performance":{"score":15},"team":{"score":10},"innovation":{"score":20}}'::jsonb,
  'تقييم منخفض جداً — يُشير لاحتمال تحيز أو خلاف شخصي',
  '{}'::jsonb, '{}'::jsonb,
  TRUE,
  NOW() - INTERVAL '5 days',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- ── 2. قرارات اللجنة التجريبية ────────────────────────────────

-- قرار اعتماد لمرشح نورة
INSERT INTO governance_decisions (
  id, candidate_profile_id,
  decision_type, reason,
  committee_note,
  new_status, new_classification,
  decided_by, decided_at,
  is_demo
) VALUES (
  'dddd0001-demo-decs-0001-000000000001',
  'ffff0002-cafe-beef-0000-aaaaaaaaaaaa',
  'approved',
  'بناءً على مراجعة شاملة لملف المرشحة، أظهرت كفاءة قيادية واضحة في إدارة الفرق وتحقيق الأهداف. سجل مبادراتها يدل على قدرة تنظيمية عالية وأثر مؤسسي ملموس. توصي اللجنة بالاعتماد الفوري وإدراجها في قائمة التعاقب القيادي.',
  NULL,
  'approved',
  'جاهز الآن / قائد تشغيلي',
  NULL,
  NOW() - INTERVAL '3 days',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- قرار إعادة للاستكمال لمرشح سعد
INSERT INTO governance_decisions (
  id, candidate_profile_id,
  decision_type, reason,
  committee_note,
  new_status, new_classification,
  decided_by, decided_at,
  is_demo
) VALUES (
  'dddd0002-demo-decs-0002-000000000002',
  'ffff0001-cafe-beef-0000-aaaaaaaaaaaa',
  'returned_for_completion',
  'الملف جيد لكن تقييم 360 لم يكتمل بشكل كافٍ. طُلب من المرشح استكمال تقييم المقيمين الذين لم يستجيبوا بعد. كما يُلاحظ وجود تقييم متطرف يستوجب التحقق قبل إصدار قرار نهائي.',
  'يُطلب استكمال تقييم 3 مقيمين على الأقل وتقديم رد على التقييم المتطرف',
  'returned_for_completion',
  'جاهز خلال سنة (مشروط)',
  NULL,
  NOW() - INTERVAL '1 day',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- قرار اعتماد مشروط لمرشح عبدالعزيز
INSERT INTO governance_decisions (
  id, candidate_profile_id,
  decision_type, reason,
  committee_note,
  new_status, new_classification,
  decided_by, decided_at,
  is_demo
) VALUES (
  'dddd0003-demo-decs-0003-000000000003',
  'ffff0003-cafe-beef-0000-aaaaaaaaaaaa',
  'conditional_approval',
  'المرشح يمتلك كفاءة تقنية استثنائية ومبادرات رقمية ذات أثر واضح. الاعتماد مشروط بإتمام برنامج تطوير المهارات القيادية خلال 6 أشهر لتعزيز الجانب الإنساني في قيادة الفريق.',
  'الشرط: إتمام برنامج القيادة الإنسانية وإدارة الفرق المتنوعة (6 أشهر)',
  'approved',
  'اعتماد مشروط / قائد تقني',
  NULL,
  NOW() - INTERVAL '7 days',
  TRUE
) ON CONFLICT (id) DO NOTHING;
