'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, Clock, Loader2, Shield, Eye } from 'lucide-react';

interface Props {
  cardId: string;
  profileId: string;
  isPublished: boolean;
  currentDecision: string | null;
}

const ACTIONS = [
  {
    id: 'publish',
    label: 'نشر البطاقة واعتمادها',
    desc: 'تنشر البطاقة رسمياً وتُتاح للرئيس والمستشارين',
    icon: CheckCircle2,
    style: 'bg-sage text-white hover:bg-green-700 border-transparent',
    requiresReason: false,
  },
  {
    id: 'conditional',
    label: 'اعتماد مشروط',
    desc: 'اعتماد مؤقت مع تحديد شروط للنشر الكامل',
    icon: Clock,
    style: 'bg-steelblue text-white hover:bg-blue-700 border-transparent',
    requiresReason: true,
  },
  {
    id: 'return',
    label: 'إعادة للمراجعة',
    desc: 'إرجاع الملف لإعادة التقييم أو استكمال البيانات',
    icon: RotateCcw,
    style: 'bg-gold-500 text-white hover:bg-gold-600 border-transparent',
    requiresReason: true,
  },
];

export function ResultApprovalPanel({ cardId, profileId, isPublished, currentDecision }: Props) {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const selected = ACTIONS.find(a => a.id === action);

  async function handleSubmit() {
    if (!action) { setError('اختر قراراً أولاً'); return; }
    if (selected?.requiresReason && reason.trim().length < 15) {
      setError('يرجى كتابة مسوّغات القرار (15 حرفاً على الأقل)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. نشر/إلغاء نشر البطاقة
      const publish = action === 'publish' || action === 'conditional';
      const cardRes = await fetch('/api/governance/cards/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, publish, profileId }),
      });
      if (!cardRes.ok) throw new Error('فشل تحديث حالة البطاقة');

      // 2. تسجيل قرار اللجنة
      const decType = action === 'publish' ? 'approved'
        : action === 'conditional' ? 'conditional_approval'
        : 'returned_for_completion';

      await fetch('/api/governance/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfileId: profileId,
          decisionType: decType,
          reason: reason || (action === 'publish' ? 'اعتمدت اللجنة نشر البطاقة القيادية بناءً على مراجعة النتائج.' : ''),
          conditions: action === 'conditional' ? conditions : undefined,
        }),
      });

      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-sage mx-auto mb-3" />
        <h3 className="font-bold text-primary-700 text-lg mb-1">تم تنفيذ القرار بنجاح</h3>
        <p className="text-sm text-darkgray mb-4">تم حفظ قرار اللجنة وتحديث حالة البطاقة القيادية.</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-700 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition">
          تحديث الصفحة
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary-600" />
        <h3 className="font-bold text-primary-700 text-base">قرار اللجنة على البطاقة القيادية</h3>
        {isPublished && (
          <span className="flex items-center gap-1 text-xs text-sage bg-green-100 px-2 py-0.5 rounded-lg">
            <Eye className="h-3 w-3" />منشورة حالياً
          </span>
        )}
      </div>

      {isPublished && !currentDecision && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage">
          ✓ البطاقة منشورة ومتاحة. يمكنك إصدار قرار جديد لتحديثها إذا اقتضت الحاجة.
        </div>
      )}

      {/* خيارات القرار */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          const isSelected = action === a.id;
          return (
            <button key={a.id} onClick={() => setAction(a.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all text-sm ${
                isSelected ? a.style + ' shadow-md scale-[1.02]' : 'bg-white border-gold-200 text-primary-700 hover:border-primary-300 hover:bg-primary-50/50'
              }`}>
              <Icon className="h-5 w-5" />
              <span className="font-bold">{a.label}</span>
              <span className={`text-xs ${isSelected ? 'opacity-80' : 'text-darkgray'}`}>{a.desc}</span>
            </button>
          );
        })}
      </div>

      {/* شروط الاعتماد المشروط */}
      {action === 'conditional' && (
        <div className="mb-3">
          <label className="block text-xs font-bold text-primary-700 mb-1">الشروط المطلوبة</label>
          <input
            type="text"
            value={conditions}
            onChange={e => setConditions(e.target.value)}
            placeholder="مثال: إتمام برنامج تطوير قيادي خلال 6 أشهر..."
            className="w-full px-3 py-2 border border-gold-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
        </div>
      )}

      {/* مسوّغات القرار */}
      {action && (
        <div className="mb-4">
          <label className="block text-xs font-bold text-primary-700 mb-1">
            {selected?.requiresReason ? 'مسوّغات القرار *' : 'ملاحظات إضافية (اختياري)'}
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="اكتب هنا مبررات قرار اللجنة..."
            className="w-full px-3 py-2 border border-gold-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
          <div className={`text-xs mt-1 ${reason.length < 15 && selected?.requiresReason ? 'text-wine' : 'text-sage'}`}>
            {reason.length} حرف
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">{error}</div>
      )}

      <div className="flex justify-end gap-3">
        {action && (
          <button onClick={() => { setAction(''); setReason(''); setConditions(''); setError(''); }}
            className="px-4 py-2 text-sm text-darkgray hover:text-primary-700 border border-gold-200 rounded-xl">
            إلغاء
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !action}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {loading ? 'جارٍ الحفظ...' : 'تأكيد القرار'}
        </button>
      </div>
    </div>
  );
}
