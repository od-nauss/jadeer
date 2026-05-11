'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';

const COMP_TYPES = [
  { value: 'leadership', label: 'قيادية', desc: 'اختيار قيادات من مستوى محدد' },
  { value: 'operational', label: 'تشغيلية', desc: 'تأهيل للمناصب التشغيلية' },
  { value: 'technical', label: 'تقنية', desc: 'القيادات التقنية والرقمية' },
  { value: 'strategic', label: 'استراتيجية', desc: 'الأدوار الاستراتيجية العليا' },
  { value: 'development', label: 'تطويرية', desc: 'مسار إعداد وتأهيل' },
  { value: 'other', label: 'أخرى', desc: 'نوع مخصص' },
];

const ASSESSMENT_OPTIONS = [
  { code: 'leadership_influence', label: 'القيادة والتأثير' },
  { code: 'strategic_thinking', label: 'التفكير الاستراتيجي' },
  { code: 'decision_making', label: 'اتخاذ القرار' },
  { code: 'crisis_management', label: 'إدارة الأزمات' },
  { code: 'emotional_intelligence', label: 'الذكاء العاطفي' },
  { code: 'team_management', label: 'إدارة الفريق' },
  { code: 'tech_ai_usage', label: 'التقنية والذكاء الاصطناعي' },
  { code: 'case_study', label: 'دراسة الحالة' },
];

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', objective: '', target_group: '',
    competition_type: 'leadership',
    min_completion_score: 70, min_initiatives: 2, min_kpis: 2,
    requires_360: false, requires_governance_review: false,
    required_assessments: [] as string[],
    start_date: '', end_date: '',
  });

  function update(k: string, v: unknown) { setForm(p => ({ ...p, [k]: v })); }
  function toggleAssessment(code: string) {
    setForm(p => ({ ...p, required_assessments: p.required_assessments.includes(code) ? p.required_assessments.filter(c => c !== code) : [...p.required_assessments, code] }));
  }

  function generateAISuggestion() {
    const tips = [
      `نوع "${form.competition_type}" يناسب الاختبارات: القيادة والتأثير + اتخاذ القرار.`,
      `الحد الأدنى المقترح لاكتمال الملف: ${form.competition_type === 'leadership' ? '70' : '60'}٪.`,
      `مدة المسار المقترحة: ${form.requires_360 ? '90' : '45'} يوم.`,
      form.requires_governance_review ? `مع اعتماد لجنة الحوكمة، ضع في الاعتبار وقت المراجعة (7-14 يوم).` : '',
    ].filter(Boolean);
    setAiSuggestion(tips.join(' '));
  }

  async function handleSubmit() {
    if (!form.title) { setError('عنوان المسابقة مطلوب'); return; }
    setSaving(true); setError(null);
    const res = await fetch('/api/hr/competitions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        requirements_json: {
          min_completion_score: form.min_completion_score,
          min_initiatives: form.min_initiatives,
          min_kpis: form.min_kpis,
        },
        required_assessments_json: form.required_assessments,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    router.push(`/hr/competitions/${data.id}`);
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  const steps = [
    { n: 1, title: 'المعلومات الأساسية' },
    { n: 2, title: 'الاختبارات والمتطلبات' },
    { n: 3, title: 'التواريخ والإعدادات' },
    { n: 4, title: 'المراجعة والإطلاق' },
  ];

  return (
    <div dir="rtl">
      <PageHeader title="إنشاء مسابقة وظيفية" description="إنشاء مسابقة أو مسار تقييم مخصص مرتبط بمتطلبات منصة جدير." icon={<Trophy className="h-5 w-5" />} />

      {/* شريط الخطوات */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {steps.map(s => (
          <div key={s.n} className={`flex items-center gap-2 flex-shrink-0 ${s.n <= step ? 'text-primary-700' : 'text-darkgray'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${s.n < step ? 'bg-sage text-white' : s.n === step ? 'bg-primary-700 text-white' : 'bg-gold-100 text-darkgray'}`}>
              {s.n < step ? '✓' : s.n}
            </div>
            <span className="text-sm font-medium whitespace-nowrap">{s.title}</span>
            {s.n < steps.length && <ArrowLeft className="h-4 w-4 text-gold-400 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">{error}</div>}

      {/* الخطوة 1: المعلومات الأساسية */}
      {step === 1 && (
        <div className="space-y-4">
          <Card title="معلومات المسابقة">
            <div className="space-y-4">
              <div><label className={labelCls}>عنوان المسابقة *</label><input value={form.title} onChange={e => update('title', e.target.value)} className={inputCls} placeholder="مثال: مسابقة قيادات الصف الثاني 2026" /></div>
              <div><label className={labelCls}>وصف المسابقة</label><textarea rows={2} value={form.description} onChange={e => update('description', e.target.value)} className={inputCls} placeholder="وصف مختصر..." /></div>
              <div><label className={labelCls}>هدف المسابقة</label><textarea rows={2} value={form.objective} onChange={e => update('objective', e.target.value)} className={inputCls} placeholder="ما الهدف من هذه المسابقة؟" /></div>
              <div><label className={labelCls}>الفئة المستهدفة</label><input value={form.target_group} onChange={e => update('target_group', e.target.value)} className={inputCls} placeholder="مثال: موظفو الإدارات التشغيلية من فئة أ-ج" /></div>
            </div>
          </Card>
          <Card title="نوع المسابقة">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMP_TYPES.map(t => (
                <button key={t.value} onClick={() => update('competition_type', t.value)}
                  className={`p-3 rounded-xl border-2 text-right transition ${form.competition_type === t.value ? 'border-primary-700 bg-primary-50' : 'border-gold-200 hover:border-gold-400'}`}>
                  <div className="font-bold text-primary-700 text-sm">{t.label}</div>
                  <div className="text-xs text-darkgray mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* الخطوة 2: المتطلبات والاختبارات */}
      {step === 2 && (
        <div className="space-y-4">
          <Card title="الحد الأدنى لمتطلبات الملف">
            <div className="grid md:grid-cols-3 gap-4">
              <div><label className={labelCls}>الحد الأدنى لاكتمال الملف (%)</label><input type="number" min={0} max={100} value={form.min_completion_score} onChange={e => update('min_completion_score', Number(e.target.value))} className={inputCls} /></div>
              <div><label className={labelCls}>الحد الأدنى للمبادرات</label><input type="number" min={0} value={form.min_initiatives} onChange={e => update('min_initiatives', Number(e.target.value))} className={inputCls} /></div>
              <div><label className={labelCls}>الحد الأدنى للمؤشرات</label><input type="number" min={0} value={form.min_kpis} onChange={e => update('min_kpis', Number(e.target.value))} className={inputCls} /></div>
            </div>
            <div className="flex gap-4 mt-4">
              {[['requires_360', 'يتطلب تقييم 360°'], ['requires_governance_review', 'يتطلب اعتماد لجنة الحوكمة']].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form[k as keyof typeof form] as boolean} onChange={e => update(k, e.target.checked)} className="rounded border-gold-300 text-primary-600" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </Card>
          <Card title="الاختبارات المطلوبة">
            <div className="grid md:grid-cols-2 gap-2">
              {ASSESSMENT_OPTIONS.map(a => (
                <label key={a.code} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${form.required_assessments.includes(a.code) ? 'border-primary-300 bg-primary-50' : 'border-gold-200 hover:border-gold-400'}`}>
                  <input type="checkbox" checked={form.required_assessments.includes(a.code)} onChange={() => toggleAssessment(a.code)} className="rounded border-gold-300 text-primary-600" />
                  <span className="text-sm text-primary-700">{a.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* اقتراح ذكاء اصطناعي */}
          <div>
            <button onClick={generateAISuggestion} className="inline-flex items-center gap-2 px-4 py-2 border border-gold-400 text-gold-700 rounded-lg text-sm hover:bg-gold-50">
              <Brain className="h-4 w-4" />اقتراح ذكي للمتطلبات
            </button>
            {aiSuggestion && <div className="mt-3 p-3 bg-gold-50 border border-gold-200 rounded-xl text-sm text-primary-800">{aiSuggestion}</div>}
          </div>
        </div>
      )}

      {/* الخطوة 3: التواريخ */}
      {step === 3 && (
        <Card title="تواريخ المسابقة">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={labelCls}>تاريخ فتح التقديم</label><input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>تاريخ إغلاق التقديم</label><input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)} className={inputCls} /></div>
          </div>
        </Card>
      )}

      {/* الخطوة 4: المراجعة */}
      {step === 4 && (
        <div className="space-y-4">
          <Card title="ملخص المسابقة" className="bg-primary-50 border-primary-200">
            <div className="space-y-2 text-sm">
              {[
                { label: 'العنوان', val: form.title },
                { label: 'النوع', val: form.competition_type },
                { label: 'الفئة المستهدفة', val: form.target_group || '—' },
                { label: 'الحد الأدنى للاكتمال', val: `${form.min_completion_score}٪` },
                { label: 'الاختبارات', val: `${form.required_assessments.length} اختبار` },
                { label: 'يتطلب 360°', val: form.requires_360 ? 'نعم' : 'لا' },
                { label: 'يتطلب لجنة الحوكمة', val: form.requires_governance_review ? 'نعم' : 'لا' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between border-b border-primary-100 pb-1.5">
                  <span className="text-darkgray">{label}</span>
                  <span className="font-medium text-primary-700">{val}</span>
                </div>
              ))}
            </div>
          </Card>
          <p className="text-xs text-darkgray text-center">ستُنشأ المسابقة بحالة "مسودة" — يمكنك فتحها للتقديم لاحقاً.</p>
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 border border-gold-300 rounded-xl text-sm text-primary-700 hover:bg-gold-50 disabled:opacity-40">
          <ArrowRight className="h-4 w-4" />السابق
        </button>
        {step < 4 ? (
          <button onClick={() => { if (step === 1 && !form.title) { setError('العنوان مطلوب'); return; } setError(null); setStep(s => s + 1); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold">
            التالي <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-sage hover:bg-sage/90 text-white rounded-xl text-sm font-bold disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            إنشاء المسابقة
          </button>
        )}
      </div>
    </div>
  );
}
