'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

const DECISIONS = [
  { value: 'accept', label: 'قبول التظلم' },
  { value: 'reject', label: 'رفض التظلم' },
  { value: 'needs_info', label: 'يحتاج معلومات إضافية' },
  { value: 'reopen_file', label: 'إعادة فتح الملف' },
];

export function GovernanceAppealDecisionPanel({ appealId }: { appealId: string }) {
  const router = useRouter();
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!decision || !reason || reason.length < 20) return;
    setSaving(true);
    const res = await fetch(`/api/governance/appeals/${appealId}/decide`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, decision_reason: reason, reopen_file: decision === 'reopen_file' }),
    });
    if (res.ok) { setDone(true); router.refresh(); }
    setSaving(false);
  }

  if (done) return <div className="text-sm text-sage">✓ تم تسجيل القرار</div>;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-700 mb-1">قرار اللجنة على هذا التظلم:</div>
      <div className="flex flex-wrap gap-2">
        {DECISIONS.map(d => (
          <button key={d.value} onClick={() => setDecision(d.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${decision === d.value ? 'bg-primary-700 text-white' : 'bg-gold-50 text-darkgray border border-gold-200 hover:bg-gold-100'}`}>
            {d.label}
          </button>
        ))}
      </div>
      <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
        placeholder="سبب القرار (20 حرف على الأقل)..."
        className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
      <button onClick={handleSubmit} disabled={saving || !decision || reason.length < 20}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-bold disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        تأكيد القرار
      </button>
    </div>
  );
}
