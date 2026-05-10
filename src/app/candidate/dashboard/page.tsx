import Link from 'next/link';
import {
  User,
  Briefcase,
  Activity,
  ClipboardCheck,
  Users,
  Award,
  Target,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function CandidateDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();

  // ملف المرشح
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // البطاقة (إن وجدت)
  const { data: card } = await supabase
    .from('leadership_cards')
    .select('id, total_score, readiness_level, is_published')
    .eq('candidate_profile_id', profile?.id || '')
    .maybeSingle();

  // عدد المبادرات والمؤشرات
  const [initiatives, kpis, assessments, evaluators] = await Promise.all([
    supabase.from('initiatives').select('id', { count: 'exact', head: true }).eq('candidate_profile_id', profile?.id || ''),
    supabase.from('kpis').select('id', { count: 'exact', head: true }).eq('candidate_profile_id', profile?.id || ''),
    supabase.from('assessment_results').select('id', { count: 'exact', head: true }).eq('candidate_profile_id', profile?.id || ''),
    supabase.from('evaluator_nominees').select('id', { count: 'exact', head: true }).eq('candidate_profile_id', profile?.id || ''),
  ]);

  const STAGES = [
    { name: 'الملف القيادي', done: !!profile?.full_name && profile.completion_score >= 30, href: '/candidate/profile', icon: User },
    { name: 'المبادرات والإنجازات', done: (initiatives.count || 0) >= 1, href: '/candidate/initiatives', icon: Briefcase },
    { name: 'مؤشرات الأداء', done: (kpis.count || 0) >= 1, href: '/candidate/kpis', icon: Activity },
    { name: 'الاختبارات الذكية', done: (assessments.count || 0) >= 1, href: '/candidate/assessments', icon: ClipboardCheck },
    { name: 'دائرة الثقة (15 مقيماً)', done: (evaluators.count || 0) >= 15, href: '/candidate/360', icon: Users },
    { name: 'النتيجة والبطاقة القيادية', done: !!card?.is_published, href: '/candidate/result', icon: Award },
    { name: 'خطة التطوير الفردية', done: false, href: '/candidate/development-plan', icon: Target },
  ];

  const completedStages = STAGES.filter((s) => s.done).length;
  const overallProgress = Math.round((completedStages / STAGES.length) * 100);

  return (
    <div>
      <PageHeader
        title={`مرحباً ${user.full_name?.split(' ')[0] || ''}`}
        description="هذه رحلتك في مسار الجاهزية القيادية. اكمل المراحل بترتيبها لتحصل على بطاقتك القيادية المعتمدة من لجنة الحوكمة."
        example="ابدأ بإكمال الملف القيادي، ثم انتقل للمبادرات والمؤشرات، فالاختبارات، ثم اقترح دائرة الثقة."
        icon={<Sparkles className="h-5 w-5" />}
      />

      {/* مؤشر التقدم العام */}
      <Card className="mb-6 bg-gradient-to-br from-gold-50 to-white border-gold-300">
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="h-20 w-20 -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#E0D2B5" strokeWidth="8" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#C7B08C"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress * 2.01} 201`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-700">{overallProgress}%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary-700">تقدمك في المسار</h3>
            <p className="text-sm text-darkgray">
              {completedStages} من {STAGES.length} مراحل مكتملة
            </p>
          </div>
        </div>
      </Card>

      {/* المراحل */}
      <h3 className="text-lg font-bold text-primary-700 mb-3">مراحل المسار</h3>
      <div className="space-y-2">
        {STAGES.map((stage, i) => (
          <Link
            key={i}
            href={stage.href}
            className={`flex items-center gap-4 p-4 rounded-lg border transition ${
              stage.done
                ? 'bg-sage/5 border-sage/30 hover:bg-sage/10'
                : 'bg-gold-50 border-gold-200 hover:bg-gold-100'
            }`}
          >
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                stage.done ? 'bg-sage text-white' : 'bg-gold-200 text-gold-700'
              }`}
            >
              {stage.done ? <CheckCircle2 className="h-5 w-5" /> : <stage.icon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-primary-700">
                {i + 1}. {stage.name}
              </div>
              <div className="text-xs text-darkgray">
                {stage.done ? 'مكتملة' : 'لم تبدأ بعد'}
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 text-gold-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
