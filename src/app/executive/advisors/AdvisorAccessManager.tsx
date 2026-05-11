'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CheckCircle2, XCircle, Loader2, Shield, Eye } from 'lucide-react';
import { Badge, Card } from '@/components/ui';

interface AdvisorUser { id: string; full_name: string; job_title?: string; email: string; }
interface Access {
  id: string; advisor_user_id: string; access_type: string;
  can_view_reports: boolean; can_view_cards: boolean;
  can_view_fit_map: boolean; can_add_notes: boolean;
  expires_at?: string; created_at: string;
  users?: { full_name: string };
}

const ACCESS_TYPES = [
  { value: 'all_reports', label: 'جميع التقارير والبطاقات' },
  { value: 'specific_candidate', label: 'مرشح محدد' },
  { value: 'specific_unit', label: 'وحدة تنظيمية محددة' },
  { value: 'fit_map', label: 'خريطة الملاءمة فقط' },
];

export function AdvisorAccessManager({ advisorUsers, accesses }: { advisorUsers: AdvisorUser[]; accesses: Access[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    advisor_user_id: '', access_type: 'all_reports',
    can_view_reports: true, can_view_cards: true,
    can_view_fit_map: false, can_add_notes: true,
    expires_days: '', justification: '',
  });

  function update(k: string, v: unknown) { setForm(p => ({ ...p, [k]: v })); }

  async function handleGrant() {
    if (!form.advisor_user_id) { setError('اختر مستشاراً'); return; }
    setSaving(true); setError(null);
    const res = await fetch('/api/executive/advisors/grant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, expires_days: form.expires_days ? Number(form.expires_days) : null }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setSaving(false); setShowForm(false);
    setForm({ advisor_user_id: '', access_type: 'all_reports', can_view_reports: true, can_view_cards: true, can_view_fit_map: false, can_add_notes: true, expires_days: '', justification: '' });
    router.refresh();
  }

  async function handleRevoke(accessId: string) {
    if (!confirm('هل أنت متأكد من إلغاء هذه الصلاحية؟')) return;
    setRevoking(accessId);
    await fetch(`/api/executive/advisors/${accessId}`, { method: 'DELETE' });
    setRevoking(null); router.refresh();
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-xs font-medium text-primary-700 mb-1';

  return (
    <div className="space-y-5">
      {/* زر منح صلاحية */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-darkgray">{accesses.length} صلاحية نشطة</div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold">
          <Plus className="h-4 w-4" />منح صلاحية جديدة
        </button>
      </div>

      {/* نموذج المنح */}
      {showForm && (
        <Card className="bg-primary-50 border-primary-200">
          <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />منح صلاحية اطلاع لمستشار
          </h3>
          {error && <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">{error}</div>}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>المستشار *</label>
              <select value={form.advisor_user_id} onChange={e => update('advisor_user_id', e.target.value)} className={inputCls}>
                <option value="">اختر مستشاراً</option>
                {advisorUsers.map(a => <option key={a.id} value={a.id}>{a.full_name} — {a.job_title}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>نوع الصلاحية</label>
              <select value={form.access_type} onChange={e => update('access_type', e.target.value)} className={inputCls}>
                {ACCESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>صلاحية انتهاء (أيام — اتركها فارغة للدائمة)</label>
              <input type="number" value={form.expires_days} onChange={e => update('expires_days', e.target.value)} className={inputCls} placeholder="30" />
            </div>
            <div>
              <label className={labelCls}>مبرر المنح</label>
              <input value={form.justification} onChange={e => update('justification', e.target.value)} className={inputCls} placeholder="سبب منح الصلاحية..." />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              ['can_view_reports', 'عرض التقارير'],
              ['can_view_cards', 'عرض البطاقات القيادية'],
              ['can_view_fit_map', 'عرض خريطة الملاءمة'],
              ['can_add_notes', 'إضافة ملاحظات'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={e => update(key, e.target.checked)}
                  className="rounded border-gold-300 text-primary-600" />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleGrant} disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              منح الصلاحية
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-darkgray text-sm">إلغاء</button>
          </div>
        </Card>
      )}

      {/* قائمة الصلاحيات الحالية */}
      {accesses.length === 0 ? (
        <div className="text-center py-8 text-darkgray text-sm">لا توجد صلاحيات نشطة.</div>
      ) : (
        <div className="space-y-2">
          {accesses.map((ac) => {
            const advisor = advisorUsers.find(u => u.id === ac.advisor_user_id);
            const isExpired = ac.expires_at && new Date(ac.expires_at) < new Date();
            return (
              <div key={ac.id} className={`p-4 rounded-xl border ${isExpired ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gold-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-steelblue to-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {(advisor?.full_name || 'م').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary-700">{advisor?.full_name || 'مستشار'}</div>
                    <div className="text-xs text-darkgray">{ACCESS_TYPES.find(t => t.value === ac.access_type)?.label}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {ac.can_view_cards && <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-1.5 py-0.5 rounded">بطاقات</span>}
                      {ac.can_view_reports && <span className="text-xs bg-gold-50 text-gold-700 border border-gold-200 px-1.5 py-0.5 rounded">تقارير</span>}
                      {ac.can_view_fit_map && <span className="text-xs bg-green-50 text-sage border border-green-200 px-1.5 py-0.5 rounded">خريطة الملاءمة</span>}
                      {ac.can_add_notes && <span className="text-xs bg-blue-50 text-steelblue border border-blue-200 px-1.5 py-0.5 rounded">ملاحظات</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ac.expires_at && (
                      <div className="text-xs text-darkgray">
                        {isExpired ? 'منتهية' : `تنتهي: ${new Date(ac.expires_at).toLocaleDateString('ar-SA')}`}
                      </div>
                    )}
                    <button onClick={() => handleRevoke(ac.id)} disabled={revoking === ac.id}
                      className="p-1.5 text-wine hover:bg-rose-50 rounded-lg transition-colors">
                      {revoking === ac.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
