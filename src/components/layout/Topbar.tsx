'use client';

import { Bell, LogOut, Languages, ChevronDown, UserCog } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ROLES, type RoleCode } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';

interface TopbarProps {
  fullName: string;
  email: string;
  role: RoleCode;
  isAdmin: boolean;
  unreadCount?: number;
}

const ALL_ROLES: RoleCode[] = ['admin', 'president', 'governance', 'hr', 'advisor', 'candidate'];

export function Topbar({ fullName, email, role, isAdmin, unreadCount = 0 }: TopbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const roleInfo = ROLES[role];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function handleRoleSwitch(targetRole: RoleCode) {
    setRoleSwitcherOpen(false);
    router.push(ROLES[targetRole].homePath);
  }

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gold-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Page title placeholder */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-primary-700 hidden md:block">
            {roleInfo.nameAr}
          </h1>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Role Switcher - مدير النظام فقط */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gold-100 hover:bg-gold-200 text-gold-800 rounded-lg text-sm font-medium transition-colors border border-gold-300"
                title="تبديل الدور (للمدير فقط)"
              >
                <UserCog className="h-4 w-4" />
                <span className="hidden md:inline">تبديل الدور</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gold-200 overflow-hidden">
                  <div className="px-4 py-2 bg-gold-50 border-b border-gold-100 text-xs text-gold-800 font-semibold">
                    معاينة دور آخر
                  </div>
                  {ALL_ROLES.map((targetRole) => (
                    <button
                      key={targetRole}
                      onClick={() => handleRoleSwitch(targetRole)}
                      className={cn(
                        'w-full text-right px-4 py-2.5 text-sm hover:bg-gold-50 transition-colors flex items-center justify-between',
                        targetRole === role && 'bg-gold-50 text-primary-700 font-bold'
                      )}
                    >
                      <span>{ROLES[targetRole].nameAr}</span>
                      {targetRole === role && <span className="text-xs text-gold-700">حالي</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <button
            className="relative p-2 text-darkgray hover:text-primary-700 transition-colors"
            title="الإشعارات"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 left-1 h-4 w-4 bg-wine text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Language */}
          <button
            className="p-2 text-darkgray hover:text-primary-700 transition-colors"
            title="تبديل اللغة"
          >
            <Languages className="h-5 w-5" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gold-50 rounded-lg transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                {fullName.charAt(0)}
              </div>
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-primary-700">{fullName}</div>
                <div className="text-xs text-darkgray">{roleInfo.nameAr}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-darkgray" />
            </button>

            {menuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gold-200 overflow-hidden">
                <div className="px-4 py-3 bg-gold-50 border-b border-gold-100">
                  <div className="text-sm font-bold text-primary-700">{fullName}</div>
                  <div className="text-xs text-darkgray mt-0.5">{email}</div>
                  <div className="text-xs text-gold-700 mt-1">{roleInfo.nameAr}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-3 text-sm hover:bg-gold-50 transition-colors flex items-center gap-2 text-wine"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
