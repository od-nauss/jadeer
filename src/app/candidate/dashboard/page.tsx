import Link from 'next/link';
import {
  User, Briefcase, Activity, ClipboardCheck, Users, Award, Target,
  CheckCircle2, Circle, ArrowLeft, Sparkles, Brain, AlertCircle, Bell,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card } from '@/components/ui';
import { analyzeConsistency } from '@/lib/ai/analyzer';

export const dynamic = 'force-dynamic';

const STAGE_STATUS_MAP: Record<string, string> = {
  new: 'جديد', in_progress: 'قيد الاستكمال',
  awaiting_evaluators: 'بانتظار اعتماد المقيمين',
  awaiting_360: 'بانتظار تقييم 360',
  under_governance_review: 'قيد مراجعة لجنة الحوكمة',
  approved: 'معتمد', returned_for_completion: 'معاد للاستكمال',
};

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-gold-100 text-gold-800 border-gold-300',
  in_progress: 'bg-blue-50 text-steelblue border-blue-200',
  awaiting_evaluators: 'bg-amber-50 text-amber-800 border-amber-200',
  awaiting_360: 'bg-purple-50 text-purple-700 border-purple-200',
  under_governance_review: 'bg-primary-50 text-primary-700 border-primary-200',
  approved: 'bg-green-50 text-sage border-green-200',
  returned_for_completion: 'bg-rose-50 text-wine border-rose-200',
};

