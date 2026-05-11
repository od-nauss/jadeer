import { FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function AdminPageContentPage() {
  const supabase = createClient();
  const { data: pages } = await supabase
    .from('page_content')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="إدارة محتوى الصفحات"
        description="تعديل محتوى الصفحات العامة (الصفحة الرئيسية، التعريف، لجنة الحوكمة، تواصل معنا)."
        example="يمكنك تحديث نص الرؤية والرسالة، أو تحديث معلومات التواصل دون الحاجة لتعديل الكود."
        icon={FileText}
      />

      <Card>
        {pages && pages.length > 0 ? (
          <div className="space-y-3">
            {pages.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-gold-50 border border-gold-100 rounded-lg hover:border-gold-300 transition"
              >
                <div>
                  <div className="font-medium text-primary-700">{p.title || p.page_key}</div>
                  <div className="text-xs text-darkgray mt-0.5">المفتاح: {p.page_key}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.is_published ? 'sage' : 'gray'}>
                    {p.is_published ? 'منشور' : 'مسودة'}
                  </Badge>
                  <span className="text-xs text-darkgray">
                    تحديث: {new Date(p.updated_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-darkgray text-sm">
            لا توجد صفحات قابلة للتحرير حالياً.
          </div>
        )}
      </Card>
    </div>
  );
}
