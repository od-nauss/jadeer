'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle, Shield, Loader2, ChevronDown } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

interface GovernanceDecisionPanelProps {
  candidateId: string;
  currentStatus: string;
  aiScore: number;
  aiLevel: string;
  aiLeadershipType: string;
  aiStrengths: string[];
  aiGaps: string[];
}

const DECISION_OPTIONS = [
  {
    id: 'approved',
    label: 'اعتماد الترشيح',
    description: 'اعتماد المرشح رسمياً وإدراجه في قائمة التعاقب القيادي',
    icon: CheckCircle2,
    color: 'text-sage',
    bg: 'bg-sage/10 border-sage/30',
    activeBg: 'bg-sage text-white',
  },
  {
    id: 'conditional_approval',
    label: 'اعتماد مشروط',
    description: 'اعتماد مشروط بإكمال متطلبات محددة خلال مدة معينة',
    icon: Shield,
    color: 'text-steelblue',
    bg: 'bg-steelblue/10 border-steelblue/30',
    activeBg: 'bg-steelblue text-white',
  },
  {
    id: 'returned_for_completion',
    label: 'إعادة للاستكمال',
    description: 'إعادة الملف للمرشح لاستكمال بيانات أو متطلبات ناقصة',
    icon: RotateCcw,
    color: 'text-gold-700',
    bg: 'bg-gold-50 border-gold-200',
    activeBg: 'bg-gold-500 text-white',
  },
  {
    id: 'deferred',
    label: 'تأجيل القرار',
    description: 'تأجيل البت في الملف لحين توفر معلومات إضافية',
    icon: ChevronDown,
    color: 'text-primary-600',
    bg: 'bg-primary-50 border-primary-200',
    activeBg: 'bg-primary-600 text-white',
  },
  {
    id: 'rejected',
    label: 'رفض الترشيح',
    description: 'رفض الترشيح بصورة رسمية مع توثيق الأسباب',
    icon: XCircle,
    color: 'text-wine',
    bg: 'bg-rose-50 border-rose-200',
    activeBg: 'bg-wine text-white',
  },
];

const LEADERSHIP_TYPES_AR = [
  'قائد استراتيجي', 'قائد تحويلي', 'قائد إنساني', 'قائد تشغيلي',
  'قائد ابتكاري تقني', 'قائد تقني متخصص', 'قائد تطوير مؤسسي', 'قائد أزمات',
];

