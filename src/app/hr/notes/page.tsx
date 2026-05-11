import { FileText } from 'lucide-react';
import { PageHeader, Card, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default function HRNotesPage() {
  return (
    <div>
      <PageHeader
        title="ملاحظات الموارد البشرية"
        description="مساحة للموارد البشرية لتدوين ملاحظاتها على المرشحين، احتياجات التدريب، الأنماط التي ترصدها."
        example="مثلاً: 'لاحظنا أن إدارة العمليات تحتاج برنامج تطوير في 'القيادة الناعمة' لأن 5 من 8 مرشحين لديهم نفس الفجوة.'"
        icon={FileText}
      />

      <Card>
        <EmptyState icon={FileText} title="لا توجد ملاحظات" description="ابدأ بتدوين ملاحظاتك المؤسسية." />
      </Card>
    </div>
  );
}
