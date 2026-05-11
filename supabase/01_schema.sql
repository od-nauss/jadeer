-- =============================================================
-- منصة جدير - Schema قاعدة البيانات الكاملة
-- Jadeer Platform - Complete Database Schema
-- =============================================================
-- هذا الملف يحتوي على جميع الجداول المطلوبة لجميع المراحل العشر
-- This file contains all tables required for all 10 phases
-- =============================================================

-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 1. الأدوار والصلاحيات (RBAC)
-- =============================================================

-- جدول الأدوار
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدراج الأدوار الأساسية الستة
INSERT INTO roles (code, name_ar, name_en, description, is_system) VALUES
  ('admin', 'مدير النظام', 'System Administrator', 'إدارة كاملة للمنصة', TRUE),
  ('president', 'الرئيس', 'President', 'القيادة التنفيذية العليا', TRUE),
  ('advisor', 'مستشار', 'Advisor', 'مستشار للرئيس بصلاحيات محددة', TRUE),
  ('governance', 'لجنة الحوكمة', 'Governance Committee', 'مراجعة واعتماد التصنيفات', TRUE),
  ('hr', 'عضو موارد بشرية', 'HR Member', 'متابعة المسارات التطويرية', TRUE),
  ('candidate', 'مستخدم', 'User', 'الموظف المتقدم لمسار الجاهزية', TRUE)
ON CONFLICT (code) DO NOTHING;

-- جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- =============================================================
-- 2. المستخدمون
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  full_name_en TEXT,
  employee_number TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  organization_unit_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- صلاحية اطلاع المستشار (يمنحها الرئيس)
CREATE TABLE IF NOT EXISTS advisor_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('all_reports','specific_candidate','specific_unit','specific_competition','specific_report','fit_map')),
  candidate_id UUID,
  organization_unit_id UUID,
  report_id UUID,
  competition_id UUID,
  can_view_reports BOOLEAN DEFAULT FALSE,
  can_view_cards BOOLEAN DEFAULT FALSE,
  can_view_fit_map BOOLEAN DEFAULT FALSE,
  can_add_notes BOOLEAN DEFAULT TRUE,
  justification TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 3. الهيكل التنظيمي
-- =============================================================

CREATE TABLE IF NOT EXISTS organization_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  parent_unit_id UUID REFERENCES organization_units(id),
  description TEXT,
  main_tasks TEXT,
  work_nature TEXT,
  employee_count INTEGER DEFAULT 0,
  sensitivity_level TEXT CHECK (sensitivity_level IN ('low','medium','high','critical')),
  complexity_level TEXT CHECK (complexity_level IN ('low','medium','high')),
  is_critical BOOLEAN DEFAULT FALSE,
  has_vacancy BOOLEAN DEFAULT FALSE,
  needs_successor BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_unit_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_unit_id UUID REFERENCES organization_units(id) ON DELETE CASCADE,
  required_leadership_type TEXT,
  required_readiness_level TEXT,
  required_skills_json JSONB,
  weights_json JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 4. ملف المرشح القيادي
-- =============================================================

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  years_of_experience INTEGER,
  qualification TEXT,
  specialization TEXT,
  educational_institution TEXT,
  graduation_year INTEGER,
  professional_certifications TEXT,
  internal_experience TEXT,
  external_experience TEXT,
  current_tasks TEXT,
  past_leadership_tasks TEXT,
  team_participations TEXT,
  committee_participations TEXT,
  led_projects TEXT,
  leadership_skills TEXT[],
  technical_skills TEXT[],
  analytical_skills TEXT[],
  communication_skills TEXT[],
  team_management_skills TEXT[],
  crisis_management_skills TEXT[],
  planning_skills TEXT[],
  decision_making_skills TEXT[],
  systems_used TEXT[],
  analysis_tools TEXT[],
  ai_tools TEXT[],
  dashboard_tools TEXT[],
  pm_tools TEXT[],
  automation_tools TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new','in_progress','awaiting_evaluators','awaiting_360','under_governance_review','approved','returned_for_completion')),
  completion_score INTEGER DEFAULT 0,
  is_demo BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  file_name TEXT,
  file_url TEXT,
  attachment_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 5. المبادرات
-- =============================================================

