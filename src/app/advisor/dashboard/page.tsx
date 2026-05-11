import Link from 'next/link';
import { Eye, Users, FileText, ArrowLeft, ScrollText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, StatCard } from '@/components/ui';

export const dynamic = 'force-dynamic';
export default async function AdvisorDashboard() {
  const supabase = createClient();
  const [cards, hidden, ready] = await Promise.all([
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('leadership_type', 'hidden').eq('is_published', true),
    supabase.from('leadership_cards').select('id', { count: 'exact', head: true }).eq('readiness_level', 'ready_now').eq('is_published', true),
  ]);

  return (
    <div>
      <PageHeader
        title="لوحة المستشار"
        description="عرض البطاقات القيادية المعتمدة. صلاحيتك للقراءة فقط، ولا يمكنك تعديل أي قرار. كل اطلاع يُسجَّل."
        example="استخدم 'الملاحظات' لتدوين تحليلاتك ومشاركتها مع الرئيس عند طلبه."
        icon={Eye}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <StatCard label="بطاقات معتمدة" value={cards.count || 0} icon={FileText} variant="primary" />
        <StatCard label="جاهز الآن" value={ready.count || 0} icon={Users} variant="sage" />
        <StatCard label="قيادات مخفية" value={hidden.count || 0} icon={Eye} variant="gold" />
      </div>

      <Card title="وصول سريع">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { href: '/advisor/candidates', label: 'المرشحون', icon: Users },
            { href: '/advisor/cards', label: 'البطاقات القيادية', icon: FileText },
            { href: '/advisor/reports', label: 'التقارير', icon: ScrollText },
            { href: '/advisor/notes', label: 'ملاحظاتي', icon: FileText },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 bg-white border border-gold-200 rounded-lg hover:bg-gold-50 hover:border-gold-400 transition"
            >
              <item.icon className="h-5 w-5 text-gold-700" />
              <span className="font-medium text-primary-700 flex-1">{item.label}</span>
              <ArrowLeft className="h-4 w-4 text-gold-500" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
