-- =============================================================
-- 12 — تصحيح نظام تسجيل المستخدمين
-- Multi-tier identity: pending approval, candidacy requests, multi-role
-- شغّل هذا الملف في Supabase SQL Editor
-- =============================================================

-- ── 1. إضافة عمود registration_status لجدول users ─────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'active'
    CHECK (registration_status IN ('active', 'pending', 'rejected'));

-- ── 2. جدول طلبات الترشح (للمستخدمين الحاليين الراغبين بالتقدم كمرشحين) ──
CREATE TABLE IF NOT EXISTS candidacy_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  justification TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. فهرس على candidacy_requests ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_candidacy_requests_user_id ON candidacy_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_candidacy_requests_status ON candidacy_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status);