CREATE TABLE IF NOT EXISTS initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initiative_type TEXT,
  problem_description TEXT,
  idea TEXT,
  candidate_role TEXT,
  was_idea_owner BOOLEAN DEFAULT FALSE,
  led_implementation BOOLEAN DEFAULT FALSE,
  participated_implementation BOOLEAN DEFAULT FALSE,
  coordinated_parties BOOLEAN DEFAULT FALSE,
  developed_tool BOOLEAN DEFAULT FALSE,
  tracked_impact BOOLEAN DEFAULT FALSE,
  beneficiary_group TEXT,
  beneficiary_count INTEGER,
  achieved_impact TEXT,
  impact_metrics TEXT,
  duration TEXT,
  is_sustainable BOOLEAN DEFAULT FALSE,
  is_generalizable BOOLEAN DEFAULT FALSE,
  innovation_level TEXT,
  organization_alignment TEXT,
  evidence TEXT,
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS initiative_witnesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  witness_name TEXT NOT NULL,
  witness_email TEXT,
  witness_relationship TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 6. مؤشرات الأداء
-- =============================================================

CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kpi_type TEXT,
  purpose TEXT,
  problem_addressed TEXT,
  target_value TEXT,
  actual_value TEXT,
  used_in_decision TEXT,
  team_impact TEXT,
  is_officially_approved BOOLEAN DEFAULT FALSE,
  team_participated BOOLEAN DEFAULT FALSE,
  evidence TEXT,
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 7. الاختبارات الذكية
-- =============================================================

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER,
  question_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice','situation','priority_ranking','best_decision','case_analysis','short_text')),
  options_json JSONB,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  score NUMERIC(5,2),
  thinking_pattern TEXT,
  leadership_pattern TEXT,
  strengths_json JSONB,
  gaps_json JSONB,
  answers_json JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 8. تقييم 360 - دائرة الثقة القيادية
-- =============================================================

-- المقيمون المقترحون من المستخدم (15)
CREATE TABLE IF NOT EXISTS evaluator_nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  relationship_type TEXT NOT NULL,
  knowledge_duration TEXT,
  knowledge_type TEXT,
  selection_justification TEXT,
  can_verify_initiatives BOOLEAN DEFAULT FALSE,
  verifiable_initiative_ids UUID[],
  can_verify_kpis BOOLEAN DEFAULT FALSE,
  verifiable_kpi_ids UUID[],
  has_personal_relationship BOOLEAN DEFAULT FALSE,
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- المقيمون المعتمدون من اللجنة (7-10)
CREATE TABLE IF NOT EXISTS approved_evaluators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  nominee_id UUID REFERENCES evaluator_nominees(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT,
  department TEXT,
  relationship_type TEXT,
  approved_by_committee BOOLEAN DEFAULT TRUE,
  added_by_committee BOOLEAN DEFAULT FALSE,
  committee_selected BOOLEAN DEFAULT FALSE,
  can_verify_initiatives BOOLEAN DEFAULT FALSE,
  can_verify_kpis BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- روابط التقييم الآمنة
CREATE TABLE IF NOT EXISTS evaluation_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  approved_evaluator_id UUID REFERENCES approved_evaluators(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  copied_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'ready' CHECK (status IN ('ready','copied','opened','submitted','expired','cancelled','regenerated')),
  created_by UUID REFERENCES users(id),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- نتائج تقييم 360
CREATE TABLE IF NOT EXISTS evaluations_360 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  approved_evaluator_id UUID REFERENCES approved_evaluators(id) ON DELETE CASCADE,
  evaluation_link_id UUID REFERENCES evaluation_links(id),
  relationship_type TEXT,
  scores_json JSONB,
  overall_score NUMERIC(5,2),
  trust_score NUMERIC(5,2),
  is_extreme BOOLEAN DEFAULT FALSE,
  risk_flags_json JSONB,
  comments_summary TEXT,
  initiative_verifications_json JSONB,
  kpi_verifications_json JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 9. لجنة الحوكمة والتصنيف
-- =============================================================

CREATE TABLE IF NOT EXISTS governance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_review','approved','returned','rejected')),
  file_completion_score NUMERIC(5,2),
  readiness_score NUMERIC(5,2),
  confidence_score NUMERIC(5,2),
  ai_summary TEXT,
  risk_flags_json JSONB,
  committee_notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  review_id UUID REFERENCES governance_reviews(id),
  decision_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  previous_classification TEXT,
  new_classification TEXT,
  reason TEXT NOT NULL,
  committee_note TEXT,
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMPTZ DEFAULT NOW(),
  is_demo BOOLEAN DEFAULT FALSE
);

-- البطاقة القيادية النهائية
CREATE TABLE IF NOT EXISTS leadership_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID UNIQUE REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2),
  readiness_level TEXT CHECK (readiness_level IN ('ready_now','ready_within_year','promising','specialist','not_suitable','high_performance_low_satisfaction','human_leader')),
  leadership_type TEXT,
  trust_score NUMERIC(5,2),
  axis_scores JSONB,
  primary_strengths JSONB,
  development_gaps JSONB,
  recommended_roles_json JSONB,
  ai_summary TEXT,
  governance_summary TEXT,
  special_tags TEXT[],
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','approved','revoked')),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 10. التظلمات
-- =============================================================

