import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { UniversityLogo } from '@/components/branding/Logo';
import { ExecCenterMobileNav } from './ExecCenterMobileNav';

export const dynamic = 'force-dynamic';

const EXEC_PAGES = [
  { slug: 'overview',         title: 'نظرة عامة' },
  { slug: 'why',              title: 'لماذا نحتاجها؟' },
  { slug: 'beneficiaries',    title: 'من المستفيد؟' },
  { slug: 'how-it-works',     title: 'كيف تعمل؟' },
  { slug: 'methodology',      title: 'منهجية التقييم' },
  { slug: 'anti-bias',        title: 'منع التحيز' },
  { slug: 'system-preview',   title: 'لقطات النظام' },
  { slug: 'critical-points',  title: 'النقاط الحرجة' },
  { slug: 'smart-alerts',     title: 'التنبيهات الذكية' },
  { slug: 'organization-fit', title: 'الملاءمة التنظيمية' },
  { slug: 'demo-models',      title: 'النماذج التجريبية' },
  { slug: 'urgency',          title: 'القيمة العاجلة' },
  { slug: 'faq-leadership',   title: 'أسئلة القيادة' },
  { slug: 'decision',         title: 'من الفكرة للتنفيذ' },
  { slug: 'export',           title: 'تصدير العرض' },
];

export default function ExecutiveCenterLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();

  // فحص bypass (cookie من admin أو env var)
  const bypassCookie = cookieStore.get('exec_center_bypass');
  const bypass =
    bypassCookie?.value === 'granted' ||
    process.env.EXEC_CENTER_NO_PASSWORD === 'true';

  // فحص cookie دخول العرض التنفيذي
  if (!bypass) {
    const access = cookieStore.get('executive_center_access');
    if (!access || access.value !== 'granted') {
      redirect('/exec-access');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white" dir="rtl">

      {/* شريط التنقل — سطح المكتب */}
      <nav className="sticky top-0 z-40 bg-primary-900/98 backdrop-blur-sm border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* الهيدر */}
          <div className="flex items-center justify-between h-16">
            <Link href="/executive-center/overview" className="flex items-center gap-3 flex-shrink-0">
              <UniversityLogo size="sm" />
              <div className="border-r border-gold-500/30 pr-3 hidden sm:block">
                <div className="text-base font-bold text-white leading-tight">
                  مركز العرض <span className="text-gold-400">التنفيذي</span>
                </div>
                <div className="text-xs text-white/40">منصة جدير</div>
              </div>
            </Link>

            {/* Mobile: dropdown nav */}
            <div className="flex items-center gap-3">
              <ExecCenterMobileNav pages={EXEC_PAGES} />
              <Link href="/" className="text-xs text-white/50 hover:text-gold-300 transition hidden sm:block">
                ← الموقع الرئيسي
              </Link>
            </div>
          </div>

          {/* Desktop: tabs */}
          <div className="hidden md:block overflow-x-auto pb-1.5 -mx-4 px-4 scrollbar-hide">
            <div className="flex items-center gap-0.5 min-w-max">
              {EXEC_PAGES.map((page, idx) => (
                <Link
                  key={page.slug}
                  href={`/executive-center/${page.slug}`}
                  className="px-2.5 py-1.5 text-xs text-white/55 hover:text-gold-300 hover:bg-white/5 rounded-md whitespace-nowrap transition flex items-center gap-1"
                >
                  <span className="text-white/25 text-[10px]">{idx + 1}</span>
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </div>

      {/* Mobile: bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-primary-900/95 border-t border-gold-500/20 px-4 py-2 flex items-center justify-between text-xs text-white/40 z-40">
        <Link href="/" className="text-gold-400">← الرئيسية</Link>
        <span>منصة جدير — مركز العرض التنفيذي</span>
        <Link href="/executive-center/decision" className="text-gold-400">القرار →</Link>
      </div>

      <footer className="border-t border-gold-500/20 mt-16 pb-16 md:pb-8 py-8 text-center text-sm text-white/40">
        © 2026 جامعة نايف العربية للعلوم الأمنية — منصة جدير
      </footer>
    </div>
  );
}
