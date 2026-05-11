-- =============================================================
-- منصة جدير - تصحيح أسماء الأعمدة في leadership_cards
-- Jadeer Platform - Column Name Patch for leadership_cards
-- =============================================================
-- شغّل هذا في Supabase SQL Editor بعد 01_schema.sql و 02_seed.sql
-- =============================================================

-- إعادة تسمية أعمدة leadership_cards لتتطابق مع الكود
ALTER TABLE leadership_cards
  RENAME COLUMN readiness_score TO total_score;

ALTER TABLE leadership_cards
  RENAME COLUMN confidence_score TO trust_score;

ALTER TABLE leadership_cards
  RENAME COLUMN axis_scores_json TO axis_scores;

ALTER TABLE leadership_cards
  RENAME COLUMN strengths_json TO primary_strengths;

ALTER TABLE leadership_cards
  RENAME COLUMN gaps_json TO development_gaps;

-- إضافة عمود is_published كعمود محسوب
ALTER TABLE leadership_cards
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- تحديث is_published بناءً على الحالة الحالية
UPDATE leadership_cards SET is_published = (status = 'approved');

-- إضافة عمود status لجدول evaluator_nominees
ALTER TABLE evaluator_nominees
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected'));

-- إضافة عمود status لجدول initiatives (مسودة / مرسلة / محققة)
ALTER TABLE initiatives
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','verified','returned'));

-- إضافة عمود ai_score للتحليل الذكي
ALTER TABLE initiatives
  ADD COLUMN IF NOT EXISTS ai_score NUMERIC(5,2);
ALTER TABLE initiatives
  ADD COLUMN IF NOT EXISTS ai_feedback JSONB;

ALTER TABLE kpis
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted'));
ALTER TABLE kpis
  ADD COLUMN IF NOT EXISTS ai_score NUMERIC(5,2);
ALTER TABLE kpis
  ADD COLUMN IF NOT EXISTS ai_feedback JSONB;

-- للتحقق من نجاح التعديل:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leadership_cards'
ORDER BY ordinal_position;
