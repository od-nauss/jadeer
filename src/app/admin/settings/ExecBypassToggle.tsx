'use client';

import { useState, useTransition } from 'react';
import { Loader2, Lock, Unlock } from 'lucide-react';
import { setExecBypass } from './bypass-actions';

export function ExecBypassToggle({ initialBypass }: { initialBypass: boolean }) {
  const [bypass, setBypass] = useState(initialBypass);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !bypass;
    startTransition(async () => {
      await setExecBypass(next);
      setBypass(next);
    });
  }

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <button
        onClick={toggle}
        disabled={pending}
        title={bypass ? 'اضغط لتفعيل كلمة المرور' : 'اضغط لفتح العرض بدون كلمة مرور'}
        className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 focus:outline-none disabled:opacity-60 ${
          bypass ? 'bg-amber-400 border-amber-500' : 'bg-sage border-sage/80'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 mt-1 ${
          bypass ? 'translate-x-8' : 'translate-x-1'
        }`} />
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          </span>
        )}
      </button>
      <div className="flex items-center gap-1 text-xs">
        {bypass
          ? <><Unlock className="h-3 w-3 text-amber-600" /><span className="text-amber-700 font-medium">مفتوح</span></>
          : <><Lock className="h-3 w-3 text-sage" /><span className="text-sage font-medium">محمي</span></>
        }
      </div>
    </div>
  );
}
