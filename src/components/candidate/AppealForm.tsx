'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const APPEAL_TYPES = [
  { value: 'classification_objection', label: 'اعتراض على التصنيف' },
  { value: 'reassessment_request', label: 'طلب إعادة تقييم' },
  { value: 'data_correction', label: 'تصحيح بيانات' },
  { value: 'evidence_addition', label: 'إضافة شواهد' },
  { value: 'evaluation_completion', label: 'اعتراض على اكتمال التقييم' },
  { value: 'other', label: 'أخرى' },
];

export function AppealForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ appeal_type: '', appeal_text: '' });

  function update(key: string, value: string) { setForm(p => ({ ...p, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.appeal_type || form.appeal_text.length < 50) {
      setError('اختر نوع التظلم واكتب نصاً مفصلاً (50 حرف على الأقل)');
      return;
    }
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/candidate/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
      setSuccess(true);
      setForm({ appeal_type: '', appeal_text: '' });
      router.refresh();
    } catch { setError('حدث خطأ غير متوقع'); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  if (success) {
    return (
      <div className="institutional-card p-6 text-center">
        <div className="h-16 w-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-lg font-bold text-primary-700 mb-2">تم تقديم التظلم</h3>
        <p className="text-sm text-darkgray">ستراجع لجنة الحوكمة طلبك وستصلك إشعار بالقرار.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-primary-700 hover:underline">
          تقديم تظلم آخر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="institutional-card p-6 space-y-4">
      <h3 className="text-lg font-bold text-primary-700">تقديم تظلم جديد</h3>
      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">{error}</div>}

      <div>
        <label className={labelCls}>نوع التظلم <span className="text-wine">*</span></label>
        <select value={form.appeal_type} onChange={e => update('appeal_type', e.target.value)} className={inputCls} required>
          <option value="">اختر نوع التظلم</option>
          {APPEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>نص التظلم <span className="text-wine">*</span></label>
        <textarea rows={5} value={form.appeal_text} onChange={e => update('appeal_text', e.target.value)} className={inputCls}
          placeholder="اشرح تظلمك بالتفصيل. كن موضوعياً وادعم طلبك بالحقائق والأدلة إن وجدت..." required />
        <div className="text-xs text-darkgray mt-1">
          {form.appeal_text.length} حرف {form.appeal_text.length < 50 && `(50 حرف مطلوب على الأقل)`}
        </div>
      </div>

      <button type="submit" disabled={saving || form.appeal_text.length < 50}
        className="w-full btn-primary py-2.5 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        تقديم التظلم
      </button>
    </form>
  );
}
