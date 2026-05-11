/**
 * Advisor Access Control
 * يتحقق من صلاحيات المستشار قبل عرض أي بيانات
 */
import { createClient } from '@/lib/supabase/server';

export interface AdvisorPermissions {
  canViewAllCards: boolean;
  canViewAllReports: boolean;
  canViewFitMap: boolean;
  canAddNotes: boolean;
  allowedCandidateIds: string[];      // candidate_profile_id
  allowedUnitIds: string[];
  allowedCompetitionIds: string[];
  hasAnyAccess: boolean;
}

export async function getAdvisorPermissions(advisorUserId: string): Promise<AdvisorPermissions> {
  const supabase = createClient();

  const { data: accesses } = await supabase
    .from('advisor_access')
    .select('*')
    .eq('advisor_user_id', advisorUserId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (!accesses || accesses.length === 0) {
    return {
      canViewAllCards: false, canViewAllReports: false,
      canViewFitMap: false, canAddNotes: false,
      allowedCandidateIds: [], allowedUnitIds: [], allowedCompetitionIds: [],
      hasAnyAccess: false,
    };
  }

  const allReports = accesses.some(a => a.access_type === 'all_reports');
  const canViewAllCards = allReports || accesses.some(a => a.can_view_cards && a.access_type === 'all_reports');
  const canViewAllReports = allReports;
  const canViewFitMap = accesses.some(a => a.can_view_fit_map || a.access_type === 'fit_map');
  const canAddNotes = accesses.some(a => a.can_add_notes);

  const allowedCandidateIds = accesses
    .filter(a => a.candidate_id && (a.access_type === 'specific_candidate' || a.can_view_cards))
    .map(a => a.candidate_id as string);

  const allowedUnitIds = accesses
    .filter(a => a.organization_unit_id)
    .map(a => a.organization_unit_id as string);

  const allowedCompetitionIds = accesses
    .filter(a => a.competition_id)
    .map(a => a.competition_id as string);

  return {
    canViewAllCards,
    canViewAllReports,
    canViewFitMap,
    canAddNotes,
    allowedCandidateIds,
    allowedUnitIds,
    allowedCompetitionIds,
    hasAnyAccess: accesses.length > 0,
  };
}

export async function canAdvisorViewCard(advisorUserId: string, candidateProfileId: string): Promise<boolean> {
  const perms = await getAdvisorPermissions(advisorUserId);
  if (perms.canViewAllCards) return true;
  return perms.allowedCandidateIds.includes(candidateProfileId);
}
