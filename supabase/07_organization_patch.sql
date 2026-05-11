-- =====================================================
-- 07 — Organization Module Patch
-- =====================================================

-- إضافة أعمدة مفقودة في organization_units
ALTER TABLE organization_units
  ADD COLUMN IF NOT EXISTS is_suitable_for_trial BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_suitable_for_development BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS leadership_need_level TEXT CHECK (leadership_need_level IN ('low','medium','high','critical')) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS impact_level TEXT CHECK (impact_level IN ('low','medium','high','strategic')) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- إضافة أعمدة مفقودة في organization_unit_requirements
ALTER TABLE organization_unit_requirements
  ADD COLUMN IF NOT EXISTS other_required_skills TEXT[],
  ADD COLUMN IF NOT EXISTS leadership_style_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- إضافة أعمدة مفقودة في succession_maps
ALTER TABLE succession_maps
  ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- جدول موصيات التطوير لوحدات التنظيم
CREATE TABLE IF NOT EXISTS unit_development_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_unit_id UUID REFERENCES organization_units(id) ON DELETE CASCADE,
  candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT CHECK (recommendation_type IN ('competition','internal_development','external_hire','trial_assignment','coaching')),
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 2,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done','dismissed')),
  created_by UUID REFERENCES users(id),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- سجل تغييرات الهيكل التنظيمي
CREATE TABLE IF NOT EXISTS organization_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE unit_development_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_change_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_access_recommendations" ON unit_development_recommendations FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_access_org_logs" ON organization_change_logs FOR ALL TO authenticated USING (true);
