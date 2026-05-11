-- إضافة عمود bypass_active لجدول executive_center_access
ALTER TABLE executive_center_access
  ADD COLUMN IF NOT EXISTS bypass_active BOOLEAN DEFAULT FALSE;
