import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UniversityLogo } from '@/components/branding/Logo';

export const dynamic = 'force-dynamic';

const EXEC_PAGES = [
  // المرحلة الأولى — الرؤية
  { slug: 'overview',          title: '١ · نظرة عامة' },
  { slug: 'why',               title: '٢ · لماذا نحتاجها؟' },
  { slug: 'beneficiaries',     title: '٣ · من المستفيد؟' },
  // المرحلة الثانية — المنهجية
  { slug: 'how-it-works',      title: '٤ · كيف تعمل؟' },
  { slug: 'methodology',       title: '٥ · منهجية التقييم' },
  { slug: 'anti-bias',         title: '٦ · منع التحيز' },
  // المرحلة الثالثة — الإثبات
  { slug: 'system-preview',    title: '٧ · لقطات النظام' },
  { slug: 'critical-points',   title: '٨ · النقاط الحرجة' },
  { slug: 'smart-alerts',      title: '٩ · التنبيهات الذكية' },
  { slug: 'organization-fit',  title: '١٠ · الملاءمة التنظيمية' },
  { slug: 'demo-models',       title: '١١ · النماذج التجريبية' },
  // الخاتمة
  { slug: 'urgency',           title: '١٢ · القيمة العاجلة' },
  { slug: 'faq-leadership',    title: '١٣ · أسئلة القيادة' },
  { slug: 'decision',          title: '١٤ · من الفكرة للتنفيذ' },
  { slug: 'export',            title: '١٥ · تصدير العرض' },
];

export default function ExecutiveCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // إيقاف كلمة المرور مؤقتاً: أضف EXEC_CENTER_NO_PASSWORD=true في .env.local
  const bypassEnabled = process.env.EXEC_CENTER_NO_PASSWORD === 'true';

  if (!bypassEnabled) {
    const cookieStore = cookies();
    const access = cookieStore.get('executive_center_access');
    if (!access || access.value !== 'granted') {
      redirect('/exec-access');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
      <nav className="sticky top-0 z-40 bg-primary-900/95 backdrop-blur-sm border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/executive-center/overview" className="flex items-center gap-3">
              <UniversityLogo size="sm" />
              <div className="border-r border-gold-500/30 pr-3 hidden md:block">
                <div className="text-lg font-bold text-white">
                  مركز العرض <span className="text-gold-400">التنفيذي</span>
                </div>
              </div>
            </Link>
            <Link href="/" className="text-sm text-white/70 hover:text-gold-300 flex items-center gap-1 transition">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">الموقع الرئيسي</span>
            </Link>
          </div>
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex items-center gap-1 min-w-max">
              {EXEC_PAGES.map((page) => (
                <Link
                  key={page.slug}
                  href={`/executive-center/${page.slug}`}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-gold-300 hover:bg-white/5 rounded-md whitespace-nowrap transition"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
      <footer className="border-t border-gold-500/20 mt-16 py-8 text-center text-sm text-white/50">
        © 2026 جامعة نايف العربية للعلوم الأمنية - منصة جدير
      </footer>
    </div>
  );
}
