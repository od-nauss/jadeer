'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Clock, XCircle, CheckCircle2, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UniversityLogo } from '@/components/branding/Logo';

function PendingApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'approved' | 'still_pending' | null>(null);

  const isRejected = searchParams.get('status') === 'rejected';

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function handleCheckStatus() {
    setChecking(true);
    setCheckResult(null);
    try {
      // Force a page refresh to trigger middleware/server check
      // If now approved, DashboardLayout will redirect appropriately
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Re-fetch page to trigger server-side redirect if approved
        router.refresh();
        // Short delay then try to navigate to candidate dashboard
        setTimeout(() => {
          router.push('/candidate/dashboard');
        }, 1000);
      }
      setCheckResult('still_pending');
    } catch {
      setCheckResult('still_pending');
    } finally {
      setChecking(false);
    }
  }

  if (isRejected) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4">
        <div className="max-w-lg w-full institutional-card p-8 text-center">
          <XCircle className="h-16 w-16 text-wine mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-700 mb-3">لم يتم قبول طلبك</h2>
          <p className="text-darkgray mb-2">
            نأسف لإبلاغك بأن طلب تسجيلك لم يُقبل في هذه المرحلة.
          </p>
          <p className="text-sm text-darkgray mb-6">
            للاستفسار أو التقدم مجدداً، تواصل مع مدير النظام مباشرة.
          </p>
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-6 text-right">
            <div className="text-sm font-bold text-primary-700 mb-2">للتواصل:</div>
            <div className="text-sm text-darkgray">admin@nauss.edu.sa</div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-wine text-wine rounded-lg hover:bg-wine/5 transition text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen institutional-bg flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <UniversityLogo size="sm" className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary-700 mt-4">
            منصة <span className="text-gold-600">جدير</span>
          </h1>
        </div>

        <div className="institutional-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-5">
            <Clock className="h-10 w-10 text-gold-600" />
          </div>

          <h2 className="text-2xl font-bold text-primary-700 mb-3">
            حسابك قيد المراجعة
          </h2>

          <p className="text-darkgray mb-4 leading-relaxed">
            تم استلام طلبك بنجاح. يقوم <strong>مدير النظام</strong> بمراجعة الطلب والتحقق من صحة الدور المطلوب.
          </p>

          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6 text-right">
            <div className="text-sm font-bold text-primary-700 mb-3">ما يمكن توقعه:</div>
            <ul className="space-y-2 text-sm text-darkgray">
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold mt-0.5">•</span>
                <span>سيراجع مدير النظام طلبك ويتواصل مع الجهة المختصة للتحقق</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold mt-0.5">•</span>
                <span>ستصلك رسالة بريد إلكتروني عند الاعتماد</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold mt-0.5">•</span>
                <span>بعد الاعتماد، تستطيع الدخول مباشرة بصلاحياتك الكاملة</span>
              </li>
            </ul>
          </div>

          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-6 text-right">
            <div className="text-sm font-bold text-primary-700 mb-2">للاستفسار:</div>
            <div className="text-sm text-darkgray">تواصل مع مدير النظام مباشرة</div>
            <div className="text-sm text-darkgray">أو عبر البريد: admin@nauss.edu.sa</div>
          </div>

          {checkResult === 'still_pending' && (
            <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg text-sm text-gold-800">
              لا يزال طلبك قيد المراجعة. يُرجى الصبر وانتظار إشعار البريد الإلكتروني.
            </div>
          )}

          {checkResult === 'approved' && (
            <div className="mb-4 p-3 bg-sage/10 border border-sage/30 rounded-lg flex items-center gap-2 text-sm text-sage">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              تم الموافقة على حسابك! جارٍ التحويل...
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="inline-flex items-center gap-2 px-5 py-2.5 btn-primary rounded-lg text-sm font-bold disabled:opacity-60"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              التحقق من الحالة
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gold-300 text-darkgray rounded-lg text-sm font-medium hover:bg-gold-50 transition"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen institutional-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <PendingApprovalContent />
    </Suspense>
  );
}