export function GovernanceDecisionPanel({
  candidateId,
  currentStatus,
  aiScore,
  aiLevel,
  aiLeadershipType,
  aiStrengths,
  aiGaps,
}: GovernanceDecisionPanelProps) {
  const [selectedDecision, setSelectedDecision] = useState('');
  const [reason, setReason] = useState('');
  const [conditions, setConditions] = useState('');
  const [leadershipType, setLeadershipType] = useState(aiLeadershipType || '');
  const [targetPositionNote, setTargetPositionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const alreadyDecided = ['approved', 'rejected'].includes(currentStatus);

  async function handleSubmit() {
    if (!selectedDecision) { setError('يرجى تحديد نوع القرار'); return; }
    if (!reason.trim() || reason.trim().length < 20) { setError('يرجى كتابة مسوغات القرار (20 حرف على الأقل)'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/governance/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfileId: candidateId,
          decisionType: selectedDecision,
          reason,
          conditions: selectedDecision === 'conditional_approval' ? conditions : undefined,
          leadershipType,
          targetPositionNote,
          aiScore,
          aiLevel,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'فشل في حفظ القرار');
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-16 w-16 text-sage mx-auto mb-4" />
        <h2 className="text-xl font-bold text-primary-700 mb-2">تم تسجيل القرار بنجاح</h2>
        <p className="text-darkgray text-sm">تم حفظ قرار اللجنة وإشعار الجهات المعنية.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition"
        >
          تحديث الصفحة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* توصية الذكاء الاصطناعي */}
      <Card title="توصية منظومة التحليل الذكي" className="bg-primary-50 border-primary-200">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary-700">{aiScore}٪</div>
            <div className="text-xs text-darkgray mt-1">الدرجة الكلية</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-sm font-bold text-gold-700">{aiLevel}</div>
            <div className="text-xs text-darkgray mt-1">مستوى الجاهزية</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-sm font-bold text-steelblue">{aiLeadershipType}</div>
            <div className="text-xs text-darkgray mt-1">النمط القيادي</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-sage mb-2">نقاط القوة المُرصدة:</div>
            <ul className="space-y-1">
              {aiStrengths.slice(0, 3).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-darkgray">
                  <span className="text-sage mt-0.5">✓</span>{s}
                </li>
              ))}
              {aiStrengths.length === 0 && <li className="text-darkgray">—</li>}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-amber-700 mb-2">فجوات التطوير:</div>
            <ul className="space-y-1">
              {aiGaps.slice(0, 3).map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-darkgray">
                  <span className="text-amber-600 mt-0.5">!</span>{g}
                </li>
              ))}
              {aiGaps.length === 0 && <li className="text-darkgray">—</li>}
            </ul>
          </div>
        </div>
      </Card>

      {alreadyDecided && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          ⚠ هذا الملف سبق اتخاذ قرار نهائي بشأنه. يمكنك إصدار قرار جديد لتجاوز السابق إذا اقتضت الحاجة.
        </div>
      )}

      {/* اختيار نوع القرار */}
      <Card title="نوع القرار">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DECISION_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isSelected = selectedDecision === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedDecision(opt.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${
                  isSelected ? opt.activeBg + ' border-transparent' : opt.bg + ' hover:opacity-80'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-current' : opt.color}`} />
                <div>
                  <div className={`font-bold text-sm ${isSelected ? '' : opt.color}`}>{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : 'text-darkgray'}`}>{opt.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* تصنيف نوع القيادة */}
      <Card title="تصنيف نوع القيادة (اختياري)">
        <p className="text-xs text-darkgray mb-3">يمكن للجنة تأكيد أو تعديل النمط القيادي المُرصد من النظام.</p>
        <div className="flex flex-wrap gap-2">
          {LEADERSHIP_TYPES_AR.map(lt => (
            <button
              key={lt}
              onClick={() => setLeadershipType(lt === leadershipType ? '' : lt)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                leadershipType === lt
                  ? 'bg-primary-700 text-white border-transparent'
                  : 'border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              {lt}
            </button>
          ))}
        </div>
      </Card>

      {/* الشروط (للاعتماد المشروط) */}
      {selectedDecision === 'conditional_approval' && (
        <Card title="شروط الاعتماد المشروط">
          <textarea
            value={conditions}
            onChange={e => setConditions(e.target.value)}
            rows={3}
            placeholder="حدد الشروط المطلوبة لاستكمال الاعتماد (مثل: إتمام برنامج تدريبي، تقديم وثائق، إجراء مقابلة تخصصية...)"
            className="w-full p-3 border border-gold-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
        </Card>
      )}

      {/* ملاحظة المنصب المستهدف */}
      <Card title="المنصب أو الدور المقترح (اختياري)">
        <input
          type="text"
          value={targetPositionNote}
          onChange={e => setTargetPositionNote(e.target.value)}
          placeholder="مثال: مدير إدارة الموارد البشرية، نائب مدير عام..."
          className="w-full p-3 border border-gold-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
        />
      </Card>

      {/* مسوغات القرار */}
      <Card title="مسوغات ودوافع القرار *">
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={5}
          placeholder="اكتب هنا مسوغات القرار بشكل واضح ومفصل. يجب أن تتضمن: أسباب القرار، الاستناد إلى البيانات والتقييمات، والتوقعات المستقبلية للمرشح..."
          className="w-full p-3 border border-gold-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-xs ${reason.trim().length < 20 ? 'text-wine' : 'text-sage'}`}>
            {reason.trim().length} حرف {reason.trim().length < 20 ? '(الحد الأدنى 20 حرفاً)' : '✓'}
          </span>
          <span className="text-xs text-darkgray">يُوصى بكتابة 100 حرف على الأقل للتوثيق المؤسسي</span>
        </div>
      </Card>

      {/* خطأ */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-wine text-sm">
          {error}
        </div>
      )}

      {/* زر الإرسال */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => { setSelectedDecision(''); setReason(''); setConditions(''); setError(''); }}
          className="px-6 py-3 border border-gold-200 text-primary-700 rounded-xl text-sm font-bold hover:bg-gold-50 transition"
        >
          إعادة تعيين
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedDecision}
          className="flex items-center gap-2 px-8 py-3 bg-primary-700 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              تسجيل قرار اللجنة
            </>
          )}
        </button>
      </div>
    </div>
  );
}
