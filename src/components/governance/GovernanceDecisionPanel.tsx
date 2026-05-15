'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RotateCcw, XCircle, AlertTriangle, Loader2, Brain, Shield } from 'lucide-react';

interface Props {
  candidateId: string;
  currentStatus: string;
  aiScore: number;
  aiLevel: string;
  aiLeadershipType: string;
  aiStrengths: string[];
  aiGaps: string[];
}

export function GovernanceDecisionPanel({
  candidateId, currentStatus, aiScore, aiLevel, aiLeadershipType, aiStrengths, aiGaps,
}: Props) {
  const router = useRouter();
  const [decision, setDecision] = useState<'approve_process' | 'return' | 'reject' | ''>('');
  const [processConcerns, setProcessConcerns] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleDecision() {
    if (!decision) { setError('اختر قراراً'); return; }
    if (reason.length < 20) { setError('اكتب سبباً واضحاً (20 حرف على الأقل)'); return; }
    setSaving(true); setError(null);

    let url: string;
    let body: object;

    if (decision === 'approve_process') {
      // اللجنة تُقرّ سلامة العملية → الذكاء الاصطناعي يُصدر البطاقة
      url = `/api/governance/reviews/${candidateId}/finalize`;
      body = {
        process_approved: true,
        process_concerns: processConcerns || undefined,
      };
    } else if (decision === 'return') {
      url = `/api/governance/reviews/${candidateId}/finalize`;
      body = { process_approved: false, return_reason: reason };
    } else {
      url = `/api/governance/reviews/${candidateId}/finalize`;
      body = { process_approved: false, reject_reason: reason };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'حدث خطأ'); setSaving(false); return; }

    if (decision === 'approve_process') {
      setSuccess(`✅ اعتمدت اللجنة سلامة العملية — الذكاء الاصطناعي أصدر البطاقة بدرجة ${data.ai_score}٪`);
    } else {
      setSuccess('تم تسجيل قرار اللجنة بنجاح');
    }
    setSaving(false);
    setTimeout(() => router.push('/governance/reviews'), 2000);
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  return (
    <div className="space-y-5" dir="rtl">

      {/* رسالة دور الذكاء الاصطناعي */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-gold-600" />
          <span className="font-bold text-primary-700 text-sm">تحليل الذكاء الاصطناعي — النتيجة المحسوبة</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div><span className="text-darkgray">الدرجة: </span><strong className="text-2xl text-gold-700">{aiScore}٪</strong></div>
          <div><span className="text-darkgray">التصنيف: </span><strong className="text-primary-700">{aiLevel}</strong></div>
          <div><span className="text-darkgray">نوع القيادة: </span><strong className="text-primary-700">{aiLeadershipType}</strong></div>
        </div>
        {aiStrengths.length > 0 && (
          <div className="text-xs text-sage mb-1">✓ نقاط قوة: {aiStrengths.slice(0, 3).join('، ')}</div>
        )}
        {aiGaps.length > 0 && (
          <div className="text-xs text-wine">• فجوات: {aiGaps.slice(0, 3).join('، ')}</div>
        )}
        <div className="mt-3 p-2 bg-white border border-primary-100 rounded-lg text-xs text-primary-700">
          <Shield className="h-3 w-3 inline ml-1" />
          <strong>دور اللجنة:</strong> التحقق من سلامة العملية وخلوّها من التحيز — الدرجة صادرة من الذكاء الاصطناعي ولا تُعدَّل يدوياً.
        </div>
      </div>

      {/* قرار اللجنة */}
      <div>
        <label className={labelCls}>قرار اللجنة *</label>
        <div className="space-y-2">
          {/* اعتماد العملية */}
          <button
            onClick={() => setDecision('approve_process')}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${
              decision === 'approve_process'
                ? 'border-sage bg-sage/10'
                : 'border-gold-200 hover:border-sage/50 bg-white'
            }`}
          >
            <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${decision === 'approve_process' ? 'text-sage' : 'text-darkgray'}`} />
            <div>
              <div className="font-bold text-sm text-primary-700">اعتماد سلامة العملية</div>
              <div className="text-xs text-darkgray mt-0.5">
                العملية نظيفة — المقيّمون موثوقون، لا تحيز ظاهر، الشواهد كافية.<br />
                سيُصدر الذكاء الاصطناعي البطاقة القيادية فوراً.
              </div>
            </div>
          </button>

          {/* إعادة للاستكمال */}
          <button
            onClick={() => setDecision('return')}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${
              decision === 'return'
                ? 'border-amber-500 bg-amber-50'
                : 'border-gold-200 hover:border-amber-300 bg-white'
            }`}
          >
            <RotateCcw className={`h-5 w-5 flex-shrink-0 mt-0.5 ${decision === 'return' ? 'text-amber-600' : 'text-darkgray'}`} />
            <div>
              <div className="font-bold text-sm text-primary-700">إعادة الملف — يحتاج معلومات إضافية</div>
              <div className="text-xs text-darkgray mt-0.5">
                رصدت اللجنة نقصاً في الشواهد أو المعلومات يمنع إقرار العملية.
              </div>
            </div>
          </button>

          {/* رفض العملية */}
          <button
            onClick={() => setDecision('reject')}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${
              decision === 'reject'
                ? 'border-wine bg-rose-50'
                : 'border-gold-200 hover:border-rose-300 bg-white'
            }`}
          >
            <XCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${decision === 'reject' ? 'text-wine' : 'text-darkgray'}`} />
            <div>
              <div className="font-bold text-sm text-primary-700">رفض العملية — خلل جوهري في الإجراءات</div>
              <div className="text-xs text-darkgray mt-0.5">
                رصدت اللجنة تحيزاً أو مخالفة في العملية تستوجب الرفض الكامل.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ملاحظات على العملية — عند الاعتماد */}
      {decision === 'approve_process' && (
        <div>
          <label className={labelCls}>ملاحظات اللجنة على العملية (اختياري)</label>
          <textarea rows={2} value={processConcerns} onChange={e => setProcessConcerns(e.target.value)}
            className={inputCls}
            placeholder="ملاحظات إضافية للسجل — لا تؤثر على الدرجة..." />
          <div className="text-xs text-darkgray mt-1">
            هذه الملاحظات تُضاف للسجل فقط — البطاقة تصدر بنتيجة الذكاء الاصطناعي كما هي.
          </div>
        </div>
      )}

      {/* السبب — إلزامي للإعادة والرفض */}
      {(decision === 'return' || decision === 'reject') && (
        <div>
          <label className={labelCls}>
            {decision === 'return' ? 'وصف النقص المطلوب *' : 'سبب رفض العملية *'}
          </label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
            className={inputCls}
            placeholder={decision === 'return'
              ? 'صِف بوضوح ما ينقص من شواهد أو معلومات...'
              : 'صِف الخلل أو التحيز المرصود بوضوح...'
            }
          />
          <div className="text-xs text-darkgray mt-1">{reason.length} حرف (20 مطلوب)</div>
        </div>
      )}

      {/* سبب عند الاعتماد أيضاً (للسجل) */}
      {decision === 'approve_process' && (
        <div>
          <label className={labelCls}>تأكيد السلامة * (للسجل الحوكمي)</label>
          <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
            className={inputCls}
            placeholder="مثال: راجعت المقيّمين، الشواهد كافية، لا تحيز ظاهر، العملية سليمة..."
          />
          <div className="text-xs text-darkgray mt-1">{reason.length} حرف (20 مطلوب)</div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-sm text-wine">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage font-medium">
          {success}
        </div>
      )}

      <button
        onClick={handleDecision}
        disabled={saving || !decision || reason.length < 20}
        className={`w-full py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 text-base transition ${
          decision === 'approve_process'
            ? 'bg-sage hover:bg-sage/90 text-white'
            : decision === 'reject'
            ? 'bg-wine hover:bg-wine/90 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
        }`}
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
        {saving ? 'جارٍ تسجيل القرار...' :
          decision === 'approve_process' ? 'اعتماد العملية — إصدار البطاقة' :
          decision === 'return' ? 'إعادة الملف للاستكمال' :
          decision === 'reject' ? 'رفض العملية' : 'تأكيد القرار'
        }
      </button>

      <p className="text-xs text-darkgray text-center">
        قرار اللجنة محفوظ في سجل الحوكمة ولا يمكن حذفه. البطاقة القيادية تصدر من الذكاء الاصطناعي عند اعتماد العملية.
      </p>
    </div>
  );
}
