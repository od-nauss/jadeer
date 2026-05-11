'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronLeft } from 'lucide-react';

interface Page { slug: string; title: string }

export function ExecCenterMobileNav({ pages }: { pages: Page[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentSlug = pathname.split('/').pop() || 'overview';
  const currentPage = pages.find(p => p.slug === currentSlug);
  const currentIdx = pages.findIndex(p => p.slug === currentSlug);

  // إغلاق عند تغيير الصفحة
  useEffect(() => { setOpen(false); }, [pathname]);

  function navigate(slug: string) {
    router.push(`/executive-center/${slug}`);
    setOpen(false);
  }

  const prev = currentIdx > 0 ? pages[currentIdx - 1] : null;
  const next = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null;

  return (
    <div className="md:hidden flex items-center gap-2">
      {/* أزرار السابق / التالي */}
      <div className="flex items-center gap-1">
        {prev && (
          <button onClick={() => navigate(prev.slug)}
            className="p-1.5 text-white/40 hover:text-gold-300 transition">
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs text-white transition">
          <span className="text-gold-300 text-[10px]">{currentIdx + 1}/{pages.length}</span>
          <span className="max-w-24 truncate">{currentPage?.title || 'القائمة'}</span>
          <Menu className="h-3.5 w-3.5 text-white/50" />
        </button>
        {next && (
          <button onClick={() => navigate(next.slug)}
            className="p-1.5 text-white/40 hover:text-gold-300 transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* القائمة الكاملة */}
      {open && (
        <div className="fixed inset-0 z-50 bg-primary-900/98 backdrop-blur-sm flex flex-col" dir="rtl">
          <div className="flex items-center justify-between p-4 border-b border-gold-500/20">
            <div className="text-lg font-bold text-white">أقسام العرض التنفيذي</div>
            <button onClick={() => setOpen(false)} className="p-2 text-white/60 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-1.5">
              {pages.map((page, idx) => {
                const isCurrent = page.slug === currentSlug;
                return (
                  <button
                    key={page.slug}
                    onClick={() => navigate(page.slug)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${
                      isCurrent
                        ? 'bg-gold-500/20 border border-gold-400/40 text-gold-300'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`text-xs w-6 flex-shrink-0 font-bold ${isCurrent ? 'text-gold-400' : 'text-white/30'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium flex-1">{page.title}</span>
                    {isCurrent && (
                      <span className="text-xs text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-full">الصفحة الحالية</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-gold-500/20 text-center text-xs text-white/30">
            منصة جدير — مركز العرض التنفيذي
          </div>
        </div>
      )}
    </div>
  );
}
