'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SIDEBAR_ITEMS } from './sidebar-config';
import type { RoleCode } from '@/lib/auth/roles';
import { ROLES } from '@/lib/auth/roles';
import { UniversityLogo } from '@/components/branding/Logo';

interface SidebarProps {
  role: RoleCode;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = SIDEBAR_ITEMS[role] || [];
  const roleInfo = ROLES[role];

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:right-0 md:w-72 bg-gradient-to-b from-primary-700 to-primary-800 border-l border-gold-500/20 z-30">
      {/* Logo header */}
      <div className="flex items-center justify-center px-6 py-6 border-b border-gold-500/20">
        <UniversityLogo size="sm" className="brightness-0 invert" />
      </div>

      {/* Platform name */}
      <div className="px-6 py-4 border-b border-gold-500/20">
        <h2 className="text-2xl font-bold text-white">
          منصة <span className="text-gold-400">جدير</span>
        </h2>
        <p className="text-xs text-gold-200/80 mt-1">{roleInfo.nameAr}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-gold-500/20 text-gold-100 border border-gold-500/30'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-gold-400' : 'text-white/60 group-hover:text-gold-300'
                )}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gold-500/20 text-xs text-white/50">
        © 2026 جامعة نايف العربية للعلوم الأمنية
      </div>
    </aside>
  );
}
