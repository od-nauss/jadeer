import { Briefcase, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function CandidateInitiativesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: initiatives } = await supabase
    .from('initiatives')
    .select('*')
    .eq('candidate_profile_id', profile?.id || '')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="المبادرات والإنجازات"
        description="وثّق المبادرات التي قدتها أو شاركت فيها. كل مبادرة تحتاج: العنوان، دورك الفعلي، الأثر، الشواهد، والشهود."
        example="مثلاً: 'مشروع رقمنة الإجراءات' - دوري: قائد المشروع - الأثر: تقليل الوقت 40% - الشواهد: تقرير المشروع - الشهود: مدير الإدارة + 3 من الفريق."
        icon={<Briefcase className="h-5 w-5" />}
      />

      <div className="mb-4">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold">
          <Plus className="h-4 w-4" />
          إضافة مبادرة
        </button>
      </div>

      {initiatives && initiatives.length > 0 ? (
        <div className="space-y-3">
          {initiatives.map((ini) => (
            <Card key={ini.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-primary-700">{ini.title}</h3>
                <Badge variant={ini.status === 'verified' ? 'sage' : 'gold'}>
                  {ini.status === 'verified' ? 'مُحقَّق' : 'بانتظار التحقق'}
                </Badge>
              </div>
              {ini.role && (
                <div className="text-sm text-darkgray mb-2">
                  <strong className="text-primary-700">دوري:</strong> {ini.role}
                </div>
              )}
              {ini.impact && (
                <div className="text-sm text-darkgray mb-2">
                  <strong className="text-primary-700">الأثر:</strong> {ini.impact}
                </div>
              )}
              {ini.witnesses && (
                <div className="text-xs text-darkgray pt-2 border-t border-gold-100">
                  الشهود: {ini.witnesses}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title="لا توجد مبادرات بعد"
          description="ابدأ بإضافة أول مبادرة قدتها أو شاركت فيها."
        />
      )}
    </div>
  );
}
