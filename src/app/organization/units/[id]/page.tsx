import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Users, Map, AlertTriangle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { READINESS_LEVELS } from '@/lib/utils';

export default async function OrganizationUnitPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: unit } = await supabase
    .from('organization_units')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!unit) notFound();

  // جلب الملاءمات للوحدة
  const { data: fitScores } = await supabase
    .from('position_fit_scores')
    .select('*, candidate_profiles(id, users(full_name, job_title))')
    .eq('organization_unit_id', params.id)
    .order('fit_score', { ascending: false });

  return (
    <div>
      <Link href="/organization/map" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowRight className="h-4 w-4" />
        العودة لخريطة الكفاءات
      </Link>

      <div className="institutional-card p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-primary-700">{unit.name}</h1>
            <Badge variant="primary" className="mt-2">{unit.unit_type}</Badge>
          </div>
          <div className="flex gap-2">
            {unit.has_vacancy && <Badge variant="gold">شاغر</Badge>}
            {unit.is_critical && <Badge variant="wine">حرجة</Badge>}
          </div>
        </div>
        {unit.description && <p className="text-darkgray text-sm leading-relaxed">{unit.description}</p>}
      </div>

      <Card title="الكفاءات الأكثر ملاءمة" subtitle="ترتيب المرشحين حسب نسبة الملاءمة لهذه الوحدة">
        {fitScores && fitScores.length > 0 ? (
          <div className="space-y-2">
            {fitScores.map((fs) => {
              type Row = { candidate_profiles: { id: string; users: { full_name: string; job_title?: string } } };
              const r = fs as unknown as Row;
              return (
                <div key={fs.id} className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {r.candidate_profiles?.users?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary-700">{r.candidate_profiles?.users?.full_name}</div>
                    <div className="text-xs text-darkgray">{r.candidate_profiles?.users?.job_title}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-gold-700">{Number(fs.fit_score).toFixed(0)}%</div>
                    <div className="text-[10px] text-darkgray">ملاءمة</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-darkgray text-sm">
            لم يتم حساب ملاءمات للمرشحين مع هذه الوحدة بعد.
          </div>
        )}
      </Card>
    </div>
  );
}
