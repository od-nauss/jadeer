'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send, AlertCircle, Star } from 'lucide-react';

export default function RequestCandidacyPage() {
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-candidacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justification }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل إرسال الطلب.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto mt-12">
        <div className="institutional-card p-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-sage mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-700 mb-3">تم إرسال طلبك بنجاح</h2>
          <p className="text-darkgray leading-relaxed">
            سيقوم فريق الموارد البشرية بمراجعة طلبك وستتلقى إشعاراً عند البت فيه. إذا وُفِّق طلبك، ستظهر لك بوابة المرشح القيادي في القائمة.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
            <Star className="h-5 w-5 text-gold-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-700">طلب التقديم كمرشح قيادي</h1>
        </div>
        <p className="text-darkgray mr-13">
          تقديم طلب إضافة دور مرشح قيادي إلى حسابك الحالي. لن يتأثر دورك الحالي.
        </p>
      </div>

      <div className="institutional-card p-6">
        <div className="mb-5 p-4 bg-primary-50 border border-primary-100 rounded-xl">
          <div className="text-sm font-bold text-primary-700 mb-2">ما الذي سيحدث بعد إرسال الطلب؟</div>
          <ul className="space-y-1.5 text-sm text-darkgray">
            <li className="flex items-start gap-2">
              <span className="text-gold-600 font-bold">1.</span>
              <span>سيتم مراجعة طلبك من قِبَل إدارة الموارد البشرية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-600 font-bold">2.</span>
              <span>عند الموافقة، يُضاف دور المرشح القيادي لحسابك</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-600 font-bold">3.</span>
              <span>يمكنك حينها التنقل بين بواباتك عبر قائمة "بواباتي" في الأعلى</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-sm text-wine">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">
              مبررات التقديم (اختياري)
            </label>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              rows={4}
              placeholder="يمكنك ذكر خبراتك القيادية أو دوافعك للتقدم في مسار الجاهزية القيادية..."
              className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
}
