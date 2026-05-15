'use client';

import { useTransition } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { toggleExecBypass } from './bypass-actions';

export function ExecBypassToggle({ bypassActive }: { bypassActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => toggleExecBypass(formData));
      }}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      {/* القيمة الجديدة هي عكس الحالية */}
      <input type="hidden" name="enable" value={bypassActive ? '0' : '1'} />

      <button
        type="submit"
        disabled={pending}
        title={bypassActive ? 'اضغط لتفعيل كلمة المرور' : 'اضغط لفتح العرض بدون كلمة مرور'}
        className={`relative inline-flex h-8 w-16 cursor-pointer rounded-full border-2 transition-all duration-300 focus:outline-none disabled:opacity-60 ${
          bypassActive
            ? 'bg-amber-400 border-amber-500'
            : 'bg-sage border-sage/80'
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 mt-1 ${
          bypassActive ? 'translate-x-8' : 'translate-x-1'
        }`} />
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          </span>
        )}
      </button>

      <div className="flex items-center gap-1 text-xs">
        {bypassActive
          ? <><Unlock className="h-3 w-3 text-amber-600" /><span className="text-amber-700 font-medium">مفتوح</span></>
          : <><Lock className="h-3 w-3 text-sage" /><span className="text-sage font-medium">محمي</span></>
        }
      </div>
    </form>
  );
}
