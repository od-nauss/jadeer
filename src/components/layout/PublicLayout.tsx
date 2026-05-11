'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UniversityLogo } from '@/components/branding/Logo';

const NAV_LINKS = [
  { label: 'ط§ظ„ط±ط¦ظٹط³ظٹط©', href: '/' },
  { label: 'ط§ظ„طھط¹ط±ظٹظپ ط§ظ„ط¹ط§ظ…', href: '/about' },
  { label: 'ط§ظ„ط¹ط±ط¶ ط§ظ„طھظ†ظپظٹط°ظٹ', href: '/exec-access' },
  { label: 'ظ„ط¬ظ†ط© ط§ظ„ط­ظˆظƒظ…ط©', href: '/governance-info' },
  { label: 'طھظˆط§طµظ„', href: '/contact' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gold-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <UniversityLogo size="sm" />
            <div className="hidden md:block border-r border-gold-300 pr-3">
              <div className="text-xl font-bold text-primary-700">
                ظ…ظ†طµط© <span className="text-gold-600">ط¬ط¯ظٹط±</span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-darkgray hover:text-primary-700 hover:bg-gold-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-primary-700 hover:bg-gold-50 rounded-lg transition-colors"
            >
              طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
            </Link>
            <Link
              href="/register"
              className="btn-primary px-5 py-2 text-sm font-bold rounded-lg"
            >
              ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-primary-700"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-gold-200">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-darkgray hover:bg-gold-50 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gold-200 mt-2 pt-2 flex gap-2">
                <Link href="/login" className="flex-1 text-center px-4 py-2 text-sm border border-primary-700 text-primary-700 rounded-lg">
                  طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
                </Link>
                <Link href="/register" className="flex-1 text-center btn-primary px-4 py-2 text-sm rounded-lg">
                  ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-primary-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <UniversityLogo size="sm" className="brightness-0 invert mb-4" />
            <p className="text-sm text-white/70 leading-relaxed">
              ظ…ظ†طµط© ط¬ط¯ظٹط± ظ…ظ†طµط© ظ…ط¤ط³ط³ظٹط© ط°ظƒظٹط© ظ„ظ‚ظٹط§ط³ ط§ظ„ط¬ط¯ط§ط±ط© ط§ظ„ظ‚ظٹط§ط¯ظٹط©طŒ طھطھظٹط­ ظ„ط¬ظ…ظٹط¹ ظ…ظˆط¸ظپظٹ ط§ظ„ظ…ظ†ط¸ظ…ط© ط§ظ„طھظ‚ط¯ظ… ظ„ظ…ط³ط§ط± ط§ظ„ط¬ط§ظ‡ط²ظٹط© ط§ظ„ظ‚ظٹط§ط¯ظٹط©.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gold-400 mb-3">ط±ظˆط§ط¨ط· ط³ط±ظٹط¹ط©</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-gold-300 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gold-400 mb-3">ط­ط³ط§ط¨ط§طھ ط§ظ„ط¯ط®ظˆظ„</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-white/70 hover:text-gold-300 transition">
                  طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-white/70 hover:text-gold-300 transition">
                  ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨ ط¬ط¯ظٹط¯
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-white/50">
          آ© 2026 ط¬ط§ظ…ط¹ط© ظ†ط§ظٹظپ ط§ظ„ط¹ط±ط¨ظٹط© ظ„ظ„ط¹ظ„ظˆظ… ط§ظ„ط£ظ…ظ†ظٹط©. ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©.
        </div>
      </div>
    </footer>
  );
}
