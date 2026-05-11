'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RotateCcw, XCircle, AlertTriangle, Loader2, ClipboardCheck } from 'lucide-react';

interface Props {
  candidateId: string;
  currentStatus: string;
  aiScore: number;
  aiLevel: string;
  aiLeadershipType: string;
  aiStrengths: string[];
  aiGaps: string[];
}

const DECISION_OPTIONS = [
  { value: 'approve', label: 'اعتماد التصنيف', icon: CheckCircle2, color: 'bg-sage text-white hover:bg-sage/90', desc: 'اعتماد نهائي وإصدار البطاقة القيادية' },
  { value: 'return_for_completion', label: 'إعادة للاستكمال', icon: RotateCcw, color: 'bg-gold-500 text-white hover:bg-gold-600', desc: 'إعادة الملف للمرشح مع توضيح المطلوب' },
  { value: 'request_additional_evidence', label: 'طلب شواهد إضافية', icon: AlertTriangle, color: 'bg-steelblue text-white hover:bg-steelblue/90', desc: 'طلب أدلة أو شواهد إضافية قبل القرار' },
  { value: 'reject_classification', label: 'رفض التصنيف', icon: XCircle, color: 'bg-wine text-white hover:bg-wine/90', desc: 'رفض التصنيف مع توثيق السبب' },
];

const READINESS_LEVELS = [
  { value: 'ready_now', label: 'جاهز الآن (85٪+)' },
  { value: 'ready_within_year', label: 'جاهز خلال سنة (75-84٪)' },
  { value: 'promising', label: 'واعد (65-74٪)' },
  { value: 'specialist', label: 'متخصص جيد (55-64٪)' },
  { value: 'not_suitable', label: 'غير مناسب حالياً (<55٪)' },
  { value: 'high_performance_low_satisfaction', label: 'أداء مرتفع / رضا منخفض' },
  { value: 'human_leader', label: 'قائد إنساني محتمل' },
];

export function GovernanceDecisionPanel({ candidateId, currentStatus, aiScore, aiLevel, aiLeadershipType, aiStrengths, aiGaps }: Props) {
  const router = useRouter();
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [committeeNote, setCommitteeNote] = useState('');
  const [adjustScore, setAdjustScore] = useState(false);
  const [overrideScore, setOverrideScore] = useState(aiScore);
  const [overrideLevel, setOverrideLevel] = useState(aiLevel);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleDecision() {
    if (!decision || !reason) { setError('اختر قراراً واكتب سبب القرار'); return; }
    setSaving(true); setError(null);

    const isFinal = decision === 'approve';
    const url = isFinal
      ? `/api/governance/reviews/${candidateId}/finalize`
      : `/api/governance/reviews/${candidateId}/decide`;

    const body = isFinal ? {
      reason, committee_note: committeeNote,
      override_score: adjustScore ? overrideScore : undefined,
      override_level: adjustScore ? overrideLevel : undefined,
    } : { decision_type: decision, reason, committee_note: committeeNote };

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setSuccess(isFinal ? `تم إصدار البطاقة القيادية بنجاح — درجة ${data.total_score}٪` : 'تم تسجيل القرار بنجاح');
    setSaving(false);
    setTimeout(() => router.push('/governance/reviews'), 1500);
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  return (
    <div className="space-y-5" dir="rtl">
      {/* التصنيف الأولي من الذكاء الاصطناعي */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
        <div className="text-sm font-bold text-primary-700 mb-2">التصنيف الأولي من الذكاء الاصطناعي</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-darkgray">الدرجة: </span><strong className="text-gold-700">{aiScore}٪</strong></div>
          <div><span className="text-darkgray">المستوى: </span><strong className="text-primary-700">{aiLevel}</strong></div>
        </div>
        {aiStrengths.length > 0 && (
          <div className="mt-2 text-xs text-darkgray">قوة: {aiStrengths.slice(0, 3).join('، ')}</div>
        )}
        {aiGaps.length > 0 && (
          <div className="text-xs text-darkgray">فجوات: {aiGaps.slice(0, 2).join('، ')}</div>
        )}
      </div>

      {/* اختيار القرار */}
      <div>
        <label className={labelCls}>قرار اللجنة *</label>
        <div className="grid grid-cols-2 gap-2">
          {DECISION_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setDecision(opt.value)}
                className={`flex items-start gap-2 p-3 rounded-xl border-2 text-right transition-all ${
                  decision === opt.value
                    ? opt.color + ' border-transparent'
                    : 'bg-white border-gold-200 text-primary-700 hover:border-gold-400'
                }`}>
                <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* تعديل التصنيف (عند الاعتماد فقط) */}
      {decision === 'approve' && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input type="checkbox" checked={adjustScore} onChange={e => setAdjustScore(e.target.checked)}
              className="rounded border-gold-300 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">تعديل التصنيف (اختياري — اللجنة تستطيع تعديل الدرجة أو المستوى)</span>
          </label>
          {adjustScore && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div>
                <label className={labelCls}>تعديل الدرجة (0-100)</label>
                <input type="number" min={0} max={100} value={overrideScore} onChange={e => setOverrideScore(Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>تعديل المستوى</label>
                <select value={overrideLevel} onChange={e => setOverrideLevel(e.target.value)} className={inputCls}>
                  {READINESS_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="text-xs text-amber-700 flex items-start gap-1">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                أي تعديل على التصنيف يجب توثيق سببه في خانة السبب أدناه.
              </div>
            </div>
          )}
        </div>
      )}

      {/* السبب — إلزامي */}
      <div>
        <label className={labelCls}>سبب القرار * (إلزامي)</label>
        <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
          className={inputCls}
          placeholder="اشرح سبب القرار بوضوح. هذا الحقل يُسجَّل في سجل الحوكمة ولا يمكن تعديله لاحقاً..." />
        <div className="text-xs text-darkgray mt-1">{reason.length} حرف (30 حرف مطلوب على الأقل)</div>
      </div>

      {/* ملاحظة اللجنة */}
      <div>
        <label className={labelCls}>ملاحظة حوكمية (اختياري)</label>
        <textarea rows={2} value={committeeNote} onChange={e => setCommitteeNote(e.target.value)}
          className={inputCls}
          placeholder="ملاحظة للمرشح أو للموارد البشرية..." />
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage">{success}</div>}

      <button
        onClick={handleDecision}
        disabled={saving || !decision || reason.length < 30}
        className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />}
        {saving ? 'جارٍ تسجيل القرار...' : 'تأكيد القرار وتسجيله'}
      </button>

      <p className="text-xs text-darkgray text-center">
        القرار المسجَّل لا يمكن حذفه — يُحفظ في سجل الحوكمة ويُشكّل جزءاً من الأثر المؤسسي للملف.
      </p>
    </div>
  );
}
