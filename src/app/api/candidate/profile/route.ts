import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { analyzeProfile } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const supabase = createServiceClient();

    // الحصول على أو إنشاء الملف
    let { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id, completion_score')
      .eq('user_id', user.id)
      .maybeSingle();

    const profileData = {
      user_id: user.id,
      // years_of_experience عمود INTEGER — نتأكد من إرسال رقم صحيح
      years_of_experience: body.years_of_experience !== '' && body.years_of_experience !== null
        ? Number(body.years_of_experience) || null
        : null,
      qualification: body.qualification || null,
      specialization: body.specialization || null,
      educational_institution: body.educational_institution || null,
      graduation_year: body.graduation_year ? Number(body.graduation_year) : null,
      professional_certifications: body.professional_certifications || null,
      internal_experience: body.internal_experience || null,
      external_experience: body.external_experience || null,
      current_tasks: body.current_tasks || null,
      past_leadership_tasks: body.past_leadership_tasks || null,
      team_participations: body.team_participations || null,
      committee_participations: body.committee_participations || null,
      led_projects: body.led_projects || null,
      leadership_skills: body.leadership_skills || [],
      technical_skills: body.technical_skills || [],
      analytical_skills: body.analytical_skills || [],
      communication_skills: body.communication_skills || [],
      team_management_skills: body.team_management_skills || [],
      crisis_management_skills: body.crisis_management_skills || [],
      planning_skills: body.planning_skills || [],
      decision_making_skills: body.decision_making_skills || [],
      systems_used: body.systems_used || [],
      analysis_tools: body.analysis_tools || [],
      ai_tools: body.ai_tools || [],
      dashboard_tools: body.dashboard_tools || [],
      pm_tools: body.pm_tools || [],
      automation_tools: body.automation_tools || [],
    };

    // حساب درجة الاكتمال — تشمل الحقول الأساسية من جدول users
    const basicFields = {
      full_name: body.full_name || null,
      job_title: body.job_title || null,
      department: body.department || null,
    };
    const allFields = { ...basicFields, ...profileData };
    const filled = Object.values(allFields).filter(v =>
      v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
    ).length;
    const total = Object.keys(allFields).length;
    const completion = Math.round((filled / total) * 100);

    if (!profile) {
      const { data: newProfile, error } = await supabase
        .from('candidate_profiles')
        .insert({ ...profileData, completion_score: completion, status: 'in_progress' })
        .select('id')
        .single();
      if (error) throw error;
      profile = { id: (newProfile as any)?.id, completion_score: completion };
    } else {
      await supabase
        .from('candidate_profiles')
        .update({ ...profileData, completion_score: completion })
        .eq('id', profile.id);
    }

    // تحديث الاسم في جدول users أيضاً
    if (body.full_name || body.job_title || body.department || body.employee_number) {
      await supabase.from('users').update({
        full_name: body.full_name || user.full_name,
        job_title: body.job_title || null,
        department: body.department || null,
        employee_number: body.employee_number || null,
      }).eq('id', user.id);
    }

    // التحليل الذكي
    const analysis = analyzeProfile({ ...profileData, full_name: body.full_name });

    // حفظ التحليل
    await supabase.from('ai_analysis_logs').upsert({
      candidate_profile_id: profile!.id,
      source_type: 'profile',
      source_id: profile!.id,
      analysis_summary: `اكتمال: ${completion}% | الوضوح: ${analysis.clarity.score} | قابلية التحقق: ${analysis.verifiability.score}`,
      scores_json: {
        completeness: analysis.completeness.score,
        clarity: analysis.clarity.score,
        verifiability: analysis.verifiability.score,
        leadership_relevance: analysis.leadership_relevance.score,
        overall: analysis.overall.score,
      },
      recommendations_json: analysis.feedback,
      confidence_score: analysis.overall.score,
      ai_provider: 'rules_engine',
      ai_model: 'jadeer_v1',
    }, { onConflict: 'candidate_profile_id,source_type' });

    // سجل التدقيق
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: user.primaryRole,
      operation_type: 'candidate_profile_saved',
      description: `حفظ الملف القيادي - اكتمال ${completion}%`,
      sensitivity: 'normal',
    });

    return NextResponse.json({ success: true, profileId: profile!.id, completion, analysis });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
