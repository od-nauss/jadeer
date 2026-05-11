'use client';

import { Lock, Unlock } from 'lucide-react';

export function ExecBypassToggle({ initialBypass }: { initialBypass: boolean }) {
  // استخدام full page navigation للـ API Route يضمن حفظ الـ cookie بشكل موثوق 100%
  function toggle() {
    const next = !initialBypass;
    window.location.href = `/api/admin/exec-bypass?v=${next ? '1' : '0'}`;
  }

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <button
        onClick={toggle}
        title={initialBypass ? 'اضغط لإعادة تفعيل كلمة المرور' : 'اضغط لفتح العرض بدون كلمة مرور'}
        className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 focus:outline-none ${
          initialBypass ? 'bg-amber-400 border-amber-500' : 'bg-sage border-sage/80'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 mt-1 ${
          initialBypass ? 'translate-x-8' : 'translate-x-1'
        }`} />
      </button>
      <div className="flex items-center gap-1 text-xs">
        {initialBypass
          ? <><Unlock className="h-3 w-3 text-amber-600" /><span className="text-amber-700 font-medium">مفتوح</span></>
          : <><Lock className="h-3 w-3 text-sage" /><span className="text-sage font-medium">محمي</span></>
        }
      </div>
    </div>
  );
}
