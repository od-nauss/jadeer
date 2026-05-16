'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ChevronDown, Check } from 'lucide-react';
import { ROLES, type RoleCode } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';

interface PortalSwitcherProps {
  roles: RoleCode[];
  currentRole: RoleCode;
}

const ROLE_ICONS: Record<RoleCode, string> = {
  admin: '⚙️',
  president: '👑',
  governance: '🏛️',
  hr: '👥',
  advisor: '🎯',
  candidate: '🌟',
};

export function PortalSwitcher({ roles, currentRole }: PortalSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Only show switcher if user has more than one role
  if (roles.length <= 1) return null;

  function handleSwitch(role: RoleCode) {
    setOpen(false);
    router.push(ROLES[role].homePath);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-medium transition-colors border border-primary-200"
        title="تبديل البوابة"
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="hidden md:inline">بواباتي</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-primary-100 overflow-hidden z-50">
            <div className="px-4 py-2.5 bg-primary-50 border-b border-primary-100">
              <div className="text-xs font-bold text-primary-700">بواباتك المتاحة</div>
              <div className="text-xs text-primary-500 mt-0.5">اختر البوابة للانتقال إليها</div>
            </div>
            {roles.map((role) => {
              const info = ROLES[role];
              const isCurrent = role === currentRole;
              return (
                <button
                  key={role}
                  onClick={() => handleSwitch(role)}
                  className={cn(
                    'w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2',
                    isCurrent
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'hover:bg-gold-50 text-primary-800'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ROLE_ICONS[role]}</span>
                    <span>{info.nameAr}</span>
                  </div>
                  {isCurrent && (
                    <Check className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
