'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function ExecBypassToggle({ initialBypass }: { initialBypass: boolean }) {
  const [bypass, setBypass] = useState(initialBypass);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newVal = !bypass;
    const res = await fetch('/api/admin/exec-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bypass: newVal }),
    });
    if (res.ok) setBypass(newVal);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
        bypass ? 'bg-amber-400 border-amber-500' : 'bg-sage border-sage'
      }`}
      title={bypass ? 'اضغط لتفعيل كلمة المرور' : 'اضغط لإيقاف كلمة المرور'}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 mt-0.5 ${
          bypass ? 'translate-x-7' : 'translate-x-0.5'
        }`}
      />
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-3 w-3 animate-spin text-white" />
        </span>
      )}
    </button>
  );
}