CREATE TABLE IF NOT EXISTS appeals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  appeal_type TEXT NOT NULL,
  appeal_text TEXT NOT NULL,
  attachments_json JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','in_review','needs_info','accepted','rejected','closed')),
  ai_classification TEXT,
  ai_recommendation TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  decision TEXT,
  decision_reason TEXT,
  closed_at TIMESTAMPTZ,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 11. خطط التطوير الفردية
-- =============================================================

CREATE TABLE IF NOT EXISTS development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  source_classification_id UUID REFERENCES leadership_cards(id),
  readiness_level TEXT,
  leadership_type TEXT,
  ai_recommendations_json JSONB,
  hr_review_status TEXT DEFAULT 'pending' CHECK (hr_review_status IN ('pending','in_review','approved','rejected')),
  hr_reviewed_by UUID REFERENCES users(id),
  governance_approval_status TEXT CHECK (governance_approval_status IN ('not_required','pending','approved','rejected')),
  governance_approved_by UUID REFERENCES users(id),
  overall_status TEXT DEFAULT 'proposed' CHECK (overall_status IN ('proposed','hr_review','awaiting_governance','approved','in_progress','completed','delayed','closed')),
  start_date DATE,
  target_end_date DATE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS development_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  development_plan_id UUID REFERENCES development_plans(id) ON DELETE CASCADE,
  skill_gap TEXT NOT NULL,
  reason TEXT,
  action_type TEXT CHECK (action_type IN ('training_program','practical_assignment','leadership_mentoring','guided_reading','applied_project','job_rotation','performance_note','reassessment')),
  action_description TEXT,
  responsible_party TEXT,
  success_indicator TEXT,
  target_date DATE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','delayed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 12. المسابقات الوظيفية ومسارات التقييم
-- =============================================================

CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  target_group TEXT,
  organization_unit_id UUID REFERENCES organization_units(id),
  competition_type TEXT,
  requirements_json JSONB,
  required_assessments_json JSONB,
  requires_360 BOOLEAN DEFAULT FALSE,
  requires_governance_review BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','open','closed','under_review','completed','archived')),
  created_by UUID REFERENCES users(id),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competition_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied',
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  target_group TEXT,
  requirements_json JSONB,
  required_assessments_json JSONB,
  requires_360 BOOLEAN DEFAULT FALSE,
  requires_governance_review BOOLEAN DEFAULT FALSE,
  duration_months INTEGER,
  status TEXT DEFAULT 'active',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 13. الملاءمة التنظيمية والتعاقب
-- =============================================================

CREATE TABLE IF NOT EXISTS position_fit_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  organization_unit_id UUID REFERENCES organization_units(id) ON DELETE CASCADE,
  fit_score NUMERIC(5,2),
  fit_level TEXT CHECK (fit_level IN ('high','good','conditional','low','not_suitable')),
  confidence_score NUMERIC(5,2),
  fit_reason TEXT,
  strengths_match_json JSONB,
  gaps_json JSONB,
  risk_flags_json JSONB,
  recommended_action TEXT,
  ai_summary TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_profile_id, organization_unit_id)
);

CREATE TABLE IF NOT EXISTS succession_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_unit_id UUID UNIQUE REFERENCES organization_units(id) ON DELETE CASCADE,
  status TEXT,
  risk_level TEXT CHECK (risk_level IN ('low','medium','high','critical')),
  summary TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS succession_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  succession_map_id UUID REFERENCES succession_maps(id) ON DELETE CASCADE,
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  rank_order INTEGER,
  readiness_level TEXT,
  fit_score NUMERIC(5,2),
  confidence_score NUMERIC(5,2),
  time_to_ready TEXT,
  development_needs_json JSONB,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 14. تنبيهات الرئيس وملاحظات المستشار
-- =============================================================

