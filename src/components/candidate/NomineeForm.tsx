'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Info } from 'lucide-react';

interface NomineeFormProps {
  onClose: () => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'direct_manager',       label: 'مدير مباشر' },
  { value: 'previous_manager',     label: 'مدير سابق' },
  { value: 'peer',                 label: 'زميل في نفس المستوى' },
  { value: 'subordinate',          label: 'مرؤوس مباشر' },
  { value: 'team_member',          label: 'عضو فريق عمل مشترك' },
  { value: 'stakeholder',          label: 'صاحب علاقة (مستفيد من عملك)' },
  { value: 'project_partner',      label: 'شريك في مشروع مشترك' },
  { value: 'internal_beneficiary', label: 'مستفيد داخلي من خدماتك' },
  { value: 'other',                label: 'أخرى' },
];

const KNOWLEDGE_DURATIONS = [
  'أقل من سنة', 'سنة إلى سنتين', '٢–٣ سنوات', '٣–٥ سنوات',
  '٥–١٠ سنوات', 'أكثر من ١٠ سنوات',
];

const KNOWLEDGE_TYPES = [
  'عمل مباشر تحت قيادته', 'تعاون في مشاريع مشتركة',
  'عمل في نفس الإدارة', 'لقاءات عمل منتظمة',
  'إشراف على عمله', 'تواصل في لجان مشتركة',
];

// مقياس الموضوعية — يكشف التحيز بشكل غير مباشر
const OBJECTIVITY_QUESTIONS = [
  {
    key: 'q_work_basis',
    text: 'معرفتي بهذا الشخص مبنية أساساً على بيئة العمل',
  },
  {
    key: 'q_seen_challenges',
    text: 'رأيت هذا الشخص يتعامل مع مواقف صعبة أو تحديات حقيقية في العمل',
  },
  {
    key: 'q_can_assess_objectively',
    text: 'أستطيع تقديم تقييم موضوعي بناءً على ملاحظات مهنية ملموسة',
  },
  {
    key: 'can_verify_initiatives',
    text: 'أعلم بمبادرات أو مشاريع قادها أو شارك فيها بشكل مباشر',
  },
  {
    key: 'can_verify_kpis',
    text: 'اطّلعت على نتائج أدائه أو مؤشراته في العمل',
  },
];

export function NomineeForm({ onClose }: NomineeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    department: '',
    job_title: '',
    relationship_type: '',
    knowledge_duration: '',
    knowledge_type: '',
    selection_justification: '',
    // يُحسب ضمنياً من مؤشرات الموضوعية
    can_verify_initiatives: false,
    can_verify_kpis: false,
    has_personal_relationship: false, // يُستنتج ليس يُسأل
    notes: '',
    // مؤشرات الموضوعية (تُرسل للـ API للتحليل)
    q_work_basis: false,
    q_seen_challenges: false,
    q_can_assess_objectively: false,
  });

  function update(key: string, value: unknown) { setForm(p => ({ ...p, [key]: value })); }

  // نكشف التحيز المحتمل بشكل غير مباشر من الإجابات
  function computePersonalRelationshipFlag(): boolean {
    // إذا لم يؤكد أن معرفته مبنية على العمل → احتمال علاقة شخصية
    const workBasis = form.q_work_basis;
    const seenChallenges = form.q_seen_challenges;
    const canAssess = form.q_can_assess_objectively;
    // إذا أجاب بـ "لا" على سؤالين أو أكثر → نحدد has_personal_relationship = true
    const negativeCount = [workBasis, seenChallenges, canAssess].filter(v => !v).length;
    return negativeCount >= 2;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.relationship_type) {
      setError('الاسم والبريد الإلكتروني وصلة المقيّم مطلوبة');
      return;
    }
    if (!form.knowledge_duration) {
      setError('يرجى تحديد مدة المعرفة المهنية');
      return;
    }
    setSaving(true); setError(null);

    const payload = {
      ...form,
      has_personal_relationship: computePersonalRelationshipFlag(),
    };

    try {
      const res = await fetch('/api/candidate/360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ أثناء الحفظ'); return; }
      router.refresh();
      onClose();
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 py-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 my-auto">

        {/* رأس النموذج */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200">
          <h2 className="text-xl font-bold text-primary-700">ترشيح مقيّم</h2>
          <button onClick={onClose} type="button"><X className="h-5 w-5 text-darkgray" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">{error}</div>
          )}

          {/* بيانات المقيّم */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>الاسم الكامل <span className="text-wine">*</span></label>
              <input value={form.full_name} onChange={e => update('full_name', e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>البريد الإلكتروني <span className="text-wine">*</span></label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputCls} dir="ltr" required />
            </div>
            <div>
              <label className={labelCls}>الإدارة</label>
              <input value={form.department} onChange={e => update('department', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>المسمى الوظيفي</label>
              <input value={form.job_title} onChange={e => update('job_title', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* العلاقة المهنية */}
          <div>
            <label className={labelCls}>صلة هذا الشخص بعملك <span className="text-wine">*</span></label>
            <select value={form.relationship_type} onChange={e => update('relationship_type', e.target.value)} className={inputCls} required>
              <option value="">— اختر نوع العلاقة المهنية —</option>
              {RELATIONSHIP_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>مدة التعامل المهني <span className="text-wine">*</span></label>
              <select value={form.knowledge_duration} onChange={e => update('knowledge_duration', e.target.value)} className={inputCls} required>
                <option value="">— اختر —</option>
                {KNOWLEDGE_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>طبيعة التعامل</label>
              <select value={form.knowledge_type} onChange={e => update('knowledge_type', e.target.value)} className={inputCls}>
                <option value="">— اختر —</option>
                {KNOWLEDGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>لماذا اخترت هذا الشخص تحديداً؟</label>
            <textarea rows={2} value={form.selection_justification}
              onChange={e => update('selection_justification', e.target.value)}
              className={inputCls}
              placeholder="ما الذي يجعله قادراً على تقييم أدائك المهني بدقة؟" />
          </div>

          {/* مؤشرات الموضوعية — تكشف التحيز بشكل غير مباشر */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-bold text-primary-700">طبيعة معرفتك بهذا الشخص</span>
            </div>
            <div className="space-y-2">
              {OBJECTIVITY_QUESTIONS.map(({ key, text }) => (
                <label key={key} className="flex items-start gap-2.5 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={e => update(key, e.target.checked)}
                      className="h-4 w-4 rounded border-gold-300 text-primary-600"
                    />
                  </div>
                  <span className="text-sm text-darkgray group-hover:text-primary-700 transition leading-relaxed">{text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* أزرار */}
          <div className="flex items-center gap-3 pt-2 border-t border-gold-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'جارٍ الحفظ...' : 'إضافة المقيّم'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-darkgray text-sm border border-gold-200 rounded-lg hover:bg-gold-50">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
