'use client';

import { useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

interface WeightItem {
  axis: string;
  name_ar: string;
  weight: number;
}

interface Props {
  initialWeights: WeightItem[];
}

const DEFAULT_WEIGHTS: WeightItem[] = [
  { axis: 'leadership',  name_ar: 'القيادة والتأثير المؤسسي',         weight: 20 },
  { axis: 'strategic',   name_ar: 'التفكير الاستراتيجي',              weight: 15 },
  { axis: 'performance', name_ar: 'الأداء والإنجاز',                  weight: 15 },
  { axis: 'innovation',  name_ar: 'الابتكار والمبادرات',              weight: 15 },
  { axis: 'team',        name_ar: 'رضا الفريق وأصحاب العلاقة',       weight: 15 },
  { axis: 'tech_ai',     name_ar: 'استخدام التقنية والذكاء الاصطناعي', weight: 10 },
  { axis: 'integrity',   name_ar: 'النزاهة والالتزام المؤسسي',        weight: 10 },
];

export function WeightsClient({ initialWeights }: Props) {
  const [weights, setWeights] = useState<WeightItem[]>(initialWeights);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = weights.reduce((sum, w) => sum + (Number(w.weight) || 0), 0);
  const isValid = total === 100;

  function updateWeight(axis: string, value: string) {
    const num = Math.max(0, Math.min(100, Number(value) || 0));
    setWeights(prev => prev.map(w => w.axis === axis ? { ...w, weight: num } : w));
    setSaved(false);
    setError(null);
  }

  function resetToDefaults() {
    setWeights(DEFAULT_WEIGHTS);
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    if (!isValid) {
      setError(`مجموع الأوزان الحالي ${total}% — يجب أن يساوي 100% تماماً`);
      return;
    }
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'فشل الحفظ'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  }

  const colors = [
    'bg-gold-500', 'bg-primary-500', 'bg-emerald-500',
    'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-rose-500',
  ];

  return (
    <div className="space-y-6">
      {/* تحذير إذا لم يكن المجموع 100 */}
      {!isValid && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>مجموع الأوزان الحالي <strong>{total}%</strong> — يجب أن يساوي <strong>100%</strong> قبل الحفظ</span>
        </div>
      )}

      {isValid && total > 0 && (
        <div className="flex items-center gap-2 p-3 bg-sage/10 border border-sage/30 rounded-xl text-sm text-sage font-medium">
          <CheckCircle2 className="h-4 w-4" />
          المجموع 100% — جاهز للحفظ
        </div>
      )}

      {/* محاور الأوزان */}
      <div className="bg-white rounded-2xl border border-gold-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 px-5 py-3 bg-gold-50 border-b border-gold-200 text-xs font-bold text-primary-700">
          <div className="col-span-5">المحور</div>
          <div className="col-span-4 text-center">الوزن (%)</div>
          <div className="col-span-3">شريط التصور</div>
        </div>

        {weights.map((w, i) => (
          <div key={w.axis} className="grid grid-cols-12 gap-0 items-center px-5 py-4 border-b border-gold-100 last:border-0 hover:bg-gold-50/50 transition">
            <div className="col-span-5">
              <div className="font-medium text-primary-800 text-sm">{w.name_ar}</div>
            </div>
            <div className="col-span-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => updateWeight(w.axis, String(Math.max(0, w.weight - 5)))}
                className="h-7 w-7 rounded-lg border border-gold-300 text-darkgray hover:bg-gold-100 flex items-center justify-center font-bold text-lg"
              >−</button>
              <input
                type="number"
                value={w.weight}
                onChange={e => updateWeight(w.axis, e.target.value)}
                min={0}
                max={100}
                className="w-16 text-center border border-gold-300 rounded-lg px-2 py-1.5 text-base font-bold text-primary-700 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                type="button"
                onClick={() => updateWeight(w.axis, String(Math.min(100, w.weight + 5)))}
                className="h-7 w-7 rounded-lg border border-gold-300 text-darkgray hover:bg-gold-100 flex items-center justify-center font-bold text-lg"
              >+</button>
            </div>
            <div className="col-span-3">
              <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${colors[i % colors.length]}`}
                  style={{ width: `${Math.min(100, w.weight * 5)}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* مجموع الأوزان */}
        <div className="grid grid-cols-12 gap-0 items-center px-5 py-4 bg-primary-50 border-t-2 border-primary-200">
          <div className="col-span-5 font-bold text-primary-700">المجموع الكلي</div>
          <div className="col-span-4 text-center">
            <span className={`text-2xl font-bold ${isValid ? 'text-sage' : 'text-wine'}`}>{total}%</span>
          </div>
          <div className="col-span-3 text-xs text-darkgray">{isValid ? '✓ صحيح' : `يحتاج ${100 - total > 0 ? `+${100 - total}` : 100 - total}%`}</div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="flex-1 btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {saving ? 'جارٍ الحفظ...' : saved ? 'تم الحفظ بنجاح!' : 'حفظ الأوزان'}
        </button>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-5 py-3 border border-gold-300 text-primary-700 rounded-xl hover:bg-gold-50 transition text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة الضبط الافتراضي
        </button>
      </div>

      <div className="p-4 bg-gold-50 border-r-4 border-gold-400 rounded-xl text-xs text-darkgray leading-relaxed">
        <strong className="text-primary-700">ملاحظة:</strong> التعديلات تُطبَّق على جميع الملفات التي لم تُصدر بطاقتها بعد.
        البطاقات القيادية المعتمدة مسبقاً لا تتأثر. كل تعديل يُسجَّل في سجل التدقيق باسم المدير.
      </div>
    </div>
  );
}
