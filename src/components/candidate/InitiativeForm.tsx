'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Brain } from 'lucide-react';
import { AiInsightPanel } from './AiInsightPanel';

interface InitiativeFormProps {
  profileId: string;
  onClose: () => void;
  existing?: Record<string, unknown>;
}

const INITIATIVE_TYPES = [
  { value: 'operational', label: 'تشغيلية' },
  { value: 'strategic', label: 'استراتيجية' },
  { value: 'technical', label: 'تقنية' },
  { value: 'development', label: 'تطويرية' },
  { value: 'improvement', label: 'تحسينية' },
  { value: 'innovation', label: 'ابتكارية' },
  { value: 'service', label: 'خدمية' },
  { value: 'financial', label: 'مالية' },
  { value: 'training', label: 'تدريبية' },
  { value: 'other', label: 'أخرى' },
];

const INNOVATION_LEVELS = [
  { value: 'low', label: 'تحسين تدريجي' },
  { value: 'medium', label: 'تحسين ملموس' },
  { value: 'high', label: 'ابتكار واضح' },
  { value: 'very_high', label: 'ابتكار نوعي' },
];

export function InitiativeForm({ onClose, existing }: InitiativeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [form, setForm] = useState({
    name: (existing?.name as string) || '',
    initiative_type: (existing?.initiative_type as string) || '',
    problem_description: (existing?.problem_description as string) || '',
    idea: (existing?.idea as string) || '',
    candidate_role: (existing?.candidate_role as string) || '',
    was_idea_owner: (existing?.was_idea_owner as boolean) || false,
    led_implementation: (existing?.led_implementation as boolean) || false,
    participated_implementation: (existing?.participated_implementation as boolean) || false,
    coordinated_parties: (existing?.coordinated_parties as boolean) || false,
    developed_tool: (existing?.developed_tool as boolean) || false,
    tracked_impact: (existing?.tracked_impact as boolean) || false,
    beneficiary_group: (existing?.beneficiary_group as string) || '',
    beneficiary_count: (existing?.beneficiary_count as string) || '',
    achieved_impact: (existing?.achieved_impact as string) || '',
    impact_metrics: (existing?.impact_metrics as string) || '',
    duration: (existing?.duration as string) || '',
    is_sustainable: (existing?.is_sustainable as boolean) || false,
    is_generalizable: (existing?.is_generalizable as boolean) || false,
    innovation_level: (existing?.innovation_level as string) || '',
    organization_alignment: (existing?.organization_alignment as string) || '',
    evidence: (existing?.evidence as string) || '',
    notes: (existing?.notes as string) || '',
  });

  function update(key: string, value: unknown) {
    setForm(p => ({ ...p, [key]: value }));
  }

  async function handleAnalyze() {
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/candidate/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, _dry_run: true }),
      });
      const data = await res.json();
      if (data.analysis) setAnalysis(data.analysis);
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError('اسم المبادرة مطلوب'); return; }
    if (!form.achieved_impact) { setError('الأثر المحقق مطلوب'); return; }
    setSaving(true);
    setError(null);
    try {
      const url = existing?.id
        ? `/api/candidate/initiatives/${existing.id}`
        : '/api/candidate/initiatives';
      const method = existing?.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
      router.refresh();
      onClose();
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';
  const checkboxCls = 'flex items-center gap-2 cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 py-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-primary-700">{existing ? 'تعديل مبادرة' : 'إضافة مبادرة'}</h2>
          <button onClick={onClose} className="text-darkgray hover:text-wine transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">{error}</div>}

          {/* الاسم والنوع */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>اسم المبادرة <span className="text-wine">*</span></label>
              <input value={form.name} onChange={e => update('name', e.target.value)} className={inputCls} placeholder="مثال: أتمتة نظام الطلبات الداخلية" required />
            </div>
            <div>
              <label className={labelCls}>نوع المبادرة</label>
              <select value={form.initiative_type} onChange={e => update('initiative_type', e.target.value)} className={inputCls}>
                <option value="">اختر النوع</option>
                {INITIATIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* المشكلة والفكرة */}
          <div>
            <label className={labelCls}>المشكلة قبل المبادرة</label>
            <textarea rows={2} value={form.problem_description} onChange={e => update('problem_description', e.target.value)} className={inputCls} placeholder="ما المشكلة التي دفعتك لهذه المبادرة؟" />
          </div>
          <div>
            <label className={labelCls}>فكرة المبادرة</label>
            <textarea rows={2} value={form.idea} onChange={e => update('idea', e.target.value)} className={inputCls} placeholder="ما الحل الذي اقترحته؟" />
          </div>

          {/* دور المرشح */}
          <div>
            <label className={labelCls}>دورك في المبادرة</label>
            <textarea rows={2} value={form.candidate_role} onChange={e => update('candidate_role', e.target.value)} className={inputCls} placeholder="صف دورك الفعلي بوضوح..." />
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[
                ['was_idea_owner', 'صاحب الفكرة'],
                ['led_implementation', 'قاد التنفيذ'],
                ['participated_implementation', 'شارك في التنفيذ'],
                ['coordinated_parties', 'نسّق بين الجهات'],
                ['developed_tool', 'طوّر أداة أو نموذجاً'],
                ['tracked_impact', 'تابع الأثر'],
              ].map(([key, label]) => (
                <label key={key} className={checkboxCls}>
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={e => update(key, e.target.checked)}
                    className="rounded border-gold-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-darkgray">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* الأثر */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>الأثر المحقق <span className="text-wine">*</span></label>
              <textarea rows={2} value={form.achieved_impact} onChange={e => update('achieved_impact', e.target.value)} className={inputCls} placeholder="ما الذي تغيّر فعلاً؟" required />
            </div>
            <div>
              <label className={labelCls}>مؤشر الأثر (أرقام)</label>
              <textarea rows={2} value={form.impact_metrics} onChange={e => update('impact_metrics', e.target.value)} className={inputCls} placeholder="مثال: قلل الوقت 40%، خدم 500 مستفيد" />
            </div>
          </div>

          {/* الفئة والمدة */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>الفئة المستفيدة</label>
              <input value={form.beneficiary_group} onChange={e => update('beneficiary_group', e.target.value)} className={inputCls} placeholder="مثال: إدارة العمليات" />
            </div>
            <div>
              <label className={labelCls}>عدد المستفيدين</label>
              <input type="number" value={form.beneficiary_count} onChange={e => update('beneficiary_count', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>مدة التنفيذ</label>
              <input value={form.duration} onChange={e => update('duration', e.target.value)} className={inputCls} placeholder="مثال: 3 أشهر" />
            </div>
          </div>

          {/* الابتكار والاستدامة */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>مستوى الابتكار</label>
              <select value={form.innovation_level} onChange={e => update('innovation_level', e.target.value)} className={inputCls}>
                <option value="">اختر</option>
                {INNOVATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-center gap-2 pt-4">
              <label className={checkboxCls}>
                <input type="checkbox" checked={form.is_sustainable} onChange={e => update('is_sustainable', e.target.checked)} className="rounded border-gold-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-darkgray">قابلة للاستدامة</span>
              </label>
              <label className={checkboxCls}>
                <input type="checkbox" checked={form.is_generalizable} onChange={e => update('is_generalizable', e.target.checked)} className="rounded border-gold-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-darkgray">قابلة للتعميم</span>
              </label>
            </div>
          </div>

          {/* الشواهد والربط */}
          <div>
            <label className={labelCls}>الشواهد وأسماء المؤكدين</label>
            <textarea rows={2} value={form.evidence} onChange={e => update('evidence', e.target.value)} className={inputCls} placeholder="أسماء أشخاص أو مستندات أو روابط تؤكد المبادرة..." />
          </div>
          <div>
            <label className={labelCls}>ارتباط المبادرة بأهداف المنظمة</label>
            <input value={form.organization_alignment} onChange={e => update('organization_alignment', e.target.value)} className={inputCls} placeholder="مثال: تحسين كفاءة العمليات ضمن هدف التحول الرقمي" />
          </div>

          {/* التحليل الذكي */}
          {analysis && (
            <AiInsightPanel
              title="التحليل الذكي للمبادرة"
              scores={{
                impact: { value: (analysis as any).impact_clarity, label: 'وضوح الأثر' },
                role: { value: (analysis as any).role_clarity, label: 'وضوح الدور' },
                verify: { value: (analysis as any).verifiability, label: 'قابلية التحقق' },
                innovation: { value: (analysis as any).innovation, label: 'الابتكار' },
              }}
              feedback={(analysis as any).feedback}
            />
          )}

          {/* الأزرار */}
          <div className="flex items-center gap-3 pt-2 border-t border-gold-200">
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {existing ? 'حفظ التعديلات' : 'إضافة المبادرة'}
            </button>
            <button type="button" onClick={handleAnalyze} disabled={analysisLoading || !form.name}
              className="px-4 py-2.5 border border-gold-400 text-gold-700 rounded-lg text-sm hover:bg-gold-50 disabled:opacity-50 flex items-center gap-2">
              {analysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              تحليل
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-darkgray hover:text-primary-700 text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
