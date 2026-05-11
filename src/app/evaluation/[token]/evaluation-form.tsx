'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const SECTIONS = [
  {
    id: 'trust',
    title: 'الثقة والنزاهة',
    axes: [
      { key: 'integrity', label: 'النزاهة والالتزام المؤسسي', desc: 'الالتزام بقيم المنظمة وأخلاقيات العمل' },
      { key: 'institutional_loyalty', label: 'الولاء المؤسسي', desc: 'الانتماء والحرص على مصلحة المنظمة' },
    ],
  },
  {
    id: 'leadership',
    title: 'القيادة والتأثير',
    axes: [
      { key: 'leadership', label: 'القيادة والتأثير', desc: 'القدرة على توجيه الآخرين والتأثير الإيجابي' },
      { key: 'decision_making', label: 'اتخاذ القرار', desc: 'سرعة وحكمة القرارات في الوقت المناسب' },
      { key: 'crisis_management', label: 'إدارة الأزمات', desc: 'الأداء في الظروف الضاغطة وغير المتوقعة' },
      { key: 'strategic', label: 'التفكير الاستراتيجي', desc: 'رؤية الصورة الكبيرة والتخطيط طويل المدى' },
    ],
  },
  {
    id: 'team',
    title: 'العلاقات والفريق',
    axes: [
      { key: 'communication', label: 'التواصل', desc: 'وضوح التواصل الكتابي والشفهي' },
      { key: 'team_satisfaction', label: 'رضا الفريق', desc: 'مستوى رضا فريق العمل عن قيادته' },
      { key: 'team_development', label: 'تطوير الفريق', desc: 'الاستثمار في نمو الفريق وتطوير قدراتهم' },
      { key: 'stakeholder_relations', label: 'علاقات أصحاب العلاقة', desc: 'إدارة الشراكات الداخلية والخارجية' },
    ],
  },
  {
    id: 'performance',
    title: 'الأداء والابتكار',
    axes: [
      { key: 'performance', label: 'تحقيق النتائج', desc: 'تحقيق النتائج المطلوبة بجودة عالية' },
      { key: 'innovation', label: 'الابتكار والمبادرات', desc: 'ابتكار حلول جديدة وقيادة المبادرات' },
      { key: 'tech_ai', label: 'استخدام التقنية والذكاء الاصطناعي', desc: 'الاستفادة من الأدوات التقنية الحديثة' },
      { key: 'data_driven', label: 'الاعتماد على البيانات', desc: 'اتخاذ القرارات بناءً على المؤشرات لا الانطباع' },
    ],
  },
];

interface Initiative { id: string; name: string; }
interface Kpi { id: string; name: string; }

interface Props {
  token: string;
  linkId: string;
  initiatives?: Initiative[];
  kpis?: Kpi[];
  canVerifyInitiatives?: boolean;
  canVerifyKpis?: boolean;
}

const SCORE_LABELS = ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];
const SCORE_COLORS = ['', 'bg-wine text-white', 'bg-gold-400 text-white', 'bg-gold-500 text-white', 'bg-primary-600 text-white', 'bg-sage text-white'];

