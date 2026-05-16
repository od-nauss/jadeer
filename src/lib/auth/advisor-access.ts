/**
 * advisor-access.ts
 * نظام صلاحيات المستشار — يقرأ جدول advisor_access ويُحدد ما يمكن للمستشار رؤيته
 * إذا لم تكن هناك صلاحيات مُحددة → المستشار يرى جميع البطاقات المنشورة (الوضع الافتراضي)
 */

import { createServiceClient } from '@/lib/supabase/server';

export interface AdvisorPermissions {
  hasAnyAccess: boolean;
  canViewAllCards: boolean;
  canViewReports: boolean;
  canViewFitMap: boolean;
  canAddNotes: boolean;
  allowedCandidateIds: string[];
}

const DEFAULT_OPEN: AdvisorPermissions = {
  hasAnyAccess: true,
  canViewAllCards: true,
  canViewReports: true,
  canViewFitMap: true,
  canAddNotes: true,
  allowedCandidateIds: [],
};

/**
 * جلب صلاحيات المستشار
 * إذا لم يكن للمستشار أي سجلات في advisor_access → يعود بصلاحيات مفتوحة (افتراضي للديمو والمستشارين المعتمدين)
 */
export async function getAdvisorPermissions(userId: string): Promise<AdvisorPermissions> {
  try {
    const svc = createServiceClient();
    const { data: grants, error } = await svc
      .from('advisor_access')
      .select('access_type, candidate_id, can_view_reports, can_view_cards, can_view_fit_map, can_add_notes, status, expires_at')
      .eq('advisor_user_id', userId)
      .eq('status', 'active');

    if (error) {
      // الجدول قد لا يكون موجوداً أو خطأ ما → نعطي صلاحيات مفتوحة
      return DEFAULT_OPEN;
    }

    // لا يوجد سجلات → صلاحيات مفتوحة افتراضية
    if (!grants || grants.length === 0) {
      return DEFAULT_OPEN;
    }

    // فلترة السجلات غير المنتهية
    const now = new Date();
    const activeGrants = grants.filter(g => !g.expires_at || new Date(g.expires_at) > now);

    if (activeGrants.length === 0) {
      return { ...DEFAULT_OPEN, hasAnyAccess: false, canViewAllCards: false, canViewReports: false };
    }

    // فحص نوع الصلاحية
    const hasAllReports = activeGrants.some(g => g.access_type === 'all_reports');
    const canViewCards = activeGrants.some(g => g.can_view_cards);
    const canViewReports = activeGrants.some(g => g.can_view_reports);
    const canViewFitMap = activeGrants.some(g => g.can_view_fit_map);
    const canAddNotes = activeGrants.some(g => g.can_add_notes);

    const specificCandidateIds = activeGrants
      .filter(g => g.access_type === 'specific_candidate' && g.candidate_id)
      .map(g => g.candidate_id as string);

    return {
      hasAnyAccess: true,
      canViewAllCards: hasAllReports || canViewCards,
      canViewReports,
      canViewFitMap,
      canAddNotes,
      allowedCandidateIds: specificCandidateIds,
    };
  } catch {
    // أي خطأ → صلاحيات مفتوحة
    return DEFAULT_OPEN;
  }
}

/**
 * هل يحق للمستشار رؤية بطاقة مرشح معين؟
 */
export async function canAdvisorViewCard(userId: string, candidateProfileId: string): Promise<boolean> {
  try {
    const perms = await getAdvisorPermissions(userId);
    if (!perms.hasAnyAccess) return false;
    if (perms.canViewAllCards) return true;
    return perms.allowedCandidateIds.includes(candidateProfileId);
  } catch {
    return true; // في حالة الخطأ نُتيح الوصول
  }
}
