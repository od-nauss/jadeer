import { createClient } from '@/lib/supabase/server';
import { getRoleInfo, type RoleCode } from './roles';

export interface CurrentUser {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  jobTitle: string | null;
  department: string | null;
  roles: RoleCode[];
  primaryRole: RoleCode;
  isAdmin: boolean;
  // وضع تبديل الأدوار للمدير
  impersonatingRole?: RoleCode;
}

/**
 * استرجاع المستخدم الحالي مع أدواره من قاعدة البيانات
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // جلب بيانات المستخدم من جدول users
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, full_name, job_title, department')
    .eq('auth_user_id', authUser.id)
    .single();

  if (!userData) return null;

  // جلب الأدوار
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('roles!inner(code)')
    .eq('user_id', userData.id);

  const roles = (rolesData || [])
    .map((r) => (r as { roles: { code: string } }).roles.code as RoleCode)
    .filter((code) => getRoleInfo(code) !== null);

  if (roles.length === 0) {
    return null;
  }

  // ترتيب الأدوار حسب الأولوية
  const rolePriority: RoleCode[] = ['admin', 'president', 'governance', 'hr', 'advisor', 'candidate'];
  const primaryRole = rolePriority.find((r) => roles.includes(r)) || roles[0];

  return {
    id: userData.id,
    authId: authUser.id,
    email: userData.email,
    fullName: userData.full_name,
    jobTitle: userData.job_title,
    department: userData.department,
    roles,
    primaryRole,
    isAdmin: roles.includes('admin'),
  };
}

/**
 * تسجيل عملية في سجل التدقيق
 */
export async function logAudit(params: {
  userId?: string | null;
  userRole?: string | null;
  operationType: string;
  description?: string;
  pagePath?: string;
  affectedEntityType?: string;
  affectedEntityId?: string;
  previousValue?: object;
  newValue?: object;
  reason?: string;
  sensitivity?: 'normal' | 'sensitive' | 'critical';
  status?: string;
}) {
  const supabase = createClient();
  await supabase.from('audit_logs').insert({
    user_id: params.userId || null,
    user_role: params.userRole || null,
    operation_type: params.operationType,
    description: params.description,
    page_path: params.pagePath,
    affected_entity_type: params.affectedEntityType,
    affected_entity_id: params.affectedEntityId,
    previous_value_json: params.previousValue,
    new_value_json: params.newValue,
    reason: params.reason,
    sensitivity: params.sensitivity || 'normal',
    status: params.status || 'success',
  });
}
