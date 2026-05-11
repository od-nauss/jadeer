import { Award, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export default async function CandidateResultPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: card } = await supabase
    .from('leadership_cards')
    .select('*')
    .eq('candidate_profile_id', profile?.id || '')
    .maybeSingle();

  if (!card) {
    return (
      <div>
        <PageHeader
          title="النتيجة والبطاقة القيادية"
          description="ستظهر بطاقتك القيادية هنا بعد اعتماد لجنة الحوكمة."
          icon={<Award className="h-5 w-5" />}
        />

        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gold-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-700 mb-2">بطاقتك ليست جاهزة بعد</h3>
            <p className="text-darkgray text-sm leading-relaxed max-w-md mx-auto">
              ستحصل على بطاقتك القيادية بعد:
              <br />1. إكمال جميع مراحل المسار
              <br />2. اكتمال تقييم 360
              <br />3. اعتماد لجنة الحوكمة
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const level = READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS];
  const strengths = (card.primary_strengths as string[] | null) || [];
  const gaps = (card.development_gaps as string[] | null) || [];

  return (
    <div>
      <PageHeader
        title="بطاقتك القيادية"
        description="هذه نتيجتك المعتمدة من لجنة الحوكمة. تستطيع طلب تظلم إذا كان لديك ملاحظة جوهرية."
        icon={<Award className="h-5 w-5" />}
      />

      <div className="bg-gradient-to-l from-primary-700 to-primary-800 text-white rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{user.full_name}</h2>
            <p className="text-gold-200 text-sm">{user.job_title}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400">{Number(card.total_score).toFixed(0)}%</div>
              <div className="text-xs text-gold-200">الجاهزية</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400">{Number(card.trust_score).toFixed(0)}%</div>
              <div className="text-xs text-gold-200">مستوى الثقة</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gold-500/30">
          {level && (
            <span className={`px-3 py-1 rounded text-sm font-bold ${level.bg} ${level.color}`}>
              {level.label_ar}
            </span>
          )}
        </div>
      </div>

      {card.executive_summary && (
        <Card title="ملخص البطاقة" className="mb-6">
          <p className="text-darkgray leading-loose">{card.executive_summary}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="نقاط قوتك">
          {strengths.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold-600 font-bold">+</span>
                  <span className="text-darkgray">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-darkgray text-center py-3">—</p>
          )}
        </Card>

        <Card title="فرص التطوير">
          {gaps.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-wine font-bold">−</span>
                  <span className="text-darkgray">{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-darkgray text-center py-3">—</p>
          )}
        </Card>
      </div>

      {card.recommendation && (
        <Card title="التوصية" className="mt-5">
          <div className="bg-gold-50 border-r-4 border-gold-500 p-4 rounded-lg">
            <p className="text-darkgray leading-loose">{card.recommendation}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