export default async function CandidateDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();

  // 1) جلب الملف أولاً لمعرفة الـ profile_id
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id, status, completion_score')
    .eq('user_id', user.id)
    .maybeSingle();

  const pid = profile?.id || '';

  // 2) جلب جميع البيانات باستخدام الـ profile_id الصحيح
  const [
    { data: iniList },
    { data: kpiList },
    { data: resultList },
    { data: nomineeList },
    { data: cardData },
    { data: notifList },
  ] = await Promise.all([
    pid
      ? supabase.from('initiatives').select('id, evidence, achieved_impact').eq('candidate_profile_id', pid)
      : Promise.resolve({ data: [] }),
    pid
      ? supabase.from('kpis').select('id, target_value, actual_value').eq('candidate_profile_id', pid)
      : Promise.resolve({ data: [] }),
    pid
      ? supabase.from('assessment_results').select('id, status, score').eq('candidate_profile_id', pid)
      : Promise.resolve({ data: [] }),
    pid
      ? supabase.from('evaluator_nominees').select('id, status').eq('candidate_profile_id', pid)
      : Promise.resolve({ data: [] }),
    pid
      ? supabase.from('leadership_cards').select('id, total_score, readiness_level, is_published').eq('candidate_profile_id', pid).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('notifications')
      .select('id, title, body, priority, created_at')
      .or(`target_role.eq.candidate,target_role.is.null`)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const initiatives = iniList || [];
  const kpis = kpiList || [];
  const results = resultList || [];
  const nominees = nomineeList || [];

  const completedAssessments = results.filter(r => r.status === 'completed').length;
  // مؤشر الشواهد: المبادرات التي لها achieved_impact أو evidence
  const iniWithEvidence = initiatives.filter(i => i.evidence || i.achieved_impact).length;
  // مؤشر المؤشرات: التي لها قيمة فعلية
  const kpisWithTarget = kpis.filter(k => k.target_value && k.actual_value).length;

  // تحليل الاتساق
  const consistency = analyzeConsistency({
    initiativeCount: initiatives.length,
    kpiCount: kpis.length,
    initiativesWithEvidence: iniWithEvidence,
    kpisWithTarget,
    assessmentCompleted: completedAssessments,
    profileScore: profile?.completion_score || 0,
  });

  // مراحل المسار
  const STAGES = [
    {
      name: 'الملف القيادي', href: '/candidate/profile', icon: User, required: true,
      done: !!(profile?.completion_score && profile.completion_score >= 40),
      partial: !!(profile?.completion_score && profile.completion_score > 0),
      hint: profile?.completion_score ? `اكتمال ${profile.completion_score}%` : 'لم يُبدأ بعد',
    },
    {
      name: 'المبادرات والإنجازات', href: '/candidate/initiatives', icon: Briefcase, required: true,
      done: initiatives.length >= 2,
      partial: initiatives.length > 0,
      hint: `${initiatives.length} مبادرة — الحد الأدنى 2`,
    },
    {
      name: 'مؤشرات الأداء', href: '/candidate/kpis', icon: Activity, required: true,
      done: kpis.length >= 2,
      partial: kpis.length > 0,
      hint: `${kpis.length} مؤشر — الحد الأدنى 2`,
    },
    {
      name: 'الاختبارات الذكية', href: '/candidate/assessments', icon: ClipboardCheck, required: true,
      done: completedAssessments >= 4,
      partial: completedAssessments > 0,
      hint: `${completedAssessments} من 8 — الحد الأدنى 4`,
    },
    {
      name: 'دائرة الثقة القيادية (15 مقيماً)', href: '/candidate/360', icon: Users, required: true,
      done: nominees.length >= 15,
      partial: nominees.length > 0,
      hint: `${nominees.length} من 15 مقيماً`,
    },
    {
      name: 'النتيجة والبطاقة القيادية', href: '/candidate/result', icon: Award, required: false,
      done: !!cardData?.is_published,
      partial: false,
      hint: cardData?.is_published ? `نتيجة: ${Number(cardData.total_score).toFixed(0)}%` : 'بانتظار اعتماد لجنة الحوكمة',
    },
    {
      name: 'خطة التطوير الفردية', href: '/candidate/development-plan', icon: Target, required: false,
      done: false, partial: false,
      hint: 'تُولَّد تلقائياً بعد اعتماد البطاقة',
    },
  ];

  const completedStages = STAGES.filter(s => s.done).length;
  const overallProgress = Math.round((completedStages / STAGES.length) * 100);
  const profileStatus = profile?.status || 'new';
  const canSubmit = initiatives.length >= 2 && kpis.length >= 2 && completedAssessments >= 4 && nominees.length >= 15 && (profile?.completion_score || 0) >= 40;

  return (
    <div dir="rtl">
      <PageHeader
        title={`مرحباً ${user.full_name?.split(' ')[0] || ''}`}
        description="هذه رحلتك في مسار الجاهزية القيادية. أكمل المراحل بترتيبها للحصول على بطاقتك القيادية المعتمدة."
        example="ابدأ بإكمال الملف القيادي، ثم المبادرات والمؤشرات، ثم الاختبارات، ثم اقترح دائرة الثقة."
        icon={<Sparkles className="h-5 w-5" />}
      />

      {/* حالة الملف */}
      {profile && (
        <div className={`mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${STATUS_COLOR[profileStatus] || 'bg-gold-50 text-gold-800 border-gold-200'}`}>
          <Circle className="h-3.5 w-3.5 fill-current" />
          {STAGE_STATUS_MAP[profileStatus] || profileStatus}
        </div>
      )}

      {/* شريط التقدم الدائري */}
      <Card className="mb-6 bg-gradient-to-br from-primary-50 to-white border-primary-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg className="h-24 w-24 -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="#E0D2B5" strokeWidth="9" fill="none" />
              <circle cx="48" cy="48" r="38" stroke="#2D5A8B" strokeWidth="9" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress * 2.39} 239`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700">{overallProgress}%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary-700">تقدمك في المسار</h3>
            <p className="text-sm text-darkgray">{completedStages} من {STAGES.length} مراحل مكتملة</p>
            {canSubmit && (
              <div className="mt-2 flex items-center gap-2 text-sm text-sage font-medium">
                <CheckCircle2 className="h-4 w-4" />
                ملفك جاهز للإرسال للجنة الحوكمة
              </div>
            )}
            {!pid && (
              <Link href="/candidate/profile" className="mt-2 inline-block text-sm text-primary-600 hover:underline font-medium">
                ابدأ بإنشاء ملفك القيادي ←
              </Link>
            )}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* مراحل المسار */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-primary-700 mb-3">مراحل المسار</h3>
          <div className="space-y-2">
            {STAGES.map((stage, i) => (
              <Link key={i} href={stage.href}
                className={`flex items-center gap-4 p-4 rounded-xl border transition group ${
                  stage.done ? 'bg-sage/5 border-sage/30 hover:bg-sage/10' :
                  stage.partial ? 'bg-gold-50 border-gold-200 hover:bg-gold-100' :
                  'bg-white border-gold-100 hover:bg-gold-50'
                }`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  stage.done ? 'bg-sage text-white' :
                  stage.partial ? 'bg-gold-200 text-gold-700' :
                  'bg-gold-100 text-gold-500'
                }`}>
                  {stage.done ? <CheckCircle2 className="h-5 w-5" /> : <stage.icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-primary-700">{i + 1}. {stage.name}</div>
                    {stage.required && !stage.done && (
                      <span className="text-xs bg-rose-50 text-wine border border-rose-200 px-1.5 py-0.5 rounded">مطلوب</span>
                    )}
                  </div>
                  <div className="text-xs text-darkgray mt-0.5">{stage.hint}</div>
                </div>
                <ArrowLeft className="h-4 w-4 text-gold-500 group-hover:text-primary-700 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* الجانب الأيمن */}
        <div className="space-y-5">
          {/* تحليل اتساق الملف */}
          {pid && (initiatives.length > 0 || kpis.length > 0) && (
            <div className="institutional-card">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-gold-600" />
                <h4 className="font-bold text-primary-700 text-sm">تحليل اتساق الملف</h4>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'الاتساق', val: consistency.consistency_score.score, color: consistency.consistency_score.color },
                  { label: 'قابلية التحقق', val: consistency.verifiability_score.score, color: 'primary' },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-darkgray">{label}</span>
                      <span className="font-bold text-primary-700">{val}%</span>
                    </div>
                    <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        color === 'sage' ? 'bg-sage' : color === 'gold' ? 'bg-gold-500' : color === 'wine' ? 'bg-wine' : 'bg-primary-600'
                      }`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {consistency.flags.slice(0, 2).map((f, i) => (
                <div key={i} className={`mt-2 flex items-start gap-2 p-2 rounded-lg text-xs ${
                  f.type === 'success' ? 'bg-green-50 text-sage' :
                  f.type === 'error' ? 'bg-rose-50 text-wine' : 'bg-amber-50 text-amber-800'
                }`}>
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  {f.text}
                </div>
              ))}
            </div>
          )}

          {/* المهام المطلوبة */}
          <div className="institutional-card">
            <h4 className="font-bold text-primary-700 text-sm mb-3">قائمة المهام</h4>
            <div className="space-y-2">
              {[
                { done: (profile?.completion_score || 0) >= 40, text: 'إكمال البيانات الأساسية', href: '/candidate/profile' },
                { done: initiatives.length >= 2, text: 'إضافة مبادرتين على الأقل', href: '/candidate/initiatives' },
                { done: kpis.length >= 2, text: 'إضافة مؤشرين على الأقل', href: '/candidate/kpis' },
                { done: completedAssessments >= 4, text: 'إكمال 4 اختبارات على الأقل', href: '/candidate/assessments' },
                { done: nominees.length >= 15, text: 'اقتراح 15 مقيماً', href: '/candidate/360' },
              ].map((task, i) => (
                <Link key={i} href={task.href}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg hover:bg-gold-50 transition-colors ${task.done ? 'text-sage' : 'text-darkgray'}`}>
                  {task.done
                    ? <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0" />
                    : <Circle className="h-4 w-4 flex-shrink-0" />}
                  <span className={task.done ? 'line-through opacity-60' : ''}>{task.text}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* الإشعارات */}
          {notifList && notifList.length > 0 && (
            <div className="institutional-card">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-gold-600" />
                <h4 className="font-bold text-primary-700 text-sm">أحدث الإشعارات</h4>
              </div>
              <div className="space-y-2">
                {notifList.map(n => (
                  <div key={n.id} className="p-2.5 bg-gold-50 border border-gold-100 rounded-lg">
                    <div className="text-xs font-medium text-primary-700">{n.title}</div>
                    {n.body && <div className="text-xs text-darkgray mt-0.5 leading-relaxed line-clamp-2">{n.body}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
