'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UniversityLogo } from '@/components/branding/Logo';

const NAV_LINKS = [
  { label: 'الرئيسية',       href: '/' },
  { label: 'التعريف العام',  href: '/about' },
  { label: 'العرض التنفيذي', href: '/exec-access' },
  { label: 'لجنة الحوكمة',  href: '/governance-info' },
  { label: 'تواصل',          href: '/contact' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gold-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3">
            <UniversityLogo size="sm" />
            <div className="hidden md:block border-r border-gold-300 pr-3">
              <div className="text-xl font-bold text-primary-700">
                منصة <span className="text-gold-600">جدير</span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className="px-4 py-2 text-sm font-medium text-darkgray hover:text-primary-700 hover:bg-gold-50 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-primary-700 hover:bg-gold-50 rounded-lg transition-colors">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="btn-primary px-5 py-2 text-sm font-bold rounded-lg">
              إنشاء حساب
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-primary-700">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-gold-200">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-darkgray hover:bg-gold-50 rounded-lg">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gold-200 mt-2 pt-2 flex gap-2">
                <Link href="/login" className="flex-1 text-center px-4 py-2 text-sm border border-primary-700 text-primary-700 rounded-lg">تسجيل الدخول</Link>
                <Link href="/register" className="flex-1 text-center btn-primary px-4 py-2 text-sm rounded-lg">إنشاء حساب</Link>
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
            <UniversityLogo size="sm" className="mb-4" />
            <p className="text-sm text-white/70 leading-relaxed">
              منصة جدير منصة مؤسسية ذكية لقياس الجدارة القيادية.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gold-400 mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-gold-300 transition">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gold-400 mb-3">الدخول</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-white/70 hover:text-gold-300 transition">تسجيل الدخول</Link></li>
              <li><Link href="/register" className="text-white/70 hover:text-gold-300 transition">إنشاء حساب جديد</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-white/50">
          © 2026 جامعة نايف العربية للعلوم الأمنية. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
