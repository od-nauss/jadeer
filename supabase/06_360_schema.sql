-- =============================================================
-- منصة جدير - جداول نظام تقييم 360 ودائرة الثقة
-- Jadeer Platform - 360 Evaluation System Schema
-- =============================================================
-- شغّل هذا في Supabase SQL Editor بعد 04_schema_patch.sql
-- =============================================================

-- جدول التحليل الذكي لنتائج تقييم 360
CREATE TABLE IF NOT EXISTS ai_360_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  -- درجات المحاور الكلية
  avg_scores_json JSONB,
  -- التباين بين المقيمين
  variance_json JSONB,
  -- التقييمات المتطرفة
  extreme_evaluations_json JSONB,
  -- مؤشرات التحيز المحتمل
  bias_flags_json JSONB,
  -- نتائج التحقق من المبادرات
  initiative_verification_json JSONB,
  -- نتائج التحقق من المؤشرات
  kpi_verification_json JSONB,
  -- مؤشرات التحليل الرئيسية
  team_satisfaction_score NUMERIC(5,2),
  trust_score NUMERIC(5,2),
  leadership_readiness_score NUMERIC(5,2),
  informal_leadership_score NUMERIC(5,2),
  -- مستوى الثقة في التقييم (مستقل عن الدرجة)
  confidence_level NUMERIC(5,2),
  -- ملخص ذكي للجنة
  ai_summary TEXT,
  recommendations_json JSONB,
  -- نوع القيادة المكتشف من 360
  detected_leadership_type TEXT,
  -- اكتمال التقييم
  completion_rate NUMERIC(5,2),
  evaluators_count INTEGER,
  extreme_count INTEGER,
  -- تشغيل التحليل
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ملخص تقييم 360 للمرشح (مُدمج في ملف المرشح)
CREATE TABLE IF NOT EXISTS candidate_360_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID UNIQUE REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  -- إحصاءات الاكتمال
  approved_evaluators_count INTEGER DEFAULT 0,
  completed_evaluations_count INTEGER DEFAULT 0,
  pending_links_count INTEGER DEFAULT 0,
  expired_links_count INTEGER DEFAULT 0,
  -- الدرجات الكلية
  overall_360_score NUMERIC(5,2),
  trust_score NUMERIC(5,2),
  team_satisfaction_score NUMERIC(5,2),
  -- حالة دائرة الثقة
  circle_status TEXT DEFAULT 'not_started'
    CHECK (circle_status IN (
      'not_started','list_submitted','evaluators_approved',
      'links_generated','in_progress','partially_completed',
      'completed','conditional_closed','extended'
    )),
  -- تواريخ مهمة
  list_submitted_at TIMESTAMPTZ,
  evaluators_approved_at TIMESTAMPTZ,
  links_generated_at TIMESTAMPTZ,
  evaluation_closed_at TIMESTAMPTZ,
  -- ملاحظات الإغلاق
  closure_type TEXT CHECK (closure_type IN ('complete','conditional','committee_decision')),
  closure_reason TEXT,
  closed_by UUID REFERENCES users(id),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة عمود governance_submission_at لـ evaluator_nominees (وقت إرسال القائمة للجنة)
ALTER TABLE evaluator_nominees
  ADD COLUMN IF NOT EXISTS submitted_to_committee_at TIMESTAMPTZ;

-- إضافة حقل علاقة دقيقة لـ approved_evaluators
ALTER TABLE approved_evaluators
  ADD COLUMN IF NOT EXISTS evaluator_name_alias TEXT;

ALTER TABLE approved_evaluators
  ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE approved_evaluators
  ADD COLUMN IF NOT EXISTS relationship_type TEXT;

-- إضافة حقل لتتبع كون المقيم من اختيار اللجنة صراحةً
-- (committee_selected موجود بالفعل)

-- إضافة عمود لتتبع إذا تم إنشاء الرابط
ALTER TABLE approved_evaluators
  ADD COLUMN IF NOT EXISTS link_generated_at TIMESTAMPTZ;

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_ai_360_candidate ON ai_360_analysis(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_360_summary_candidate ON candidate_360_summary(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_approved_evaluators_candidate ON approved_evaluators(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_approved_evaluators_status ON approved_evaluators(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_links_token ON evaluation_links(token);
CREATE INDEX IF NOT EXISTS idx_evaluation_links_status ON evaluation_links(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_360_candidate ON evaluations_360(candidate_profile_id);

-- التحقق
SELECT 'ai_360_analysis created' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_360_analysis');

SELECT 'candidate_360_summary created' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_360_summary');
