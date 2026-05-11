'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export function RemindButton({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function sendReminder() {
    setState('loading');
    const res = await fetch('/api/hr/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, type: 'completion', message: `نذكرك بضرورة استكمال ملفك في منصة جدير.` }),
    });
    setState(res.ok ? 'sent' : 'error');
    if (res.ok) setTimeout(() => setState('idle'), 3000);
  }

  if (state === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sage/10 text-sage rounded-lg text-xs font-medium">
        <CheckCircle className="h-3 w-3" />تم الإرسال
      </span>
    );
  }

  return (
    <button
      onClick={sendReminder}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white rounded-lg text-xs transition"
    >
      {state === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
      تذكير
    </button>
  );
}