CREATE TABLE IF NOT EXISTS executive_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  candidate_profile_id UUID REFERENCES candidate_profiles(id),
  organization_unit_id UUID REFERENCES organization_units(id),
  severity TEXT CHECK (severity IN ('low','medium','high')),
  title TEXT NOT NULL,
  message TEXT,
  recommended_action TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','acknowledged','resolved','dismissed')),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advisor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  candidate_profile_id UUID REFERENCES candidate_profiles(id),
  note_type TEXT,
  note_text TEXT NOT NULL,
  visibility TEXT DEFAULT 'president_only',
  shared_with_president BOOLEAN DEFAULT TRUE,
  shared_with_governance BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  hr_user_id UUID REFERENCES users(id),
  note_type TEXT,
  note_text TEXT NOT NULL,
  visible_to_candidate BOOLEAN DEFAULT FALSE,
  visible_to_president BOOLEAN DEFAULT FALSE,
  sent_to_governance BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 15. التحليل الذكي (AI Analysis)
-- =============================================================

CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID,
  analysis_summary TEXT,
  scores_json JSONB,
  recommendations_json JSONB,
  risk_flags_json JSONB,
  confidence_score NUMERIC(5,2),
  ai_provider TEXT,
  ai_model TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_executive_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  summary_type TEXT NOT NULL,
  source_data_json JSONB,
  summary_text TEXT,
  recommendations_json JSONB,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 16. مركز العرض التنفيذي
-- =============================================================

CREATE TABLE IF NOT EXISTS executive_center_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_code_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executive_center_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content_json JSONB,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  requires_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executive_center_faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  display_order INTEGER,
  is_sensitive BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 17. الإشعارات
-- =============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  related_url TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 18. سجل التدقيق
-- =============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  user_role TEXT,
  operation_type TEXT NOT NULL,
  description TEXT,
  page_path TEXT,
  affected_entity_type TEXT,
  affected_entity_id UUID,
  previous_value_json JSONB,
  new_value_json JSONB,
  reason TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'success',
  sensitivity TEXT DEFAULT 'normal' CHECK (sensitivity IN ('normal','sensitive','critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 19. إعدادات النظام
-- =============================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  category TEXT,
  is_editable BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إعدادات الأوزان الافتراضية
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
  ('axis_weights', '{"leadership":20,"strategic":15,"performance":15,"innovation":15,"team":15,"technology":10,"integrity":10}'::jsonb, 'أوزان محاور التقييم السبعة', 'evaluation'),
  ('readiness_thresholds', '{"ready_now":85,"ready_within_year":75,"promising":65,"specialist":55}'::jsonb, 'حدود تصنيفات الجاهزية', 'evaluation'),
  ('evaluator_limits', '{"min_nominees":15,"min_approved":7,"max_approved":10,"committee_minimum_percent":60}'::jsonb, 'حدود المقيمين', 'evaluation'),
  ('submission_minimums', '{"min_initiatives":2,"min_kpis":2,"min_assessments":4}'::jsonb, 'الحد الأدنى للإرسال', 'evaluation'),
  ('link_validity_days', '14', 'مدة صلاحية رابط التقييم بالأيام', 'evaluation'),
  ('platform_name', '"منصة جدير"', 'اسم المنصة', 'identity'),
  ('platform_tagline', '"منصة مؤسسية لقياس الجدارة القيادية"', 'الشعار النصي', 'identity')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================================
-- 20. النصوص التعريفية للصفحات
-- =============================================================

CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  example TEXT,
  helper_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 21. علامات البيانات التجريبية
-- =============================================================

CREATE TABLE IF NOT EXISTS demo_data_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_demo_active BOOLEAN DEFAULT TRUE,
  total_demo_records INTEGER DEFAULT 0,
  last_seeded_at TIMESTAMPTZ,
  last_cleared_at TIMESTAMPTZ,
  cleared_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 22. رسائل التواصل من الصفحة العامة
-- =============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES للأداء
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_status ON candidate_profiles(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_profile ON initiatives(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_kpis_profile ON kpis(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_links_token ON evaluation_links(token);
CREATE INDEX IF NOT EXISTS idx_evaluation_links_status ON evaluation_links(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_360_profile ON evaluations_360(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_leadership_cards_profile ON leadership_cards(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_position_fit_candidate ON position_fit_scores(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_position_fit_unit ON position_fit_scores(organization_unit_id);

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================
-- ملاحظة: في هذا الإصدار التشغيلي الكامل، الصلاحيات تُدار في طبقة التطبيق
-- عبر RoleGuard ومتغيرات الجلسة. يمكن تفعيل RLS لاحقًا حسب الحاجة المؤسسية.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_cards ENABLE ROW LEVEL SECURITY;

-- سياسة فتح للقراءة من جانب التطبيق (التطبيق يفرض RBAC)
CREATE POLICY "Allow service role full access" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON candidate_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON evaluation_links
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON leadership_cards
  FOR ALL USING (true) WITH CHECK (true);
