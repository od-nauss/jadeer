-- Patch: إضافة أعمدة إضافية لجدول governance_decisions
ALTER TABLE governance_decisions
  ADD COLUMN IF NOT EXISTS conditions TEXT,
  ADD COLUMN IF NOT EXISTS ai_score_at_decision NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ai_level_at_decision TEXT,
  ADD COLUMN IF NOT EXISTS leadership_type TEXT;
