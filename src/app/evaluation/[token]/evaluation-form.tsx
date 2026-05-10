'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

const AXES = [
  { key: 'leadership', label: 'القيادة والتأثير', desc: 'القدرة على توجيه الآخرين والتأثير الإيجابي عليهم' },
  { key: 'strategic', label: 'التفكير الاستراتيجي', desc: 'القدرة على رؤية الصورة الكبيرة والتخطيط طويل المدى' },
  { key: 'performance', label: 'الأداء والإنجاز', desc: 'تحقيق النتائج المطلوبة بجودة عالية' },
  { key: 'innovation', label: 'الابتكار والمبادرات', desc: 'القدرة على ابتكار حلول جديدة وقيادة المبادرات' },
  { key: 'team_satisfaction', label: 'رضا الفريق', desc: 'مستوى رضا فريق العمل عن قيادته' },
  { key: 'stakeholder_relations', label: 'علاقات أصحاب العلاقة', desc: 'إدارة علاقات الشراكات الداخلية والخارجية' },
  { key: 'communication', label: 'التواصل', desc: 'وضوح التواصل الكتابي والشفهي' },
  { key: 'crisis_management', label: 'إدارة الأزمات', desc: 'الأداء في الظروف الضاغطة وغير المتوقعة' },
  { key: 'decision_making', label: 'اتخاذ القرار', desc: 'سرعة وحكمة القرارات في الوقت المناسب' },
  { key: 'integrity', label: 'النزاهة والالتزام', desc: 'الالتزام بقيم المنظمة وأخلاقيات العمل' },
  { key: 'tech_ai', label: 'استخدام التقنية والذكاء الاصطناعي', desc: 'الاستفادة من الأدوات التقنية الحديثة' },
  { key: 'data_driven', label: 'الاعتماد على البيانات', desc: 'اتخاذ القرارات بناءً على المؤشرات لا الانطباع' },
  { key: 'team_development', label: 'تطوير الفريق', desc: 'الاستثمار في نمو الفريق وتطوير قدراتهم' },
  { key: 'institutional_loyalty', label: 'الولاء المؤسسي', desc: 'الانتماء والحرص على مصلحة المنظمة' },
];

const VERIFICATION_QUESTIONS = [
  { key: 'know_initiatives', label: 'هل يمكنك تأكيد المبادرات التي ذكرها المرشح في ملفه؟' },
  { key: 'team_satisfaction_check', label: 'كيف تصف رضا فريقه عن قيادته بشكل عام؟' },
  { key: 'recommend_for_leadership', label: 'هل تنصح بتكليفه بدور قيادي مباشر الآن؟' },
];

