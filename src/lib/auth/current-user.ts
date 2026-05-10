import { createClient } from '@/lib/supabase/server';
import { getRoleInfo, type RoleCode } from './roles';

export interface CurrentUser {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  job_title: string | null;
  department: string | null;
  employee_number: string | null;
  roles: RoleCode[];
  primaryRole: RoleCode;
  isAdmin: boolean;
  impersonatingRole?: RoleCode;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, full_name, job_title, department, employee_number')
      .eq('auth_user_id', authUser.id)
      .single();

    if (!userData) return null;

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('roles!inner(code)')
      .eq('user_id', userData.id);

    const roles = (rolesData || [])
      .map((r) => (r as { roles: { code: string } }).roles.code as RoleCode)
      .filter((code) => getRoleInfo(code) !== null);

    if (roles.length === 0) return null;

    const rolePriority: RoleCode[] = ['admin', 'president', 'governance', 'hr', 'advisor', 'candidate'];
    const primaryRole = rolePriority.find((r) => roles.includes(r)) || roles[0];

    return {
      id: userData.id,
      auth_user_id: authUser.id,
      email: userData.email,
      full_name: userData.full_name,
      job_title: userData.job_title,
      department: userData.department,
      employee_number: userData.employee_number,
      roles,
      primaryRole,
      isAdmin: roles.includes('admin'),
    };
  } catch {
    return null;
  }
}

export async function logAudit(params: {
  user_id?: string | null;
  user_role?: string | null;
  operation_type: string;
  description?: string;
  page_path?: string;
  affected_entity?: string;
  affected_id?: string;
  metadata?: object;
  reason?: string;
  sensitivity?: 'normal' | 'sensitive' | 'critical';
  status?: string;
}) {
  try {
    const supabase = createClient();
    await supabase.from('audit_logs').insert({
      user_id: params.user_id || null,
      user_role: params.user_role || null,
      operation_type: params.operation_type,
      description: params.description,
      page_path: params.page_path,
      affected_entity_type: params.affected_entity,
      affected_entity_id: params.affected_id,
      new_value_json: params.metadata,
      reason: params.reason,
      sensitivity: params.sensitivity || 'normal',
      status: params.status || 'success',
    });
  } catch {
    // ignore
  }
}
