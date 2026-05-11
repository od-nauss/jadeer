import { FileText } from 'lucide-react';
import { PageHeader, Card, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default function AdvisorNotesPage() {
  return (
    <div>
      <PageHeader
        title="ملاحظاتي"
        description="مساحة شخصية لتدوين ملاحظاتك على البطاقات القيادية. تشاركها مع الرئيس بطلبه."
        example="مثلاً: 'المرشح س قوي تشغيلياً لكن أرى أنه قد يستفيد من تجربة في الإدارة الاستراتيجية قبل التكليف الكامل.'"
        icon={FileText}
      />

      <Card>
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="لا توجد ملاحظات بعد"
          description="ابدأ بكتابة ملاحظاتك على البطاقات أثناء المراجعة."
        />
      </Card>
    </div>
  );
}
