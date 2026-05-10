import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatArabicDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * تنسيق رقم الجاهزية
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value)}٪`;
}

/**
 * الحصول على تصنيف الجاهزية من الدرجة
 */
export function getReadinessLevel(score: number): {
  code: string;
  label: string;
  color: string;
} {
  if (score >= 85) return { code: 'ready_now', label: 'جاهز الآن', color: 'sage' };
  if (score >= 75)
    return { code: 'ready_within_year', label: 'جاهز خلال سنة', color: 'primary' };
  if (score >= 65)
    return {
      code: 'promising',
      label: 'واعد ويحتاج تطويراً موجهاً',
      color: 'gold',
    };
  if (score >= 55)
    return {
      code: 'specialist',
      label: 'متخصص جيد يحتاج تأهيلاً قيادياً',
      color: 'steelblue',
    };
  return {
    code: 'not_suitable',
    label: 'غير مناسب للمسار القيادي حالياً',
    color: 'darkgray',
  };
}

/**
 * تنسيق نوع الصلة بالمقيم
 */
export function relationshipTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    direct_manager: 'مدير مباشر',
    previous_manager: 'مدير سابق',
    colleague: 'زميل',
    subordinate: 'مرؤوس',
    team_member: 'عضو فريق',
    stakeholder: 'صاحب علاقة',
    project_partner: 'شريك في مشروع',
    internal_beneficiary: 'مستفيد داخلي',
    other: 'أخرى',
  };
  return labels[type] || type;
}

/**
 * تنسيق نوع القيادة
 */
export function leadershipTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    strategic: 'قائد استراتيجي',
    operational: 'قائد تشغيلي',
    transformational: 'قائد تحويلي',
    innovative: 'قائد ابتكاري',
    crisis: 'قائد أزمات',
    high_performance_teams: 'قائد فرق عالية الأداء',
    institutional: 'قائد تطوير مؤسسي',
    technical: 'قائد تقني',
    academic: 'قائد أكاديمي',
    administrative: 'قائد إداري تنفيذي',
    human_leader: 'قائد إنساني',
    hidden: 'قيادة مخفية محتملة',
    specialist: 'متخصص متميز',
  };
  return labels[type] || type;
}

/**
 * توليد token آمن للروابط
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * مستويات الجاهزية - ثابت قابل للاستيراد في الـUI
 */
export const READINESS_LEVELS = {
  ready_now: { label_ar: 'جاهز الآن', label_en: 'Ready Now', color: 'text-green-700', bg: 'bg-green-100' },
  ready_within_year: { label_ar: 'جاهز خلال سنة', label_en: 'Ready Within a Year', color: 'text-amber-700', bg: 'bg-amber-100' },
  promising: { label_ar: 'واعد ويحتاج تطويراً موجهاً', label_en: 'Promising', color: 'text-blue-700', bg: 'bg-blue-100' },
  specialist: { label_ar: 'متخصص يحتاج تجربة قيادية', label_en: 'Specialist', color: 'text-purple-700', bg: 'bg-purple-100' },
  not_suitable: { label_ar: 'لا يناسب القيادة المباشرة حالياً', label_en: 'Not Suitable Yet', color: 'text-red-700', bg: 'bg-red-100' },
  high_performance_low_satisfaction: { label_ar: 'إنجاز عالٍ / رضا منخفض', label_en: 'High Performer / Low Satisfaction', color: 'text-orange-700', bg: 'bg-orange-100' },
  human_leader: { label_ar: 'قائد إنساني', label_en: 'Human Leader', color: 'text-pink-700', bg: 'bg-pink-100' },
  hidden: { label_ar: 'قيادة مخفية', label_en: 'Hidden Leader', color: 'text-indigo-700', bg: 'bg-indigo-100' },
} as const;

/**
 * التحقق من اكتمال الملف
 */
export function calculateProfileCompletion(profile: {
  years_of_experience?: number | null;
  qualification?: string | null;
  job_title?: string | null;
  department?: string | null;
  internal_experience?: string | null;
  leadership_skills?: string[] | null;
  technical_skills?: string[] | null;
}): number {
  let score = 0;
  const fields = [
    profile.years_of_experience,
    profile.qualification,
    profile.job_title,
    profile.department,
    profile.internal_experience,
    profile.leadership_skills?.length,
    profile.technical_skills?.length,
  ];
  fields.forEach((field) => {
    if (field) score += 100 / fields.length;
  });
  return Math.round(score);
}
