'use client';

import { Brain, CheckCircle2, AlertTriangle, Info, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Feedback {
  type: 'success' | 'warning' | 'info' | 'error';
  text: string;
}

interface Score {
  score: number;
  label: string;
  color: 'sage' | 'primary' | 'gold' | 'wine';
}

interface AiInsightPanelProps {
  title?: string;
  scores?: Record<string, { value: Score; label: string }>;
  feedback?: Feedback[];
  collapsed?: boolean;
  loading?: boolean;
}

const typeIcon = {
  success: <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />,
  info: <Info className="h-4 w-4 text-steelblue flex-shrink-0 mt-0.5" />,
  error: <XCircle className="h-4 w-4 text-wine flex-shrink-0 mt-0.5" />,
};

const colorBar: Record<string, string> = {
  sage: 'bg-sage',
  primary: 'bg-primary-600',
  gold: 'bg-gold-500',
  wine: 'bg-wine',
};

const colorText: Record<string, string> = {
  sage: 'text-sage',
  primary: 'text-primary-600',
  gold: 'text-gold-700',
  wine: 'text-wine',
};

export function AiInsightPanel({ title = 'التحليل الذكي', scores, feedback, collapsed = false, loading = false }: AiInsightPanelProps) {
  const [open, setOpen] = useState(!collapsed);

  if (loading) {
    return (
      <div className="border border-gold-200 rounded-xl p-4 bg-gold-50 animate-pulse">
        <div className="h-4 bg-gold-200 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gold-200 rounded w-full" />
          <div className="h-3 bg-gold-200 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!feedback?.length && !scores) return null;

  return (
    <div className="border border-gold-300 rounded-xl overflow-hidden bg-gradient-to-br from-gold-50 to-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gold-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-primary-700">
          <Brain className="h-4 w-4 text-gold-600" />
          {title}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gold-600" /> : <ChevronDown className="h-4 w-4 text-gold-600" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* نقاط الأبعاد */}
          {scores && Object.keys(scores).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(scores).map(([key, { value, label }]) => (
                <div key={key} className="bg-white rounded-lg p-2.5 border border-gold-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-darkgray">{label}</span>
                    <span className={cn('text-sm font-bold', colorText[value.color])}>{value.score}</span>
                  </div>
                  <div className="h-1.5 bg-gold-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', colorBar[value.color])}
                      style={{ width: `${value.score}%` }}
                    />
                  </div>
                  <div className="text-xs text-darkgray mt-1">{value.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* الملاحظات */}
          {feedback && feedback.length > 0 && (
            <div className="space-y-2">
              {feedback.map((f, i) => (
                <div key={i} className={cn(
                  'flex items-start gap-2 p-2.5 rounded-lg text-sm',
                  f.type === 'success' && 'bg-green-50 border border-green-100',
                  f.type === 'warning' && 'bg-amber-50 border border-amber-100',
                  f.type === 'info' && 'bg-blue-50 border border-blue-100',
                  f.type === 'error' && 'bg-rose-50 border border-rose-100',
                )}>
                  {typeIcon[f.type]}
                  <span className="text-primary-800 leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