export function EvaluationForm({ token, linkId }: { token: string; linkId: string }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [verifications, setVerifications] = useState<Record<string, string>>({});
  const [generalNote, setGeneralNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAxis, setExpandedAxis] = useState<string | null>(null);

  function setScore(axisKey: string, value: number) {
    setScores((prev) => ({ ...prev, [axisKey]: value }));
  }

  function setComment(axisKey: string, value: string) {
    setComments((prev) => ({ ...prev, [axisKey]: value }));
  }

  const completed = AXES.filter((a) => scores[a.key] !== undefined).length;
  const verifiedCount = VERIFICATION_QUESTIONS.filter((q) => verifications[q.key]).length;
  const allCompleted = completed === AXES.length && verifiedCount === VERIFICATION_QUESTIONS.length;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/evaluation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          linkId,
          scores,
          comments,
          verifications,
          generalNote,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'فشل إرسال التقييم.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('حدث خطأ غير متوقع.');
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="institutional-card p-10 text-center">
        <CheckCircle2 className="h-16 w-16 text-sage mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary-700 mb-2">شكراً لمساهمتك</h2>
        <p className="text-darkgray text-sm leading-relaxed max-w-md mx-auto">
          تم استلام تقييمك بنجاح وحفظه في سجل اللجنة. مساهمتك جزء من ضمانات العدالة في منصة جدير.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* التقدم */}
      <div className="institutional-card p-4 mb-6 sticky top-4 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-primary-700">
            تقدم التقييم: {completed} / {AXES.length} محور + {verifiedCount} / {VERIFICATION_QUESTIONS.length} سؤال تحقق
          </div>
          <div className="text-sm font-bold text-gold-700">
            {Math.round(((completed + verifiedCount) / (AXES.length + VERIFICATION_QUESTIONS.length)) * 100)}%
          </div>
        </div>
        <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all"
            style={{ width: `${((completed + verifiedCount) / (AXES.length + VERIFICATION_QUESTIONS.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* المحاور */}
      <h2 className="text-lg font-bold text-primary-700 mb-3">المحاور (14)</h2>
      <div className="space-y-2 mb-6">
        {AXES.map((axis) => (
          <div key={axis.key} className="institutional-card overflow-hidden">
            <button
              onClick={() => setExpandedAxis(expandedAxis === axis.key ? null : axis.key)}
              className="w-full p-4 flex items-center justify-between hover:bg-gold-50 transition"
            >
              <div className="text-right flex-1">
                <div className="font-bold text-primary-700">{axis.label}</div>
                <div className="text-xs text-darkgray mt-0.5">{axis.desc}</div>
              </div>
              <div className="flex items-center gap-3">
                {scores[axis.key] !== undefined && (
                  <span className="px-2 py-1 bg-gold-500 text-white rounded text-sm font-bold">
                    {scores[axis.key]}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 text-darkgray transition-transform ${expandedAxis === axis.key ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expandedAxis === axis.key && (
              <div className="p-4 pt-0 border-t border-gold-100 bg-gold-50/30">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    التقييم على مقياس 1-10
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setScore(axis.key, n)}
                        className={`h-10 w-10 rounded-lg text-sm font-bold transition ${
                          scores[axis.key] === n
                            ? 'bg-primary-700 text-white'
                            : 'bg-white border border-gold-300 text-darkgray hover:border-primary-500'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    تعليق (اختياري)
                  </label>
                  <textarea
                    value={comments[axis.key] || ''}
                    onChange={(e) => setComment(axis.key, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                    placeholder="ملاحظة قصيرة لتوضيح التقييم..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* أسئلة التحقق */}
      <h2 className="text-lg font-bold text-primary-700 mb-3">أسئلة التحقق</h2>
      <div className="institutional-card p-5 mb-6 space-y-4">
        {VERIFICATION_QUESTIONS.map((q) => (
          <div key={q.key}>
            <label className="block text-sm font-medium text-primary-700 mb-2">{q.label}</label>
            <div className="flex flex-wrap gap-2">
              {['نعم', 'إلى حد ما', 'لا أعرف', 'لا'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setVerifications((prev) => ({ ...prev, [q.key]: opt }))}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    verifications[q.key] === opt
                      ? 'bg-primary-700 text-white'
                      : 'bg-white border border-gold-300 text-darkgray hover:border-primary-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ملاحظة عامة */}
      <div className="institutional-card p-5 mb-6">
        <label className="block text-sm font-medium text-primary-700 mb-2">
          ملاحظة عامة للجنة الحوكمة (اختياري)
        </label>
        <textarea
          value={generalNote}
          onChange={(e) => setGeneralNote(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
          placeholder="أي ملاحظة قيادية تستحق نظر اللجنة..."
        />
      </div>

      {error && (
        <div className="institutional-card p-4 mb-4 bg-rose-50 border-rose-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-wine" />
          <span className="text-wine text-sm">{error}</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allCompleted || submitting}
        className="w-full py-3 bg-primary-700 hover:bg-primary-800 disabled:bg-darkgray disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            جارٍ الإرسال...
          </>
        ) : !allCompleted ? (
          'أكمل جميع المحاور وأسئلة التحقق للإرسال'
        ) : (
          'إرسال التقييم'
        )}
      </button>
    </div>
  );
}
