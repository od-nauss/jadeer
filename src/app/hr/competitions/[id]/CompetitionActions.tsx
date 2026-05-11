'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, XCircle, Archive } from 'lucide-react';

const NEXT_STATUS: Record<string, { label: string; value: string; color: string }> = {
  draft: { label: 'فتح التقديم', value: 'open', color: 'bg-sage text-white hover:bg-sage/90' },
  open: { label: 'إغلاق التقديم', value: 'closed', color: 'bg-gold-500 text-white hover:bg-gold-600' },
  closed: { label: 'قيد المراجعة', value: 'under_review', color: 'bg-primary-700 text-white hover:bg-primary-800' },
  under_review: { label: 'اكتمال المسابقة', value: 'completed', color: 'bg-sage text-white hover:bg-sage/90' },
  completed: { label: 'أرشفة', value: 'archived', color: 'bg-gray-500 text-white hover:bg-gray-600' },
};

export function CompetitionActions({ competitionId, currentStatus }: { competitionId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = NEXT_STATUS[currentStatus];

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/hr/competitions/${competitionId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  if (!next || currentStatus === 'archived') return null;

  return (
    <button onClick={() => updateStatus(next.value)} disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60 ${next.color}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
      {next.label}
    </button>
  );
}