export function EvaluationForm({ token, linkId, initiatives = [], kpis = [], canVerifyInitiatives = false, canVerifyKpis = false }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [iniVerifications, setIniVerifications] = useState<Record<string, string>>({});
  const [kpiVerifications, setKpiVerifications] = useState<Record<string, string>>({});
  const [generalAnswers, setGeneralAnswers] = useState({ strengths: '', gaps: '', leadership_ready: '', extra_note: '' });
  const [generalNote, setGeneralNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ trust: true, leadership: true });
  const [agreed, setAgreed] = useState(false);

  const totalAxes = SECTIONS.flatMap(s => s.axes).length;
  const completedAxes = SECTIONS.flatMap(s => s.axes).filter(a => scores[a.key] !== undefined).length;

  function setScore(axis: string, val: number) { setScores(p => ({ ...p, [axis]: val })); }
  function setComment(axis: string, val: string) { setComments(p => ({ ...p, [axis]: val })); }

  async function handleSubmit() {
    if (completedAxes < totalAxes) { setError('يرجى تقييم جميع المحاور قبل الإرسال.'); return; }
    if (!agreed) { setError('يجب الموافقة على إقرار الدقة.'); return; }
    setSubmitting(true); setError(null);
    try {
      const scoresJson: Record<string, { score: number; comment?: string }> = {};
      for (const s of SECTIONS) {
        for (const a of s.axes) {
          scoresJson[a.key] = { score: scores[a.key], comment: comments[a.key] || '' };
        }
      }
      const res = await fetch('/api/evaluation/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, linkId, scores: scoresJson,
          initiative_verifications_json: iniVerifications,
          kpi_verifications_json: kpiVerifications,
          generalNote: [generalNote, JSON.stringify(generalAnswers)].filter(Boolean).join('\n'),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ.'); return; }
      setSuccess(true);
    } catch { setError('حدث خطأ غير متوقع.'); }
    finally { setSubmitting(false); }
  }

  if (success) {
    return (
      <div className="institutional-card p-10 text-center" dir="rtl">
        <div className="h-20 w-20 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-primary-700 mb-3">شكراً لمشاركتك</h2>
        <p className="text-darkgray text-sm leading-relaxed max-w-md mx-auto">
          تم استلام تقييمك. إجاباتك ستُحلَّل ضمن تقييم جماعي من قِبل لجنة الحوكمة.
          هذا الرابط لم يعد صالحاً.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* شريط التقدم */}
      <div className="institutional-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-primary-700">تقدمك في التقييم</span>
          <span className="text-gold-700 font-bold">{completedAxes}/{totalAxes} محور</span>
        </div>
        <div className="h-2.5 bg-gold-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-primary-600 to-gold-500 rounded-full transition-all"
            style={{ width: `${(completedAxes / totalAxes) * 100}%` }} />
        </div>
      </div>

      {/* الإقرار */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="mt-1 rounded border-primary-300 text-primary-600 flex-shrink-0" />
          <span className="text-sm text-primary-800 leading-relaxed">
            أقرّ بأن إجاباتي مبنية على معرفتي المهنية المباشرة بالمرشح، وأن تقييمي موضوعي وأمين.
            أعلم أن هذا التقييم جزء من مسار مؤسسي ويراجعه لجنة مستقلة.
          </span>
        </label>
      </div>

      {/* أقسام التقييم */}
      {SECTIONS.map((section) => {
        const isOpen = openSections[section.id] !== false;
        const sectionDone = section.axes.every(a => scores[a.key] !== undefined);
        return (
          <div key={section.id} className="institutional-card overflow-hidden">
            <button onClick={() => setOpenSections(p => ({ ...p, [section.id]: !isOpen }))}
              className="w-full flex items-center justify-between p-4 hover:bg-gold-50 transition-colors">
              <div className="flex items-center gap-3">
                {sectionDone
                  ? <CheckCircle2 className="h-5 w-5 text-sage flex-shrink-0" />
                  : <div className="h-5 w-5 rounded-full border-2 border-gold-300 flex-shrink-0" />}
                <span className={`font-bold ${sectionDone ? 'text-sage' : 'text-primary-700'}`}>{section.title}</span>
                <span className="text-xs text-darkgray">
                  ({section.axes.filter(a => scores[a.key] !== undefined).length}/{section.axes.length})
                </span>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 text-darkgray" /> : <ChevronDown className="h-4 w-4 text-darkgray" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-5 border-t border-gold-100">
                {section.axes.map((axis) => {
                  const currentScore = scores[axis.key];
                  const isLow = currentScore !== undefined && currentScore <= 2;
                  const isHigh = currentScore !== undefined && currentScore >= 5;
                  return (
                    <div key={axis.key} className="pt-4">
                      <div className="mb-2">
                        <div className="font-medium text-primary-700 text-sm">{axis.label}</div>
                        <div className="text-xs text-darkgray">{axis.desc}</div>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button key={val} onClick={() => setScore(axis.key, val)}
                            className={`flex-1 py-2.5 rounded-xl transition-all ${
                              currentScore === val ? SCORE_COLORS[val] : 'bg-gold-50 text-darkgray hover:bg-gold-100 border border-gold-200'
                            }`}>
                            <div className="text-base font-bold leading-none">{val}</div>
                            <div className="text-xs opacity-70 mt-0.5">{SCORE_LABELS[val]}</div>
                          </button>
                        ))}
                      </div>
                      {(isLow || isHigh) && (
                        <div className="mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gold-700 mb-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {isLow ? 'درجة منخفضة — التعليق مطلوب' : 'درجة مرتفعة — التعليق مطلوب'}
                          </div>
                          <textarea rows={2} value={comments[axis.key] || ''}
                            onChange={e => setComment(axis.key, e.target.value)}
                            placeholder="اشرح سبب هذه الدرجة..."
                            className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        </div>
                      )}
                      {currentScore !== undefined && !isLow && !isHigh && (
                        <textarea rows={1} value={comments[axis.key] || ''}
                          onChange={e => setComment(axis.key, e.target.value)}
                          placeholder="تعليق اختياري..."
                          className="mt-2 w-full px-3 py-1.5 border border-gold-200 rounded-lg text-xs text-darkgray focus:ring-1 focus:ring-primary-500 outline-none resize-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* تحقق المبادرات */}
      {canVerifyInitiatives && initiatives.length > 0 && (
        <div className="institutional-card p-5">
          <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gold-600" />التحقق من المبادرات
          </h3>
          <div className="space-y-5">
            {initiatives.map((ini) => (
              <div key={ini.id} className="p-3 bg-gold-50 rounded-xl">
                <div className="font-medium text-primary-700 text-sm mb-3">{ini.name}</div>
                {[
                  { q: 'هل لديك معرفة مباشرة بهذه المبادرة؟', k: `${ini.id}_know` },
                  { q: 'هل كان دور المرشح جوهرياً فيها؟', k: `${ini.id}_role` },
                  { q: 'هل لاحظت أثراً فعلياً لهذه المبادرة؟', k: `${ini.id}_impact` },
                ].map(({ q, k }) => (
                  <div key={k} className="mb-2">
                    <div className="text-xs text-darkgray mb-1">{q}</div>
                    <div className="flex gap-2">
                      {['نعم', 'لا', 'غير متأكد'].map(opt => (
                        <button key={opt} onClick={() => setIniVerifications(p => ({ ...p, [k]: opt }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            iniVerifications[k] === opt ? 'bg-primary-700 text-white' : 'bg-white text-darkgray border border-gold-200 hover:bg-gold-100'
                          }`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تحقق المؤشرات */}
      {canVerifyKpis && kpis.length > 0 && (
        <div className="institutional-card p-5">
          <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gold-600" />التحقق من مؤشرات الأداء
          </h3>
          <div className="space-y-4">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="p-3 bg-gold-50 rounded-xl">
                <div className="font-medium text-primary-700 text-sm mb-3">{kpi.name}</div>
                {[
                  { q: 'هل تعرف هذا المؤشر؟', k: `${kpi.id}_know` },
                  { q: 'هل استخدمه المرشح فعلياً في عمله؟', k: `${kpi.id}_used` },
                  { q: 'هل ساعد على تحسين القرار أو الأداء؟', k: `${kpi.id}_impact` },
                ].map(({ q, k }) => (
                  <div key={k} className="mb-2">
                    <div className="text-xs text-darkgray mb-1">{q}</div>
                    <div className="flex gap-2">
                      {['نعم', 'لا', 'غير متأكد'].map(opt => (
                        <button key={opt} onClick={() => setKpiVerifications(p => ({ ...p, [k]: opt }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            kpiVerifications[k] === opt ? 'bg-primary-700 text-white' : 'bg-white text-darkgray border border-gold-200 hover:bg-gold-100'
                          }`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أسئلة عامة */}
      <div className="institutional-card p-5">
        <h3 className="font-bold text-primary-700 mb-4">أسئلة عامة</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-darkgray mb-1">أبرز نقطة قوة لدى المرشح</label>
            <textarea rows={2} value={generalAnswers.strengths}
              onChange={e => setGeneralAnswers(p => ({ ...p, strengths: e.target.value }))}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm text-darkgray mb-1">أهم جانب يحتاج تطويراً</label>
            <textarea rows={2} value={generalAnswers.gaps}
              onChange={e => setGeneralAnswers(p => ({ ...p, gaps: e.target.value }))}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm text-darkgray mb-2">هل ترى أن المرشح مناسب للقيادة حالياً؟</label>
            <div className="grid grid-cols-2 gap-2">
              {['نعم بكل تأكيد', 'نعم مع بعض التطوير', 'يحتاج وقتاً أطول', 'لا أعتقد حالياً'].map(opt => (
                <button key={opt} onClick={() => setGeneralAnswers(p => ({ ...p, leadership_ready: opt }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition text-center ${
                    generalAnswers.leadership_ready === opt ? 'bg-primary-700 text-white' : 'bg-gold-50 text-darkgray border border-gold-200 hover:bg-gold-100'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-darkgray mb-1">ملاحظة للجنة الحوكمة (اختياري)</label>
            <textarea rows={2} value={generalNote} onChange={e => setGeneralNote(e.target.value)}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="أي معلومة تراها مهمة للجنة الحوكمة..." />
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">{error}</div>}

      <button onClick={handleSubmit} disabled={submitting || !agreed}
        className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 text-lg">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
        {submitting ? 'جارٍ إرسال التقييم...' : `إرسال التقييم (${completedAxes}/${totalAxes} مكتمل)`}
      </button>

      <p className="text-xs text-darkgray text-center pb-4">
        هذا الرابط يستخدم مرة واحدة فقط — بعد الإرسال لا يمكن التعديل.
      </p>
    </div>
  );
}
