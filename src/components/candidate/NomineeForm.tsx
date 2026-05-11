'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';

interface NomineeFormProps {
  onClose: () => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'direct_manager', label: 'مدير مباشر' },
  { value: 'previous_manager', label: 'مدير سابق' },
  { value: 'peer', label: 'زميل' },
  { value: 'subordinate', label: 'مرؤوس' },
  { value: 'team_member', label: 'عضو فريق' },
  { value: 'stakeholder', label: 'صاحب علاقة' },
  { value: 'project_partner', label: 'شريك في مشروع' },
  { value: 'internal_beneficiary', label: 'مستفيد داخلي' },
  { value: 'other', label: 'أخرى' },
];

export function NomineeForm({ onClose }: NomineeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    job_title: '',
    relationship_type: '',
    knowledge_duration: '',
    knowledge_type: '',
    selection_justification: '',
    can_verify_initiatives: false,
    can_verify_kpis: false,
    has_personal_relationship: false,
    notes: '',
  });

  function update(key: string, value: unknown) { setForm(p => ({ ...p, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.relationship_type) {
      setError('الاسم والبريد ونوع العلاقة مطلوبة');
      return;
    }
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/candidate/360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
      router.refresh();
      onClose();
    } catch { setError('حدث خطأ غير متوقع'); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 py-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200">
          <h2 className="text-xl font-bold text-primary-700">إضافة مقيّم</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-darkgray" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>الاسم الكامل <span className="text-wine">*</span></label>
              <input value={form.full_name} onChange={e => update('full_name', e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>البريد الإلكتروني <span className="text-wine">*</span></label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputCls} dir="ltr" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>الإدارة</label>
              <input value={form.department} onChange={e => update('department', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>المسمى الوظيفي</label>
              <input value={form.job_title} onChange={e => update('job_title', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>صلة المقيّم بك <span className="text-wine">*</span></label>
            <select value={form.relationship_type} onChange={e => update('relationship_type', e.target.value)} className={inputCls} required>
              <option value="">اختر نوع العلاقة</option>
              {RELATIONSHIP_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>مدة المعرفة المهنية</label>
              <input value={form.knowledge_duration} onChange={e => update('knowledge_duration', e.target.value)} className={inputCls} placeholder="مثال: 3 سنوات" />
            </div>
            <div>
              <label className={labelCls}>نوع المعرفة</label>
              <input value={form.knowledge_type} onChange={e => update('knowledge_type', e.target.value)} className={inputCls} placeholder="مثال: عمل مباشر، مشروع مشترك" />
            </div>
          </div>

          <div>
            <label className={labelCls}>مبرر الاختيار</label>
            <textarea rows={2} value={form.selection_justification}
              onChange={e => update('selection_justification', e.target.value)} className={inputCls}
              placeholder="لماذا هذا الشخص؟ ماذا يعرف عن عملك؟" />
          </div>

          <div className="space-y-2">
            {[
              ['can_verify_initiatives', 'يستطيع تأكيد مبادراتي'],
              ['can_verify_kpis', 'يستطيع تقييم مؤشرات أدائي'],
              ['has_personal_relationship', 'توجد علاقة شخصية قد تؤثر في التقييم'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={e => update(key, e.target.checked)}
                  className="rounded border-gold-300 text-primary-600" />
                <span className="text-sm text-darkgray">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gold-200">
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إضافة المقيّم
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-darkgray text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
