'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, Loader2, X, CheckCircle2, Database, Play } from 'lucide-react';

const REQUIRED_TEXT = 'حذف البيانات التجريبية';

export function DemoDataActions({
  totalRecords,
  isActive,
}: {
  totalRecords: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string[] | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    setSeedResult(null);
    const res = await fetch('/api/admin/seed-demo', { method: 'POST' });
    const data = await res.json();
    setSeedResult(data.results || [data.error || 'خطأ غير متوقع']);
    setSeeding(false);
    setTimeout(() => router.refresh(), 1500);
  }
  const [confirmText, setConfirmText] = useState('');
  const [stage, setStage] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setShowModal(false);
    setConfirmText('');
    setStage(1);
    setError(null);
    setSuccess(false);
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/demo-data/delete', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'فشل الحذف');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        reset();
        router.refresh();
      }, 2000);
    } catch {
      setError('حدث خطأ غير متوقع');
      setLoading(false);
    }
  }

  if (!isActive) {
    return (
      <div className="institutional-card p-8 text-center bg-sage/5 border-2 border-sage/30">
        <CheckCircle2 className="h-12 w-12 text-sage mx-auto mb-3" />
        <h3 className="text-lg font-bold text-primary-700 mb-1">البيانات التجريبية محذوفة</h3>
        <p className="text-sm text-darkgray">
          المنصة في وضع الإنتاج. لا توجد بيانات تجريبية حالياً.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* زر إنشاء البيانات التجريبية */}
      <div className="institutional-card p-6 border-2 border-primary-200 bg-primary-50/30 mb-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary-600/15 flex items-center justify-center flex-shrink-0">
            <Database className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary-700 mb-1">إنشاء البيانات التجريبية</h3>
            <p className="text-sm text-darkgray mb-3 leading-relaxed">
              ينشئ 5 مرشحين تجريبيين كاملين مع مبادراتهم، مؤشرات أدائهم، بطاقاتهم القيادية، وخطط تطويرهم.
            </p>
            {seedResult && (
              <div className="mb-3 space-y-1">
                {seedResult.map((r, i) => <div key={i} className="text-xs font-mono">{r}</div>)}
              </div>
            )}
            <button onClick={handleSeed} disabled={seeding}
              className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-5 py-2.5 rounded-lg font-bold transition disabled:opacity-60">
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {seeding ? 'جارٍ الإنشاء...' : 'إنشاء البيانات التجريبية الخمسة'}
            </button>
          </div>
        </div>
      </div>

      <div className="institutional-card p-6 border-2 border-rose-200 bg-rose-50/30">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-wine/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-wine" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-wine mb-1">حذف البيانات التجريبية</h3>
            <p className="text-sm text-darkgray mb-4 leading-relaxed">
              هذا الإجراء سيحذف جميع البيانات المعلّمة كبيانات تجريبية ({totalRecords} سجل) بشكل
              نهائي ولا يمكن التراجع عنه. ستحتاج إلى تأكيد مزدوج قبل التنفيذ.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-wine hover:bg-wine/90 text-white px-5 py-2.5 rounded-lg font-bold transition"
            >
              <Trash2 className="h-4 w-4" />
              حذف البيانات التجريبية
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => !loading && reset()}
              className="absolute top-4 left-4 text-darkgray hover:text-wine"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-sage mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-700 mb-1">تم الحذف بنجاح</h3>
                <p className="text-sm text-darkgray">المنصة الآن في وضع الإنتاج.</p>
              </div>
            ) : stage === 1 ? (
              <>
                <div className="h-14 w-14 rounded-full bg-wine/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-7 w-7 text-wine" />
                </div>
                <h3 className="text-xl font-bold text-primary-700 mb-2 text-center">تأكيد الحذف (1/2)</h3>
                <p className="text-sm text-darkgray mb-4 text-center leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف جميع البيانات التجريبية ({totalRecords} سجل)؟
                  <br />
                  <strong className="text-wine">هذا الإجراء لا يمكن التراجع عنه.</strong>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 px-4 py-2.5 border-2 border-gold-300 text-primary-700 rounded-lg font-medium hover:bg-gold-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => setStage(2)}
                    className="flex-1 px-4 py-2.5 bg-wine text-white rounded-lg font-bold hover:bg-wine/90"
                  >
                    متابعة
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-primary-700 mb-2 text-center">تأكيد الحذف (2/2)</h3>
                <p className="text-sm text-darkgray mb-4 text-center">
                  للمتابعة، أكتب الجملة التالية بالضبط:
                </p>
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-3 text-center mb-3">
                  <code className="text-primary-700 font-bold">{REQUIRED_TEXT}</code>
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-300 focus:border-wine rounded-lg outline-none text-center mb-4"
                  placeholder="اكتب الجملة هنا"
                  disabled={loading}
                />
                {error && (
                  <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine text-center">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border-2 border-gold-300 text-primary-700 rounded-lg font-medium hover:bg-gold-50 disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== REQUIRED_TEXT || loading}
                    className="flex-1 px-4 py-2.5 bg-wine text-white rounded-lg font-bold hover:bg-wine/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        تأكيد الحذف
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
