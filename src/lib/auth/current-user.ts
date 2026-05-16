import { createClient, createServiceClient } from '@/lib/supabase/server';
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
  registrationStatus: 'active' | 'pending' | 'rejected';
}

const ADMIN_EMAIL = 'admin@nauss.edu.sa';

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    // Try to find user by auth_user_id first, then by email
    let { data: userData } = await supabase
      .from('users')
      .select('id, email, full_name, job_title, department, employee_number, registration_status')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (!userData) {
      // Try by email (handles auth_user_id mismatch after account repair)
      const { data: byEmail } = await supabase
        .from('users')
        .select('id, email, full_name, job_title, department, employee_number, registration_status')
        .eq('email', authUser.email!)
        .maybeSingle();

      if (byEmail) {
        // Fix the auth_user_id link using service client
        try {
          const service = createServiceClient();
          await service
            .from('users')
            .update({ auth_user_id: authUser.id })
            .eq('id', byEmail.id);
        } catch { /* ignore */ }
        userData = byEmail;
      }
    }

    // Auto-provision: create users table record if not found at all
    if (!userData) {
      try {
        const service = createServiceClient();
        const fullName =
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'مستخدم';

        const { data: newUser } = await service
          .from('users')
          .upsert(
            {
              auth_user_id: authUser.id,
              email: authUser.email!,
              full_name: fullName,
              is_active: true,
              registration_status: 'active',
            },
            { onConflict: 'email' }
          )
          .select('id, email, full_name, job_title, department, employee_number, registration_status')
          .single();

        if (newUser) {
          userData = newUser;

          // Auto-assign admin role for admin email
          if (authUser.email === ADMIN_EMAIL) {
            const { data: adminRole } = await service
              .from('roles')
              .select('id')
              .eq('code', 'admin')
              .single();
            if (adminRole) {
              await service
                .from('user_roles')
                .upsert(
                  { user_id: newUser.id, role_id: adminRole.id },
                  { onConflict: 'user_id,role_id' }
                );
            }
          }
        }
      } catch { /* Auto-provisioning failed */ }
    }

    if (!userData) return null;

    const registrationStatus = (userData.registration_status as 'active' | 'pending' | 'rejected') || 'active';

    // Pending or rejected users: return minimal user with status (no roles needed)
    if (registrationStatus === 'pending' || registrationStatus === 'rejected') {
      return {
        id: userData.id,
        auth_user_id: authUser.id,
        email: userData.email,
        full_name: userData.full_name,
        job_title: userData.job_title,
        department: userData.department,
        employee_number: userData.employee_number,
        roles: [],
        primaryRole: 'candidate',
        isAdmin: false,
        registrationStatus,
      };
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('roles!inner(code)')
      .eq('user_id', userData.id);

    const roles = (rolesData || [])
      .map((r) => ((r as unknown as { roles: { code: string } }).roles?.code ?? '') as RoleCode)
      .filter((code) => !!code && getRoleInfo(code) !== null);

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
      registrationStatus: 'active',
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
