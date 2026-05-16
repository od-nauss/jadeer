/**
 * current-user.ts
 * الجهة الوحيدة لجلب بيانات المستخدم الحالي في المنصة
 * يستخدم createClient للـ auth (يحتاج session cookies)
 * ويستخدم createServiceClient لجميع استعلامات DB (يتجاوز RLS)
 */

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
const ROLE_PRIORITY: RoleCode[] = ['admin', 'president', 'governance', 'hr', 'advisor', 'candidate'];

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    // 1. التحقق من الجلسة (يجب أن يكون createClient لأنه يقرأ cookies)
    const authClient = createClient();
    const { data: { user: authUser }, error: authError } = await authClient.auth.getUser();
    if (authError || !authUser) return null;

    // 2. جلب بيانات المستخدم من DB (service client يتجاوز RLS)
    const svc = createServiceClient();

    let userData: {
      id: string; email: string; full_name: string;
      job_title: string | null; department: string | null;
      employee_number: string | null; is_active?: boolean;
    } | null = null;

    // أولاً: بحث بـ auth_user_id
    const { data: byAuthId } = await svc
      .from('users')
      .select('id, email, full_name, job_title, department, employee_number, is_active')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (byAuthId) {
      userData = byAuthId;
    } else {
      // ثانياً: بحث بالبريد الإلكتروني (معالجة حالة عدم تطابق auth_user_id)
      const { data: byEmail } = await svc
        .from('users')
        .select('id, email, full_name, job_title, department, employee_number, is_active')
        .eq('email', authUser.email!)
        .maybeSingle();

      if (byEmail) {
        userData = byEmail;
        // ربط auth_user_id للمرات القادمة
        try { await svc.from('users').update({ auth_user_id: authUser.id }).eq('id', byEmail.id); } catch { /* ignore */ }
      }
    }

    // ثالثاً: إنشاء تلقائي إذا لم يُوجد سجل (مستخدم جديد)
    if (!userData) {
      const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'مستخدم';
      const { data: newUser } = await svc
        .from('users')
        .upsert({ auth_user_id: authUser.id, email: authUser.email!, full_name: fullName, is_active: true }, { onConflict: 'email' })
        .select('id, email, full_name, job_title, department, employee_number, is_active')
        .single();

      if (newUser) {
        userData = newUser;
        // تعيين دور مدير النظام تلقائياً للبريد المحدد
        if (authUser.email === ADMIN_EMAIL) {
          const { data: adminRole } = await svc.from('roles').select('id').eq('code', 'admin').single();
          if (adminRole) {
            await svc.from('user_roles').upsert({ user_id: newUser.id, role_id: adminRole.id }, { onConflict: 'user_id,role_id' });
          }
        }
      }
    }

    if (!userData) return null;

    // 3. قراءة registration_status بشكل آمن (العمود قد لا يكون موجوداً)
    let registrationStatus: 'active' | 'pending' | 'rejected' = 'active';
    try {
      const { data: statusRow } = await svc
        .from('users')
        .select('registration_status, is_active')
        .eq('id', userData.id)
        .maybeSingle();

      if (statusRow) {
        const rs = (statusRow as any).registration_status;
        if (rs === 'pending' || rs === 'rejected') {
          registrationStatus = rs;
        } else if ((statusRow as any).is_active === false) {
          // is_active=false يعني الحساب معلق حتى لو لم يكن registration_status موجوداً
          registrationStatus = 'pending';
        }
      }
    } catch { /* العمود غير موجود بعد — نبقى على 'active' */ }

    // 4. مستخدمون معلقون أو مرفوضون
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
        primaryRole: 'candidate' as RoleCode,
        isAdmin: false,
        registrationStatus,
      };
    }

    // 5. جلب الأدوار
    const { data: rolesData } = await svc
      .from('user_roles')
      .select('roles!inner(code)')
      .eq('user_id', userData.id);

    const roles = (rolesData || [])
      .map(r => ((r as any).roles?.code as RoleCode))
      .filter(code => !!code && getRoleInfo(code) !== null);

    if (roles.length === 0) return null;

    const primaryRole = ROLE_PRIORITY.find(r => roles.includes(r)) || roles[0];

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
    const svc = createServiceClient();
    await svc.from('audit_logs').insert({
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
  } catch { /* ignore */ }
}
