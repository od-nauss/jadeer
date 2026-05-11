import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UniversityLogo } from '@/components/branding/Logo';

export const dynamic = 'force-dynamic';

const EXEC_PAGES = [
  { slug: 'overview',          title: 'نظرة عامة' },
  { slug: 'why',               title: 'لماذا نحتاج المنصة' },
  { slug: 'beneficiaries',     title: 'المستفيدون' },
  { slug: 'how-it-works',      title: 'كيف تعمل المنصة' },
  { slug: 'methodology',       title: 'منهجية التقييم' },
  { slug: 'anti-bias',         title: 'منع التحيز' },
  { slug: 'system-preview',    title: 'لقطات من النظام' },
  { slug: 'critical-points',   title: 'النقاط الحرجة' },
  { slug: 'faq-leadership',    title: 'الأسئلة المتوقعة' },
  { slug: 'urgency',           title: 'القيمة العاجلة' },
  { slug: 'smart-alerts',      title: 'الإشعارات الذكية' },
  { slug: 'organization-fit',  title: 'الملاءمة التنظيمية' },
  { slug: 'demo-models',       title: 'النماذج التجريبية' },
  { slug: 'decision',          title: 'القرار المطلوب' },
  { slug: 'export',            title: 'تصدير العرض' },
];

export default function ExecutiveCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read current pathname injected by middleware
  const headersList = headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // Don't apply auth check to the login page itself
  const isLoginPage = pathname === '/executive-center/login';

  if (!isLoginPage) {
    const cookieStore = cookies();
    const access = cookieStore.get('executive_center_access');
    if (!access || access.value !== 'granted') {
      redirect('/executive-center/login');
    }
  }

  // Login page renders without nav wrapper
  if (isLoginPage) {
    return <>{children}</>;
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
