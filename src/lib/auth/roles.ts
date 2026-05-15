/**
 * تعريفات الأدوار والصلاحيات (RBAC)
 */

export type RoleCode = 'admin' | 'president' | 'advisor' | 'governance' | 'hr' | 'candidate';

export interface RoleInfo {
  code: RoleCode;
  nameAr: string;
  nameEn: string;
  homePath: string;
  primaryColor: string;
}

export const ROLES: Record<RoleCode, RoleInfo> = {
  admin: {
    code: 'admin',
    nameAr: 'مدير النظام',
    nameEn: 'System Administrator',
    homePath: '/admin/dashboard',
    primaryColor: 'darkgray',
  },
  president: {
    code: 'president',
    nameAr: 'الرئيس',
    nameEn: 'President',
    homePath: '/executive/dashboard',
    primaryColor: 'primary',
  },
  advisor: {
    code: 'advisor',
    nameAr: 'مستشار',
    nameEn: 'Advisor',
    homePath: '/advisor/dashboard',
    primaryColor: 'steelblue',
  },
  governance: {
    code: 'governance',
    nameAr: 'لجنة الحوكمة',
    nameEn: 'Governance Committee',
    homePath: '/governance/dashboard',
    primaryColor: 'wine',
  },
  hr: {
    code: 'hr',
    nameAr: 'عضو موارد بشرية',
    nameEn: 'HR Member',
    homePath: '/hr/dashboard',
    primaryColor: 'sage',
  },
  candidate: {
    code: 'candidate',
    nameAr: 'مرشح قيادي',
    nameEn: 'Leadership Candidate',
    homePath: '/candidate/dashboard',
    primaryColor: 'gold',
  },
};

export function getRoleInfo(code: string): RoleInfo | null {
  return ROLES[code as RoleCode] || null;
}

/**
 * فحص ما إذا كان الدور مسموحاً له بالوصول لمسار
 */
export function isRoleAllowedOnPath(role: RoleCode, path: string): boolean {
  // مدير النظام يستطيع الوصول لكل شيء (بما في ذلك تبديل الأدوار)
  if (role === 'admin') return true;

  const pathRolePrefix = path.split('/')[1];
  const roleHomePrefix = ROLES[role].homePath.split('/')[1];

  // مسارات عامة للجميع
  const sharedPaths = ['executive-center', 'organization'];
  if (sharedPaths.includes(pathRolePrefix)) {
    // executive-center محمي بكلمة مرور منفصلة
    if (pathRolePrefix === 'executive-center') return true;
    // organization متاح للأدوار العليا
    if (pathRolePrefix === 'organization') {
      return ['president', 'advisor', 'governance', 'hr', 'admin'].includes(role);
    }
  }

  return pathRolePrefix === roleHomePrefix;
}
