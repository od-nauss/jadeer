'use client';

import { useState } from 'react';
import { RotateCcw, Clock, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Governance360Actions({ linkId, status, token, candidateId }: {
  linkId: string;
  status: string;
  token: string;
  candidateId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(act: string) {
    setLoading(act);
    if (act === 'cancel') {
      await fetch(`/api/governance/links/${linkId}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/governance/links/${linkId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, extendDays: 7 }),
      });
    }
    setLoading(null);
    router.refresh();
  }

  if (['submitted', 'cancelled'].includes(status)) return null;

  return (
    <div className="flex gap-1">
      {status === 'expired' && (
        <button onClick={() => action('regenerate')} disabled={!!loading} title="إعادة إنشاء رابط"
          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition">
          {loading === 'regenerate' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        </button>
      )}
      {['ready', 'copied', 'opened'].includes(status) && (
        <>
          <button onClick={() => action('extend')} disabled={!!loading} title="تمديد 7 أيام"
            className="p-1.5 text-gold-600 hover:bg-gold-50 rounded-lg transition">
            {loading === 'extend' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => action('cancel')} disabled={!!loading} title="إلغاء الرابط"
            className="p-1.5 text-wine hover:bg-rose-50 rounded-lg transition">
            {loading === 'cancel' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
          </button>
        </>
      )}
    </div>
  );
}
