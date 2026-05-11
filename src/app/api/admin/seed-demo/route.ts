// POST /api/admin/seed-demo
// ظٹظ†ط´ط¦ 5 ظ…ط±ط´ط­ظٹظ† طھط¬ط±ظٹط¨ظٹظٹظ† ظƒط§ظ…ظ„ظٹظ† ظ…ط¹ ط¬ظ…ظٹط¹ ط¨ظٹط§ظ†ط§طھظ‡ظ…
// ظٹط³طھط®ط¯ظ… service client ظ„طھط¬ط§ظˆط² RLS
// ظٹظڈط´ط؛ظژظ‘ظ„ ظ…ط±ط© ظˆط§ط­ط¯ط© ظپظ‚ط· ظ…ظ† طµظپط­ط© /admin/demo-data

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { computeGovernanceScore } from '@/lib/ai/analyzerGovernance';

const DEMO_PROFILES = [
  {
    // ط§ظ„ظ†ظ…ظˆط°ط¬ ط§ظ„ط£ظˆظ„: ظ‚ط§ط¦ط¯ ط§ط³طھط±ط§طھظٹط¬ظٹ ط¬ط§ظ‡ط² ط®ظ„ط§ظ„ ط³ظ†ط©
    id: 'demo-cand-0001-0000-0000-000000000001',
    userId: 'demo-user-0001-0000-0000-000000000001',
    name: 'ط³ط¹ط¯ ط¨ظ† ظ…ط­ظ…ط¯ ط§ظ„ط­ط§ط±ط«ظٹ',
    email: 'saad.harthy@demo.jadeer.sa',
    job_title: 'ظ…ط¯ظٹط± طھط®ط·ظٹط· ط§ط³طھط±ط§طھظٹط¬ظٹ',
    department: 'ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹط©',
    years_experience: 12,
    readiness: 'ready_within_year',
    leadership_type: 'strategic',
    total_score: 78,
    trust_score: 72,
    axis_scores: { leadership: 80, strategic: 88, performance: 72, innovation: 76, team: 68, technology: 74, integrity: 85 },
    strengths: ['طھظپظƒظٹط± ط§ط³طھط±ط§طھظٹط¬ظٹ ظ…طھظ…ظٹط²', 'ظ‚ط¯ط±ط© ط¹ظ„ظ‰ ط±ط¤ظٹط© ط§ظ„طµظˆط±ط© ط§ظ„ظƒط¨ظٹط±ط©', 'ط®ط¨ط±ط© ظپظٹ طھط­ظ„ظٹظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط¹ظ‚ط¯ط©'],
    gaps: ['ظٹط­طھط§ط¬ طھط¹ط²ظٹط² ظ…ظ‡ط§ط±ط§طھ ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظٹظ‚', 'طھط·ظˆظٹط± ط±ط¶ط§ ط§ظ„ظپط±ظٹظ‚ ظˆط§ظ„طھظˆط§طµظ„ ط§ظ„ظ‚ظٹط§ط¯ظٹ'],
    development_plan: 'ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظ‚ظٹط§ط¯ط© ط§ظ„طھط­ظˆظٹظ„ظٹط© 6 ط£ط´ظ‡ط± + طھظƒظ„ظٹظپ طھط¬ط±ظٹط¨ظٹ ظپظٹ ظ…ط´ط±ظˆط¹ ط§ط³طھط±ط§طھظٹط¬ظٹ',
    recommendation: 'ظ…ط±ط´ط­ ظ‚ظˆظٹ ظ„ظ„ظ‚ظٹط§ط¯ط© ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹط© ط®ظ„ط§ظ„ 12 ط´ظ‡ط±ط§ظ‹ ط¨ط¹ط¯ طھط·ظˆظٹط± ظ…ظ‡ط§ط±ط§طھ ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظٹظ‚',
    unit_id: '22222222-2222-2222-2222-222222222222',
  },
  {
    // ط§ظ„ظ†ظ…ظˆط°ط¬ ط§ظ„ط«ط§ظ†ظٹ: ظ‚ط§ط¦ط¯ طھط´ط؛ظٹظ„ظٹ ط¬ط§ظ‡ط² ط§ظ„ط¢ظ†
    id: 'demo-cand-0002-0000-0000-000000000002',
    userId: 'demo-user-0002-0000-0000-000000000002',
    name: 'ظ†ظˆط±ط© ط¨ظ†طھ ط¹ط¨ط¯ط§ظ„ظ„ظ‡ ط§ظ„ظ‚ط­ط·ط§ظ†ظٹ',
    email: 'noura.qahtani@demo.jadeer.sa',
    job_title: 'ط±ط¦ظٹط³ط© ظ‚ط³ظ… ط§ظ„ط¹ظ…ظ„ظٹط§طھ',
    department: 'ط¥ط¯ط§ط±ط© ط§ظ„ط¹ظ…ظ„ظٹط§طھ',
    years_experience: 9,
    readiness: 'ready_now',
    leadership_type: 'operational',
    total_score: 87,
    trust_score: 85,
    axis_scores: { leadership: 85, strategic: 72, performance: 92, innovation: 78, team: 88, technology: 80, integrity: 90 },
    strengths: ['ط£ط¯ط§ط، طھط´ط؛ظٹظ„ظٹ ط§ط³طھط«ظ†ط§ط¦ظٹ', 'ط±ط¶ط§ ط§ظ„ظپط±ظٹظ‚ ظ…ط±طھظپط¹ ط¬ط¯ط§ظ‹', 'ظ…ط¤ط´ط±ط§طھ ط£ط¯ط§ط، ظˆط§ط¶ط­ط© ظˆظ…ظˆط«ظ‚ط©'],
    gaps: ['طھط­طھط§ط¬ طھط¹ط²ظٹط² ط§ظ„طھط®ط·ظٹط· ط·ظˆظٹظ„ ط§ظ„ظ…ط¯ظ‰', 'طھط·ظˆظٹط± ظ…ظ‡ط§ط±ط§طھ ط§ظ„طھظپط§ظˆط¶ ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹ'],
    development_plan: 'طھظƒظ„ظٹظپ ظ‚ظٹط§ط¯ظٹ ظ…ط¨ط§ط´ط± + ط¨ط±ظ†ط§ظ…ط¬ ظ‚طµظٹط± ظپظٹ ط§ظ„طھط®ط·ظٹط· ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹ (3 ط£ط´ظ‡ط±)',
    recommendation: 'طھظƒظ„ظٹظپ ظ‚ظٹط§ط¯ظٹ ظپظˆط±ظٹ ظپظٹ ط¥ط¯ط§ط±ط© ط§ظ„ط¹ظ…ظ„ظٹط§طھ ظ…ط¹ ظ…ط±ط§ط¬ط¹ط© ط¯ظˆط±ظٹط© ظƒظ„ 6 ط£ط´ظ‡ط±',
    unit_id: '22222222-2222-2222-2222-222222222221',
  },
  {
    // ط§ظ„ظ†ظ…ظˆط°ط¬ ط§ظ„ط«ط§ظ„ط«: ظ‚ط§ط¦ط¯ طھظ‚ظ†ظٹ ظˆط§ط¹ط¯
    id: 'demo-cand-0003-0000-0000-000000000003',
    userId: 'demo-user-0003-0000-0000-000000000003',
    name: 'ط¹ط¨ط¯ط§ظ„ط¹ط²ظٹط² ط¨ظ† ط³ط§ظ„ظ… ط§ظ„ط¯ظˆط³ط±ظٹ',
    email: 'abdulaziz.dosari@demo.jadeer.sa',
    job_title: 'ظ…ظ‡ظ†ط¯ط³ ط£ظ†ط¸ظ…ط© ظˆط°ظƒط§ط، ط§طµط·ظ†ط§ط¹ظٹ',
    department: 'ط¥ط¯ط§ط±ط© ط§ظ„طھظ‚ظ†ظٹط© ظˆط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ',
    years_experience: 7,
    readiness: 'promising',
    leadership_type: 'technical',
    total_score: 71,
    trust_score: 68,
    axis_scores: { leadership: 62, strategic: 68, performance: 80, innovation: 88, team: 60, technology: 92, integrity: 78 },
    strengths: ['ط®ط¨ط±ط© طھظ‚ظ†ظٹط© ظ†ط§ط¯ط±ط© ظپظٹ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ', 'ط§ط¨طھظƒط§ط± ظˆط­ظ„ ظ…ط´ظƒظ„ط§طھ ظ…طھظ…ظٹط²', 'ط£ط¯ط§ط، طھظ‚ظ†ظٹ ط§ط³طھط«ظ†ط§ط¦ظٹ'],
    gaps: ['ظٹط­طھط§ط¬ طھط·ظˆظٹط± ظ…ظ‡ط§ط±ط§طھ ط§ظ„ظ‚ظٹط§ط¯ط© ط§ظ„ط¥ظ†ط³ط§ظ†ظٹط©', 'طھط¹ط²ظٹط² ط§ظ„طھظˆط§طµظ„ ظ…ط¹ ط؛ظٹط± ط§ظ„طھظ‚ظ†ظٹظٹظ†', 'ط±ظپط¹ ط±ط¶ط§ ط§ظ„ظپط±ظٹظ‚'],
    development_plan: 'ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظ‚ظٹط§ط¯ط© ط§ظ„ط±ظ‚ظ…ظٹط© 12 ط´ظ‡ط±ط§ظ‹ + طھط·ظˆظٹط± ظ…ظ‡ط§ط±ط§طھ ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظٹظ‚ + ط¥ط´ط±ط§ظƒظ‡ ظپظٹ ظ‚ط±ط§ط±ط§طھ ط§ط³طھط±ط§طھظٹط¬ظٹط©',
    recommendation: 'ظˆط§ط¹ط¯ ط¬ط¯ط§ظ‹ ظ„ظ„ظ‚ظٹط§ط¯ط© ط§ظ„طھظ‚ظ†ظٹط© ط®ظ„ط§ظ„ 18 ط´ظ‡ط±ط§ظ‹ â€” ظٹط­طھط§ط¬ طھط·ظˆظٹط± ظ‚ظٹط§ط¯ظٹ ظ…ظƒط«ظپ',
    unit_id: '22222222-2222-2222-2222-222222222223',
  },
  {
    // ط§ظ„ظ†ظ…ظˆط°ط¬ ط§ظ„ط±ط§ط¨ط¹: ظ‚ط§ط¦ط¯ ط¥ظ†ط³ط§ظ†ظٹ
    id: 'demo-cand-0004-0000-0000-000000000004',
    userId: 'demo-user-0004-0000-0000-000000000004',
    name: 'ظ‡ظ†ط¯ ط¨ظ†طھ ط¹ظ…ط± ط§ظ„ط¹طھظٹط¨ظٹ',
    email: 'hind.otaibi@demo.jadeer.sa',
    job_title: 'ظ…ظ†ط³ظ‚ط© ط¨ط±ط§ظ…ط¬ ط¯ط¹ظ… ط§ظ„ظ…ظˆط¸ظپظٹظ†',
    department: 'ط¥ط¯ط§ط±ط© ط¯ط¹ظ… ط§ظ„ظپط±ظ‚ ظˆط§ظ„ظ…ط³طھظپظٹط¯ظٹظ†',
    years_experience: 8,
    readiness: 'human_leader',
    leadership_type: 'human',
    total_score: 76,
    trust_score: 82,
    axis_scores: { leadership: 78, strategic: 60, performance: 70, innovation: 65, team: 94, technology: 58, integrity: 88 },
    strengths: ['ط±ط¶ط§ ط§ظ„ظپط±ظٹظ‚ ط§ط³طھط«ظ†ط§ط¦ظٹ (94%)', 'ظ‚ط¯ط±ط© ظپط§ط¦ظ‚ط© ط¹ظ„ظ‰ ط¨ظ†ط§ط، ط§ظ„ط«ظ‚ط© ظˆط§ظ„طھظˆط§طµظ„', 'ظ†ط²ط§ظ‡ط© ط¹ط§ظ„ظٹط© ظˆظ…طµط¯ط§ظ‚ظٹط© ظ…ط¤ط³ط³ظٹط©'],
    gaps: ['طھط­طھط§ط¬ طھط·ظˆظٹط± ظپظٹ ط§ظ„ظ…ط¤ط´ط±ط§طھ ظˆط§ظ„ظ†طھط§ط¦ط¬ ط§ظ„ظ‚ط§ط¨ظ„ط© ظ„ظ„ظ‚ظٹط§ط³', 'ط±ظپط¹ ظ…ط³طھظˆظ‰ ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھظ‚ظ†ظٹط©', 'طھط¹ط²ظٹط² ط§ظ„طھظپظƒظٹط± ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹ'],
    development_plan: 'ط¨ط±ظ†ط§ظ…ط¬ ظ‚ظٹط§ط¯ط© ظپط±ظ‚ ط§ظ„ط¯ط¹ظ… + طھط£ظ‡ظٹظ„ ظپظٹ ظ…ط¤ط´ط±ط§طھ ط§ظ„ط£ط¯ط§ط، + ظˆط±ط´ط© طھظ‚ظ†ظٹط© ظ…ط¨ط³ط·ط©',
    recommendation: 'ظ…ظ†ط§ط³ط¨ط© ط¬ط¯ط§ظ‹ ظ„ظ‚ظٹط§ط¯ط© ظپط±ظ‚ ط§ظ„ط¯ط¹ظ… ظˆط§ظ„ظ…ط³طھظپظٹط¯ظٹظ† â€” طھط­طھط§ط¬ طھط·ظˆظٹط± ظپظٹ ط§ظ„ظ…ط¤ط´ط±ط§طھ ظ‚ط¨ظ„ طھظˆط³ظٹط¹ ط§ظ„ظ…ط³ط¤ظˆظ„ظٹط©',
    unit_id: '22222222-2222-2222-2222-222222222224',
  },
  {
    // ط§ظ„ظ†ظ…ظˆط°ط¬ ط§ظ„ط®ط§ظ…ط³: ط£ط¯ط§ط، ط¹ط§ظ„ظچ / ط±ط¶ط§ ظ…ظ†ط®ظپط¶
    id: 'demo-cand-0005-0000-0000-000000000005',
    userId: 'demo-user-0005-0000-0000-000000000005',
    name: 'ظپظ‡ط¯ ط¨ظ† ط®ط§ظ„ط¯ ط§ظ„ظ…ط·ظٹط±ظٹ',
    email: 'fahad.mutairi@demo.jadeer.sa',
    job_title: 'ظ…ط¯ظٹط± ط¨ط±ط§ظ…ط¬ ط§ظ„طھط·ظˆظٹط± ط§ظ„ظ…ط¤ط³ط³ظٹ',
    department: 'ط¥ط¯ط§ط±ط© ط§ظ„ط¬ظˆط¯ط© ظˆط§ظ„ط§ظ…طھط«ط§ظ„',
    years_experience: 11,
    readiness: 'high_performance_low_satisfaction',
    leadership_type: 'operational',
    total_score: 74,
    trust_score: 70,
    axis_scores: { leadership: 78, strategic: 76, performance: 94, innovation: 70, team: 48, technology: 72, integrity: 80 },
    strengths: ['ط£ط¯ط§ط، ط¥ظ†ط¬ط§ط²ظٹ ط§ط³طھط«ظ†ط§ط¦ظٹ (94%)', 'ط§ظ„طھط²ط§ظ… ظ…ط¤ط³ط³ظٹ ط¹ط§ظ„ظچ', 'ط®ط¨ط±ط© ظˆط§ط³ط¹ط© ظپظٹ ط¥ط¯ط§ط±ط© ط§ظ„ط¨ط±ط§ظ…ط¬'],
    gaps: ['ط±ط¶ط§ ط§ظ„ظپط±ظٹظ‚ ظ…ظ†ط®ظپط¶ ط¬ط¯ط§ظ‹ (48%) â€” ط®ط·ط± ط¥ط¯ط§ط±ظٹ', 'ط£ط³ظ„ظˆط¨ ط¥ط¯ط§ط±ط© ظٹط­طھط§ط¬ ظ…ط±ط§ط¬ط¹ط©', 'ط§ظ„طھظˆط§طµظ„ ط§ظ„ط¥ظ†ط³ط§ظ†ظٹ ط¶ط¹ظٹظپ'],
    development_plan: 'ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظ‚ظٹط§ط¯ط© ط§ظ„ط¥ظ†ط³ط§ظ†ظٹط© ظˆط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظٹظ‚ (ط£ظˆظ„ظˆظٹط© ط¹ظ„ظٹط§) + ط¬ظ„ط³ط§طھ طھط·ظˆظٹط± ظ…ط¹ ظ…ط®طھطµ + ط¥ط¹ط§ط¯ط© طھظ‚ظٹظٹظ… ط¨ط¹ط¯ 6 ط£ط´ظ‡ط±',
    recommendation: 'ظ„ط§ ظٹظڈظ†طµط­ ط¨ط§ظ„طھظƒظ„ظٹظپ ط§ظ„ظ‚ظٹط§ط¯ظٹ ط­ط§ظ„ظٹط§ظ‹ ط¨ط³ط¨ط¨ ط§ظ†ط®ظپط§ط¶ ط±ط¶ط§ ط§ظ„ظپط±ظٹظ‚ â€” ظٹظڈط¹ط·ظ‰ ط¨ط±ظ†ط§ظ…ط¬ طھط·ظˆظٹط± ظ…ظƒط«ظپ ط£ظˆظ„ط§ظ‹',
    unit_id: '22222222-2222-2222-2222-222222222225',
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = createServiceClient();
  const results: string[] = [];

  try {
    for (const profile of DEMO_PROFILES) {
      // 1. ط¥ظ†ط´ط§ط، ط§ظ„ظ…ط³طھط®ط¯ظ… ظپظٹ ط¬ط¯ظˆظ„ users ظ…ط¨ط§ط´ط±ط© (ط¨ط¯ظˆظ† auth.users ظ„طھط¬ظ†ط¨ ط§ظ„ظ‚ظٹظˆط¯)
      const { error: userErr } = await service.from('users').upsert({
        id: profile.userId,
        full_name: profile.name,
        email: profile.email,
        job_title: profile.job_title,
        department: profile.department,
        role: 'candidate',
        is_active: true,
        is_demo: true,
      }, { onConflict: 'id' });
      if (userErr) results.push(`â‌Œ User ${profile.name}: ${userErr.message}`);

      // 2. ط§ظ„ط¯ظˆط±
      await service.from('user_roles').upsert({
        user_id: profile.userId,
        role_code: 'candidate',
        is_primary: true,
        is_demo: true,
      }, { onConflict: 'user_id,role_code' }).select();

      // 3. ظ…ظ„ظپ ط§ظ„ظ…ط±ط´ط­
      const { error: profErr } = await service.from('candidate_profiles').upsert({
        id: profile.id,
        user_id: profile.userId,
        years_of_experience: profile.years_experience,
        qualification: 'ظ…ط§ط¬ط³طھظٹط±',
        specialization: profile.department,
        status: 'approved',
        completion_score: 88,
        evaluation_track: 'individual',
        is_demo: true,
      }, { onConflict: 'id' });
      if (profErr) results.push(`â‌Œ Profile ${profile.name}: ${profErr.message}`);

      // 4. ظ…ط¨ط§ط¯ط±طھط§ظ†
      await service.from('initiatives').upsert([
        {
          id: `${profile.id}-init-1`,
          candidate_id: profile.id,
          title: `ظ…ط¨ط§ط¯ط±ط© طھط­ط³ظٹظ† ${profile.department}`,
          description: `ظ…ط¨ط§ط¯ط±ط© ظ„طھط­ط³ظٹظ† ظƒظپط§ط،ط© ${profile.department} ط¨ظ†ط³ط¨ط© 30ظھ ط®ظ„ط§ظ„ 6 ط£ط´ظ‡ط±`,
          impact_level: 'high',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          is_demo: true,
        },
        {
          id: `${profile.id}-init-2`,
          candidate_id: profile.id,
          title: 'ظ…ط¨ط§ط¯ط±ط© ط±ظ‚ظ…ظ†ط© ط§ظ„ط¹ظ…ظ„ظٹط§طھ ط§ظ„ط¯ط§ط®ظ„ظٹط©',
          description: 'ط£طھظ…طھط© 5 ط¹ظ…ظ„ظٹط§طھ ظٹط¯ظˆظٹط© ظˆط±ظپط¹ ط³ط±ط¹ط© ط§ظ„ط¥ظ†ط¬ط§ط² 40ظھ',
          impact_level: 'medium',
          status: 'in_progress',
          start_date: '2024-07-01',
          is_demo: true,
        },
      ], { onConflict: 'id' });

      // 5. ظ…ط¤ط´ط±ط§ ط£ط¯ط§ط،
      await service.from('kpis').upsert([
        {
          id: `${profile.id}-kpi-1`,
          candidate_id: profile.id,
          title: 'ظ†ط³ط¨ط© ط¥ظ†ط¬ط§ط² ط§ظ„ظ…ظ‡ط§ظ… ظپظٹ ط§ظ„ظˆظ‚طھ ط§ظ„ظ…ط­ط¯ط¯',
          current_value: 94,
          target_value: 90,
          unit: 'ظھ',
          period: '2024',
          status: 'achieved',
          is_demo: true,
        },
        {
          id: `${profile.id}-kpi-2`,
          candidate_id: profile.id,
          title: 'ط±ط¶ط§ ط§ظ„ظ…ط³طھظپظٹط¯ظٹظ† ط§ظ„ط¯ط§ط®ظ„ظٹظٹظ†',
          current_value: profile.axis_scores.team,
          target_value: 85,
          unit: 'ظھ',
          period: '2024',
          status: profile.axis_scores.team >= 85 ? 'achieved' : 'in_progress',
          is_demo: true,
        },
      ], { onConflict: 'id' });

      // 6. ط§ظ„ط¨ط·ط§ظ‚ط© ط§ظ„ظ‚ظٹط§ط¯ظٹط©
      const { error: cardErr } = await service.from('leadership_cards').upsert({
        id: `${profile.id}-card`,
        candidate_profile_id: profile.id,
        total_score: profile.total_score,
        trust_score: profile.trust_score,
        readiness_level: profile.readiness,
        leadership_type: profile.leadership_type,
        axis_scores: profile.axis_scores,
        primary_strengths: profile.strengths,
        development_gaps: profile.gaps,
        ai_summary: `${profile.name} â€” ${profile.recommendation}`,
        is_published: true,
        is_demo: true,
      }, { onConflict: 'id' });
      if (cardErr) results.push(`â‌Œ Card ${profile.name}: ${cardErr.message}`);

      // 7. ط®ط·ط© طھط·ظˆظٹط±
      await service.from('development_plans').upsert({
        id: `${profile.id}-plan`,
        candidate_profile_id: profile.id,
        overall_status: 'approved',
        created_by_hr: true,
        notes: profile.development_plan,
        is_demo: true,
      }, { onConflict: 'id' });

      // 8. ط¯ط±ط¬ط© ظ…ظ„ط§ط،ظ…ط© طھظ†ط¸ظٹظ…ظٹط©
      await service.from('position_fit_scores').upsert({
        candidate_profile_id: profile.id,
        organization_unit_id: profile.unit_id,
        fit_score: profile.total_score + 5,
        fit_level: profile.total_score >= 85 ? 'high' : profile.total_score >= 70 ? 'good' : 'conditional',
        confidence_score: profile.trust_score,
        fit_reason: `${profile.strengths[0]} â€” ظ…ظ„ط§ط،ظ…ط© ${profile.readiness === 'ready_now' ? 'ط¹ط§ظ„ظٹط©' : 'ط¬ظٹط¯ط©'} ظ…ط¹ ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظˆط­ط¯ط©`,
        strengths_match_json: profile.strengths,
        gaps_json: profile.gaps,
        ai_summary: profile.recommendation,
        recommended_action: profile.development_plan,
        is_demo: true,
      }, { onConflict: 'candidate_profile_id,organization_unit_id' });

      results.push(`âœ… ${profile.name}`);
    }

    // طھط­ط¯ظٹط« ط¹ظ„ط§ظ…ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط¬ط±ظٹط¨ظٹط©
    await service.from('demo_data_flags').upsert({
      is_demo_active: true,
      last_seeded_at: new Date().toISOString(),
    });

    // طھط³ط¬ظٹظ„ ظپظٹ audit_logs
    await service.from('audit_logs').insert({
      user_id: user.id,
      action: 'demo_data_seeded',
      entity_type: 'demo_data',
      new_values: { profiles: DEMO_PROFILES.length, seeded_at: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }
}
