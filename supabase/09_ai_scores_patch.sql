-- =====================================================
-- 09 — إضافة أعمدة AI Score المفقودة
-- =====================================================

-- أعمدة التحليل الذكي لجدول المبادرات
ALTER TABLE initiatives
  ADD COLUMN IF NOT EXISTS ai_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','verified','returned'));

-- أعمدة التحليل الذكي لجدول مؤشرات الأداء
ALTER TABLE kpis
  ADD COLUMN IF NOT EXISTS ai_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','verified','returned'));

-- عمود leadership_pattern في نتائج الاختبارات (إن لم يكن موجوداً)
ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS leadership_pattern TEXT,
  ADD COLUMN IF NOT EXISTS strengths_json JSONB,
  ADD COLUMN IF NOT EXISTS gaps_json JSONB;

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_initiatives_candidate ON initiatives(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_kpis_candidate ON kpis(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_candidate ON assessment_results(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_leadership_cards_published ON leadership_cards(is_published, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_status ON candidate_profiles(status);
