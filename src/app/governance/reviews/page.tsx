import Link from 'next/link';
import { FileSearch, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function GovernanceReviewsPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('id, status, completion_score, created_at, users(full_name, job_title, department)')
    .in('status', ['submitted', 'under_review'])
    .order('created_at', { ascending: true });

  return (
    <div>
      <PageHeader
        title="الملفات بانتظار المراجعة"
        description="جميع الملفات المرسلة من المرشحين والتي تنتظر مراجعة لجنة الحوكمة. الترتيب حسب الأقدمية لضمان العدالة في الانتظار."
        example="انقر على أي ملف لرؤية كل بياناته (الملف، المبادرات، المؤشرات، الاختبارات، 360) واتخاذ قرار."
        icon={<FileSearch className="h-5 w-5" />}
      />

      {profiles && profiles.length > 0 ? (
        <Card>
          <div className="space-y-2">
            {profiles.map((p) => {
              type Row = { users: { full_name: string; job_title?: string; department?: string } };
              const r = p as unknown as Row;
              const user = r.users;
              if (!user) return null;
              return (
                <Link
                  key={p.id}
                  href={`/governance/reviews/${p.id}`}
                  className="flex items-center gap-3 p-4 bg-gold-50 hover:bg-gold-100 border border-gold-200 rounded-lg transition"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary-700">{user.full_name}</div>
                    <div className="text-xs text-darkgray">
                      {user.job_title} {user.department && `· ${user.department}`}
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="text-sm font-bold text-gold-700">
                      اكتمال {p.completion_score || 0}%
                    </div>
                    <Badge variant={p.status === 'submitted' ? 'gold' : 'primary'}>
                      {p.status === 'submitted' ? 'مرسل' : 'قيد المراجعة'}
                    </Badge>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gold-600" />
                </Link>
              );
            })}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<FileSearch className="h-5 w-5" />}
          title="لا توجد ملفات بانتظار المراجعة"
          description="ستظهر هنا الملفات فور إرسالها من المرشحين."
        />
      )}
    </div>
  );
}
