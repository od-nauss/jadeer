'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Page { slug: string; title: string }

export function ExecCenterMobileNav({ pages }: { pages: Page[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentSlug = pathname.split('/').pop() || 'overview';
  const currentIdx = pages.findIndex(p => p.slug === currentSlug);
  const currentPage = pages[currentIdx] || pages[0];
  const prev = currentIdx > 0 ? pages[currentIdx - 1] : null;
  const next = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null;

  // إغلاق عند تغيير الصفحة
  useEffect(() => { setOpen(false); }, [pathname]);

  // منع تمرير الخلفية عند فتح القائمة
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="md:hidden flex items-center gap-1">
      {/* السابق */}
      {prev ? (
        <Link href={`/executive-center/${prev.slug}`}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : <div className="w-8" />}

      {/* زر القائمة - يعرض الرقم والعنوان */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg transition"
      >
        <span className="text-gold-400 text-xs font-bold">{currentIdx + 1}/{pages.length}</span>
        <span className="text-white text-xs font-medium max-w-[100px] truncate">{currentPage?.title}</span>
        <Menu className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
      </button>

      {/* التالي */}
      {next ? (
        <Link href={`/executive-center/${next.slug}`}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : <div className="w-8" />}

      {/* القائمة الكاملة — fullscreen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: 'rgba(10, 20, 50, 0.98)' }}
          dir="rtl"
        >
          {/* رأس القائمة */}
          <div className="flex items-center justify-between p-4 border-b border-gold-500/20 flex-shrink-0">
            <div>
              <div className="text-lg font-bold text-white">أقسام مركز العرض</div>
              <div className="text-xs text-white/40">{pages.length} قسماً</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* قائمة الأقسام */}
          <div className="flex-1 overflow-y-auto p-3">
            {pages.map((page, idx) => {
              const isCurrent = page.slug === currentSlug;
              return (
                <Link
                  key={page.slug}
                  href={`/executive-center/${page.slug}`}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1.5 transition-all ${
                    isCurrent
                      ? 'bg-gold-500/20 border border-gold-400/40'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <span className={`text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCurrent ? 'bg-gold-500 text-primary-900' : 'bg-white/10 text-white/50'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`flex-1 text-sm font-medium leading-tight ${
                    isCurrent ? 'text-gold-300' : 'text-white/75'
                  }`}>
                    {page.title}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      الآن
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gold-500/10 text-center flex-shrink-0">
            <div className="text-xs text-white/30">منصة جدير — مركز العرض التنفيذي</div>
          </div>
        </div>
      )}
    </div>
  );
}
