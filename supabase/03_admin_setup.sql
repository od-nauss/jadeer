-- =============================================================
-- إعداد مستخدم الإدارة في جداول التطبيق
-- Jadeer Platform - Admin User Setup
-- =============================================================
-- شغّل هذا الملف مرة واحدة في Supabase SQL Editor
-- بعد إنشاء حساب admin@nauss.edu.sa في Auth
-- =============================================================

-- الخطوة 1: إضافة المدير في جدول users
INSERT INTO users (auth_user_id, email, full_name, is_active)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'مدير النظام'),
  TRUE
FROM auth.users au
WHERE au.email = 'admin@nauss.edu.sa'
AND NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@nauss.edu.sa'
);

-- الخطوة 2: تعيين دور المدير
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@nauss.edu.sa'
AND r.code = 'admin'
ON CONFLICT DO NOTHING;

-- =============================================================
-- حسابات اختبارية لكل الأدوار (اختياري)
-- شغّل هذا الجزء إذا كنت تريد حسابات تجريبية للأدوار الأخرى
-- =============================================================
-- ملاحظة: يجب أن تُنشئ حسابات Auth أولاً من Supabase Dashboard
-- Authentication > Add User لكل بريد إلكتروني

-- INSERT INTO users (auth_user_id, email, full_name, job_title, department, is_active)
-- SELECT au.id, au.email, 'اسم الموظف', 'المسمى الوظيفي', 'الإدارة', TRUE
-- FROM auth.users au WHERE au.email = 'user@nauss.edu.sa'
-- ON CONFLICT (auth_user_id) DO NOTHING;

-- للتحقق من نجاح الإعداد:
SELECT u.email, u.full_name, r.code as role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'admin@nauss.edu.sa';
