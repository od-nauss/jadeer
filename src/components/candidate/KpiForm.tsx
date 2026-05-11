'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Brain } from 'lucide-react';
import { AiInsightPanel } from './AiInsightPanel';

interface KpiFormProps {
  onClose: () => void;
  existing?: Record<string, unknown>;
}

const KPI_TYPES = [
  { value: 'operational', label: 'تشغيلي' },
  { value: 'strategic', label: 'استراتيجي' },
  { value: 'financial', label: 'مالي' },
  { value: 'quality', label: 'جودة' },
  { value: 'time', label: 'زمني' },
  { value: 'satisfaction', label: 'رضا المستفيدين' },
  { value: 'productivity', label: 'إنتاجية' },
  { value: 'compliance', label: 'امتثال' },
  { value: 'training', label: 'تدريب' },
  { value: 'other', label: 'أخرى' },
];

export function KpiForm({ onClose, existing }: KpiFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [form, setForm] = useState({
    name: (existing?.name as string) || '',
    kpi_type: (existing?.kpi_type as string) || '',
    purpose: (existing?.purpose as string) || '',
    problem_addressed: (existing?.problem_addressed as string) || '',
    target_value: (existing?.target_value as string) || '',
    actual_value: (existing?.actual_value as string) || '',
    used_in_decision: (existing?.used_in_decision as string) || '',
    team_impact: (existing?.team_impact as string) || '',
    is_officially_approved: (existing?.is_officially_approved as boolean) || false,
    team_participated: (existing?.team_participated as boolean) || false,
    evidence: (existing?.evidence as string) || '',
    notes: (existing?.notes as string) || '',
  });

  function update(key: string, value: unknown) { setForm(p => ({ ...p, [key]: value })); }

  async function handleAnalyze() {
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/candidate/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, _dry_run: true }),
      });
      const data = await res.json();
      if (data.analysis) setAnalysis(data.analysis);
    } finally { setAnalysisLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError('اسم المؤشر مطلوب'); return; }
    if (!form.target_value) { setError('المستهدف مطلوب'); return; }
    setSaving(true); setError(null);
    try {
      const url = existing?.id ? `/api/candidate/kpis/${existing.id}` : '/api/candidate/kpis';
      const method = existing?.id ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
      setAnalysis(data.analysis);
      router.refresh();
      onClose();
    } catch { setError('حدث خطأ غير متوقع'); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 py-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200">
          <h2 className="text-xl font-bold text-primary-700">{existing ? 'تعديل مؤشر' : 'إضافة مؤشر أداء'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-darkgray" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>اسم المؤشر <span className="text-wine">*</span></label>
              <input value={form.name} onChange={e => update('name', e.target.value)} className={inputCls} placeholder="مثال: مؤشر وقت معالجة الطلب" required />
            </div>
            <div>
              <label className={labelCls}>نوع المؤشر</label>
              <select value={form.kpi_type} onChange={e => update('kpi_type', e.target.value)} className={inputCls}>
                <option value="">اختر النوع</option>
                {KPI_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>الغرض من المؤشر</label>
            <textarea rows={2} value={form.purpose} onChange={e => update('purpose', e.target.value)} className={inputCls} placeholder="ما الذي يقيسه هذا المؤشر ولماذا؟" />
          </div>

          <div>
            <label className={labelCls}>المشكلة التي يعالجها</label>
            <input value={form.problem_addressed} onChange={e => update('problem_addressed', e.target.value)} className={inputCls} placeholder="ما المشكلة التي دفعتك لاستخدام هذا المؤشر؟" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>المستهدف <span className="text-wine">*</span></label>
              <input value={form.target_value} onChange={e => update('target_value', e.target.value)} className={inputCls} placeholder="مثال: 3 أيام" required />
            </div>
            <div>
              <label className={labelCls}>النتيجة الفعلية</label>
              <input value={form.actual_value} onChange={e => update('actual_value', e.target.value)} className={inputCls} placeholder="مثال: 2.4 يوم" />
            </div>
          </div>

          <div>
            <label className={labelCls}>كيف استُخدم في اتخاذ قرار؟</label>
            <textarea rows={2} value={form.used_in_decision} onChange={e => update('used_in_decision', e.target.value)} className={inputCls} placeholder="مثال: استند المدير إليه لقرار إعادة توزيع المهام" />
          </div>

          <div>
            <label className={labelCls}>أثره على الفريق أو الإدارة</label>
            <textarea rows={2} value={form.team_impact} onChange={e => update('team_impact', e.target.value)} className={inputCls} placeholder="كيف أثّر هذا المؤشر على عمل الفريق؟" />
          </div>

          <div>
            <label className={labelCls}>الشواهد أو مصدر البيانات</label>
            <input value={form.evidence} onChange={e => update('evidence', e.target.value)} className={inputCls} placeholder="مثال: تقارير النظام الشهرية / اسم الجهة" />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_officially_approved}
                onChange={e => update('is_officially_approved', e.target.checked)}
                className="rounded border-gold-300 text-primary-600" />
              <span className="text-sm text-darkgray">معتمد رسمياً</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.team_participated}
                onChange={e => update('team_participated', e.target.checked)}
                className="rounded border-gold-300 text-primary-600" />
              <span className="text-sm text-darkgray">الفريق يشارك في استخدامه</span>
            </label>
          </div>

          {analysis && (
            <AiInsightPanel
              title="التحليل الذكي للمؤشر"
              scores={{
                def: { value: (analysis as any).definition_quality, label: 'جودة التعريف' },
                meas: { value: (analysis as any).measurement_quality, label: 'جودة القياس' },
                impact: { value: (analysis as any).decision_impact, label: 'الأثر على القرار' },
              }}
              feedback={(analysis as any).feedback}
            />
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-gold-200">
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {existing ? 'حفظ التعديلات' : 'إضافة المؤشر'}
            </button>
            <button type="button" onClick={handleAnalyze} disabled={analysisLoading || !form.name}
              className="px-4 py-2.5 border border-gold-400 text-gold-700 rounded-lg text-sm hover:bg-gold-50 disabled:opacity-50 flex items-center gap-2">
              {analysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              تحليل
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-darkgray text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
