'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, Loader2, X, CheckCircle2, Database, Play, RefreshCw, Users } from 'lucide-react';

const REQUIRED_TEXT = 'حذف البيانات التجريبية';

interface Props {
  totalRecords: number;
  isActive: boolean;
}

export function DemoDataActions({ totalRecords, isActive }: Props) {
  const router = useRouter();

  // حالة الإنشاء
  const [seeding, setSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<string[] | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  // حالة إنشاء حسابات الأدوار
  const [staffSeeding, setStaffSeeding] = useState(false);
  const [staffResults, setStaffResults] = useState<string[] | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  // حالة الحذف
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [stage, setStage] = useState<1 | 2>(1);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleStaffSeed() {
    setStaffSeeding(true);
    setStaffResults(null);
    setStaffError(null);
    try {
      const res = await fetch('/api/admin/seed-staff', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setStaffError(data.error || `خطأ ${res.status}`);
      } else {
        setStaffResults(data.results || []);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch {
      setStaffError('حدث خطأ في الشبكة');
    }
    setStaffSeeding(false);
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedResults(null);
    setSeedError(null);
    try {
      const res = await fetch('/api/admin/seed-demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setSeedError(data.error || `خطأ ${res.status}`);
      } else {
        setSeedResults(data.results || ['تم الإنشاء بنجاح']);
        setTimeout(() => router.refresh(), 1500);
      }
    } catch (e) {
      setSeedError('حدث خطأ في الشبكة');
    }
    setSeeding(false);
  }

  function resetDelete() {
    setShowModal(false);
    setConfirmText('');
    setStage(1);
    setDeleteError(null);
    setDeleteSuccess(false);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/admin/demo-data/delete', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.error || 'فشل الحذف');
        setDeleting(false);
        return;
      }
      setDeleteSuccess(true);
      setTimeout(() => { resetDelete(); router.refresh(); }, 2000);
    } catch {
      setDeleteError('حدث خطأ غير متوقع');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* ─── الخطوة الأولى: إنشاء حسابات الأدوار (الأهم) ─── */}
      <div className="institutional-card p-6 border-2 border-gold-400 bg-gold-50/40">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-gold-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-primary-700">الخطوة الأولى: إنشاء حسابات الأدوار</h3>
              <span className="text-xs bg-gold-500 text-white px-2 py-0.5 rounded-full font-bold">ابدأ هنا</span>
            </div>
            <p className="text-sm text-darkgray mb-2 leading-relaxed">
              ينشئ حسابات تسجيل الدخول الفعلية لجميع الأدوار في Supabase Auth:
            </p>
            <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
              {[
                ['الرئيس', 'president@nauss.edu.sa', 'Demo@2026'],
                ['لجنة الحوكمة', 'governance@nauss.edu.sa', 'Demo@2026'],
                ['الموارد البشرية', 'hr@nauss.edu.sa', 'Demo@2026'],
                ['المستشار', 'advisor@nauss.edu.sa', 'Demo@2026'],
              ].map(([role, email, pass]) => (
                <div key={email} className="bg-white border border-gold-200 rounded p-2">
                  <div className="font-bold text-primary-700">{role}</div>
                  <div className="text-darkgray/70 font-mono text-[10px]">{email}</div>
                  <div className="text-darkgray/70 font-mono text-[10px]">{pass}</div>
                </div>
              ))}
            </div>

            {staffError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">
                ❌ {staffError}
              </div>
            )}
            {staffResults && (
              <div className="mb-3 p-3 bg-sage/10 border border-sage/20 rounded-lg max-h-40 overflow-y-auto">
                {staffResults.map((r, i) => (
                  <div key={i} className={`text-xs font-mono ${r.startsWith('✅') ? 'text-sage' : r.startsWith('❌') ? 'text-wine' : 'text-primary-600 font-bold'}`}>{r}</div>
                ))}
              </div>
            )}

            <button
              onClick={handleStaffSeed}
              disabled={staffSeeding}
              className="inline-flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-5 py-2.5 rounded-lg font-bold transition disabled:opacity-60"
            >
              {staffSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              {staffSeeding ? 'جارٍ إنشاء الحسابات...' : 'إنشاء حسابات الأدوار'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── الخطوة الثانية: إنشاء البيانات التجريبية ─── */}
      <div className="institutional-card p-6 border-2 border-primary-200 bg-primary-50/30">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary-600/15 flex items-center justify-center flex-shrink-0">
            <Database className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-primary-700">الخطوة الثانية: إنشاء البيانات التجريبية</h3>
            </div>
            <p className="text-sm text-darkgray mb-3 leading-relaxed">
              ينشئ 5 مرشحين تجريبيين كاملين مع مبادراتهم، مؤشرات أدائهم، مقيّميهم المعتمدين، بطاقاتهم القيادية، وخطط تطويرهم. شغّل هذه الخطوة <strong>بعد</strong> إنشاء حسابات الأدوار.
            </p>

            {seedError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">
                ❌ {seedError}
              </div>
            )}

            {seedResults && (
              <div className="mb-3 p-3 bg-sage/10 border border-sage/20 rounded-lg">
                {seedResults.map((r, i) => (
                  <div key={i} className="text-xs font-mono text-primary-700">{r}</div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-5 py-2.5 rounded-lg font-bold transition disabled:opacity-60"
              >
                {seeding
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Play className="h-4 w-4" />}
                {seeding ? 'جارٍ الإنشاء...' : 'إنشاء البيانات التجريبية الخمسة'}
              </button>
              {isActive && (
                <button
                  onClick={() => { setSeedResults(null); setSeedError(null); handleSeed(); }}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 border border-primary-200 text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition disabled:opacity-60"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  إعادة الإنشاء
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── قسم الحذف — يظهر فقط إذا كانت بيانات موجودة ─── */}
      {isActive && totalRecords > 0 && (
        <div className="institutional-card p-6 border-2 border-rose-200 bg-rose-50/30">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-wine/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-wine" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-wine mb-1">حذف البيانات التجريبية</h3>
              <p className="text-sm text-darkgray mb-4 leading-relaxed">
                حذف جميع البيانات التجريبية ({totalRecords} سجل) بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
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
      )}

      {/* ─── Modal التأكيد ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative" dir="rtl">
            <button onClick={() => !deleting && resetDelete()} disabled={deleting}
              className="absolute top-4 left-4 text-darkgray hover:text-wine">
              <X className="h-5 w-5" />
            </button>

            {deleteSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-sage mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-700 mb-1">تم الحذف بنجاح</h3>
                <p className="text-sm text-darkgray">المنصة الآن في وضع الإنتاج النظيف.</p>
              </div>
            ) : stage === 1 ? (
              <>
                <div className="h-14 w-14 rounded-full bg-wine/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-7 w-7 text-wine" />
                </div>
                <h3 className="text-xl font-bold text-primary-700 mb-2 text-center">تأكيد الحذف (1/2)</h3>
                <p className="text-sm text-darkgray mb-4 text-center leading-relaxed">
                  ستحذف {totalRecords} سجل تجريبي نهائياً.
                  <br /><strong className="text-wine">هذا الإجراء لا يمكن التراجع عنه.</strong>
                </p>
                <div className="flex gap-3">
                  <button onClick={resetDelete} className="flex-1 px-4 py-2.5 border-2 border-gold-300 text-primary-700 rounded-lg font-medium hover:bg-gold-50">إلغاء</button>
                  <button onClick={() => setStage(2)} className="flex-1 px-4 py-2.5 bg-wine text-white rounded-lg font-bold hover:bg-wine/90">متابعة</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-primary-700 mb-2 text-center">تأكيد الحذف (2/2)</h3>
                <p className="text-sm text-darkgray mb-4 text-center">اكتب للتأكيد:</p>
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-3 text-center mb-3">
                  <code className="text-primary-700 font-bold">{REQUIRED_TEXT}</code>
                </div>
                <input
                  type="text" value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-300 focus:border-wine rounded-lg outline-none text-center mb-4"
                  placeholder="اكتب العبارة هنا" disabled={deleting}
                />
                {deleteError && (
                  <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine text-center">{deleteError}</div>
                )}
                <div className="flex gap-3">
                  <button onClick={resetDelete} disabled={deleting}
                    className="flex-1 px-4 py-2.5 border-2 border-gold-300 text-primary-700 rounded-lg font-medium hover:bg-gold-50 disabled:opacity-50">
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== REQUIRED_TEXT || deleting}
                    className="flex-1 px-4 py-2.5 bg-wine text-white rounded-lg font-bold hover:bg-wine/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" />تأكيد الحذف</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
