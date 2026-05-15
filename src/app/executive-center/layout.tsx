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
  { slug: 'faq-leadership',   title: 'أسئلة وأجوبة متوقعة' },
  { slug: 'decision',         title: 'من الفكرة للتنفيذ' },
  { slug: 'export',           title: 'تصدير العرض' },
];

export default function ExecutiveCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white" dir="rtl">
      {/* شريط التنقل */}
      <nav className="sticky top-0 z-40 bg-primary-900/98 backdrop-blur-sm border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* الشعار */}
            <Link href="/executive-center/overview" className="flex items-center gap-2 flex-shrink-0">
              <UniversityLogo size="sm" />
              <div className="border-r border-gold-500/30 pr-2 hidden sm:block">
                <div className="text-sm font-bold text-white leading-tight">
                  مركز العرض <span className="text-gold-400">التنفيذي</span>
                </div>
              </div>
            </Link>

            {/* Tabs - Desktop */}
            <div className="hidden md:flex flex-1 overflow-x-auto mx-4 scrollbar-hide">
              <div className="flex items-center gap-0.5 min-w-max">
                {EXEC_PAGES.map((page, idx) => (
                  <Link
                    key={page.slug}
                    href={`/executive-center/${page.slug}`}
                    className="px-2 py-1.5 text-[11px] text-white/55 hover:text-gold-300 hover:bg-white/5 rounded-md whitespace-nowrap transition flex items-center gap-0.5"
                  >
                    <span className="text-white/25 text-[9px]">{idx + 1}.</span>
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Nav + رابط الرئيسية */}
            <div className="flex items-center gap-2">
              <ExecCenterMobileNav pages={EXEC_PAGES} />
              <Link href="/" className="hidden sm:block text-xs text-white/40 hover:text-gold-300 transition">
                ← رئيسية
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* المحتوى — padding إضافي في الجوال لتجنب تغطية Bottom Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-24 md:py-12">
        {children}
      </div>

      {/* Bottom Bar — للجوال فقط */}
      <div className="fixed bottom-0 inset-x-0 md:hidden z-30 bg-primary-900/95 backdrop-blur-sm border-t border-gold-500/20 safe-area-inset-bottom">
        <div className="flex items-center justify-between px-4 py-2.5 text-xs">
          <Link href="/" className="text-gold-400 font-medium">← رئيسية</Link>
          <span className="text-white/30 text-[10px]">مركز العرض التنفيذي</span>
          <Link href="/executive-center/decision" className="text-gold-400 font-medium">القرار →</Link>
        </div>
      </div>

      <footer className="hidden md:block border-t border-gold-500/20 mt-8 py-6 text-center text-sm text-white/30">
        © 2026 جامعة نايف العربية للعلوم الأمنية — منصة جدير
      </footer>
    </div>
  );
}
