'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Users } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';

const STATUS_LABEL: Record<string, { label: string; variant: any }> = {
  ready:      { label: 'جاهز للإرسال', variant: 'gold' },
  copied:     { label: 'تم النسخ',     variant: 'primary' },
  opened:     { label: 'فُتح',          variant: 'steelblue' },
  submitted:  { label: 'مُستخدم',       variant: 'sage' },
  expired:    { label: 'منتهي',         variant: 'gray' },
  cancelled:  { label: 'ملغي',          variant: 'wine' },
};

export default function GovernanceLinksPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/governance/links-grouped')
      .then(r => r.json())
      .then(d => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function copyLink(token: string, linkId: string) {
    const url = `${window.location.origin}/evaluation/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2500);
    // Update status to copied
    fetch(`/api/governance/links/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_copied' }),
    }).then(() => {
      setGroups(prev => prev.map(g => ({
        ...g,
        links: g.links.map((l: any) => l.id === linkId ? { ...l, status: 'copied' } : l),
      })));
    });
  }

  return (
    <div dir="rtl">
      <PageHeader
        title="روابط تقييم 360°"
        description="روابط التقييم مُجمَّعة حسب كل مرشح. كل رابط فردي ويستخدم مرة واحدة فقط."
        icon={<Link2 className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gold-50 rounded-xl animate-pulse" />)}</div>
      ) : groups.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-darkgray">
            <Link2 className="h-10 w-10 mx-auto mb-3 text-gold-400" />
            <p className="font-bold">لا توجد روابط مُصدَرة</p>
            <p className="text-sm mt-1">سيتم إصدار الروابط فور اعتماد قوائم المقيمين.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => {
            const submitted = group.links.filter((l: any) => l.status === 'submitted').length;
            const total = group.links.length;
            const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
            return (
              <Card key={group.candidateId}>
                {/* رأس المرشح */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gold-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm">
                      {group.candidateName?.charAt(0) || '؟'}
                    </div>
                    <div>
                      <div className="font-bold text-primary-700">{group.candidateName}</div>
                      <div className="text-xs text-darkgray">{group.jobTitle}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gold-700">{pct}%</div>
                    <div className="text-xs text-darkgray">{submitted} من {total} مقيّم أكمل</div>
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="h-2 bg-gold-100 rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full ${pct >= 80 ? 'bg-sage' : pct >= 50 ? 'bg-gold-500' : 'bg-primary-600'}`} style={{ width: `${pct}%` }} />
                </div>

                {/* الروابط */}
                <div className="space-y-2">
                  {group.links.map((link: any) => {
                    const s = STATUS_LABEL[link.status] || { label: link.status, variant: 'gray' as const };
                    const isCopied = copiedId === link.id;
                    return (
                      <div key={link.id} className="flex items-center gap-3 py-2 px-3 bg-gold-50 border border-gold-100 rounded-xl">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Users className="h-4 w-4 text-gold-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-primary-700 truncate">{link.evaluatorName}</div>
                            <div className="text-xs text-darkgray">{link.relationship}</div>
                          </div>
                        </div>
                        <Badge variant={s.variant}>{s.label}</Badge>
                        {link.status !== 'submitted' && link.status !== 'expired' && link.status !== 'cancelled' && (
                          <button
                            onClick={() => copyLink(link.token, link.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              isCopied
                                ? 'bg-sage text-white'
                                : 'bg-primary-700 text-white hover:bg-primary-800'
                            }`}
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {isCopied ? 'نُسخ!' : 'نسخ الرابط'}
                          </button>
                        )}
                        {link.status === 'submitted' && (
                          <span className="text-xs text-sage font-bold">✓ مكتمل</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
