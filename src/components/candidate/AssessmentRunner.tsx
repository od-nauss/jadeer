'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options_json: {
    options?: string[];
    items?: string[];
  };
  display_order: number;
}

interface AssessmentRunnerProps {
  assessmentId: string;
  assessmentTitle: string;
  questions: Question[];
  resultId: string;
  durationMinutes: number;
}

export function AssessmentRunner({ assessmentId, assessmentTitle, questions, resultId, durationMinutes }: AssessmentRunnerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ score: number; thinking_pattern: string } | null>(null);
  const [rankOrder, setRankOrder] = useState<string[]>([]);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const isAnswered = answers[q?.id] !== undefined;

  function setAnswer(value: unknown) {
    setAnswers(p => ({ ...p, [q.id]: value }));
  }

  // Ranking drag helpers (simple click-to-order)
  const initRank = useCallback(() => {
    if (q?.options_json?.items && (!rankOrder.length || rankOrder[0] !== q.id)) {
      setRankOrder([...q.options_json.items]);
    }
  }, [q, rankOrder]);

  function moveRankItem(index: number, direction: 'up' | 'down') {
    const newOrder = [...rankOrder];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setRankOrder(newOrder);
    setAnswer(newOrder);
  }

  function goNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setRankOrder([]);
    }
  }

  function goPrev() {
    if (current > 0) {
      setCurrent(c => c - 1);
      setRankOrder([]);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/candidate/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, answers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setDone(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done && result) {
    return (
      <div className="max-w-lg mx-auto text-center py-12" dir="rtl">
        <div className="h-24 w-24 bg-gradient-to-br from-sage to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-primary-700 mb-2">أكملت الاختبار!</h2>
        <p className="text-darkgray mb-6">{assessmentTitle}</p>
        <div className="institutional-card p-6 mb-6">
          <div className="text-4xl font-bold text-gold-700 mb-1">{result.score}%</div>
          <div className="text-sm text-darkgray mb-4">النتيجة الكلية</div>
          <div className="bg-gold-50 border border-gold-200 rounded-lg px-4 py-3">
            <div className="text-xs text-darkgray mb-1">نمط التفكير</div>
            <div className="font-bold text-primary-700">{result.thinking_pattern}</div>
          </div>
        </div>
        <button onClick={() => router.push('/candidate/assessments')}
          className="btn-primary px-8 py-3 rounded-xl font-bold">
          العودة للاختبارات
        </button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-primary-700">{assessmentTitle}</h2>
          <div className="flex items-center gap-1.5 text-sm text-darkgray">
            <Clock className="h-4 w-4" />
            <span>{durationMinutes} دقيقة</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-primary-600 to-primary-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-darkgray mt-1">
          <span>السؤال {current + 1} من {questions.length}</span>
          <span>{Math.round(progress)}% مكتمل</span>
        </div>
      </div>

      {/* Question card */}
      <div className="institutional-card p-6 mb-4">
        <div className="flex items-start gap-3 mb-5">
          <span className="h-8 w-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {current + 1}
          </span>
          <p className="text-primary-800 font-medium leading-relaxed">{q.question_text}</p>
        </div>

        {/* Multiple choice / situation / best_decision */}
        {['multiple_choice', 'situation', 'best_decision', 'case_analysis'].includes(q.question_type) && q.options_json?.options && (
          <div className="space-y-2">
            {q.options_json.options.map((opt, i) => (
              <button key={i}
                onClick={() => setAnswer(opt)}
                className={cn(
                  'w-full text-right px-4 py-3 rounded-xl border-2 text-sm transition-all',
                  answers[q.id] === opt
                    ? 'border-primary-600 bg-primary-50 text-primary-800 font-medium'
                    : 'border-gold-200 hover:border-gold-400 hover:bg-gold-50 text-primary-700'
                )}>
                <span className="font-bold text-gold-600 ml-2">{String.fromCharCode(0x0627 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Priority ranking */}
        {q.question_type === 'priority_ranking' && q.options_json?.items && (
          <div className="space-y-2">
            <p className="text-xs text-darkgray mb-3">رتّب العناصر من الأهم (أعلى) إلى الأقل أهمية (أسفل) باستخدام الأسهم:</p>
            {(rankOrder.length > 0 ? rankOrder : q.options_json.items).map((item, i) => {
              if (rankOrder.length === 0 && i === 0) initRank();
              return (
                <div key={i}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gold-50 border border-gold-200 rounded-lg">
                  <span className="h-6 w-6 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm text-primary-800">{item}</span>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => { initRank(); moveRankItem(i, 'up'); }}
                      disabled={i === 0}
                      className="p-0.5 text-gold-600 hover:text-primary-700 disabled:opacity-20">
                      <ChevronRight className="h-4 w-4 rotate-[-90deg]" />
                    </button>
                    <button onClick={() => { initRank(); moveRankItem(i, 'down'); }}
                      disabled={i === (rankOrder.length || q.options_json.items!.length) - 1}
                      className="p-0.5 text-gold-600 hover:text-primary-700 disabled:opacity-20">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </button>
                  </div>
                </div>
              );
            })}
            {rankOrder.length === 0 && (
              <button onClick={() => { initRank(); setAnswer(q.options_json.items!); }}
                className="w-full py-2 text-sm text-primary-700 border border-dashed border-primary-300 rounded-lg hover:bg-primary-50">
                انقر للبدء بالترتيب
              </button>
            )}
          </div>
        )}

        {/* Short text */}
        {q.question_type === 'short_text' && (
          <div>
            <textarea
              rows={4}
              value={(answers[q.id] as string) || ''}
              onChange={e => setAnswer(e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              className="w-full px-4 py-3 border border-gold-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
            />
            <div className="text-xs text-darkgray mt-1">
              {((answers[q.id] as string) || '').length} حرف
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goPrev} disabled={current === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-gold-300 rounded-xl text-sm text-primary-700 hover:bg-gold-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
          السابق
        </button>

        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                i === current ? 'bg-primary-600 w-4' : answers[questions[i].id] !== undefined ? 'bg-sage' : 'bg-gold-200'
              )} />
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={goNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold">
            التالي
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage/90 text-white rounded-xl text-sm font-bold disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            إنهاء الاختبار
          </button>
        )}
      </div>

      {/* Warning if unanswered */}
      {!isAnswered && q.question_type !== 'short_text' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gold-700 justify-center">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>يمكنك الانتقال للسؤال التالي دون إجابة</span>
        </div>
      )}
    </div>
  );
}
