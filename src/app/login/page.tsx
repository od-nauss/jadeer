'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UniversityLogo } from '@/components/branding/Logo';

/** Fallback قائم على الدور المعروف في URL البريد (للحالات الاستثنائية) */
function getHomepathByEmail(email: string): string {
  const e = email.toLowerCase();
  if (e.includes('admin'))      return '/admin/dashboard';
  if (e.includes('president'))  return '/executive/dashboard';
  if (e.includes('governance')) return '/governance/dashboard';
  if (e === 'hr@nauss.edu.sa' || e.startsWith('hr+')) return '/hr/dashboard';
  if (e.includes('advisor'))    return '/advisor/dashboard';
  return '/candidate/dashboard';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !data?.user) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        setLoading(false);
        return;
      }

      // محاولة جلب الدور من الـ API (يستخدم session cookie الذي أنشأه signInWithPassword)
      let homePath = getHomepathByEmail(email);

      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.homePath) homePath = meData.homePath;
          // مستخدم في وضع الانتظار
          if (meData.registrationStatus === 'pending') {
            router.push('/pending-approval');
            return;
          }
          if (meData.registrationStatus === 'rejected') {
            router.push('/pending-approval?status=rejected');
            return;
          }
        }
      } catch { /* استخدم الـ fallback */ }

      const redirect = searchParams.get('redirect');
      router.push(redirect || homePath);
      router.refresh();
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="max-w-md w-full">

        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <UniversityLogo size="lg" className="mx-auto" />
          <h1 className="text-3xl font-bold text-primary-700 mt-6">
            منصة <span className="text-gold-600">جدير</span>
          </h1>
          <p className="text-sm text-darkgray mt-2">منصة مؤسسية لقياس الجدارة القيادية</p>
        </div>

        {/* بطاقة الدخول */}
        <div className="institutional-card p-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-darkgray mb-6">أدخل بياناتك للوصول إلى المنصة</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-sm text-wine">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="example@domain.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pr-10 pl-10 py-2.5 border border-gold-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-3 text-darkgray hover:text-primary-700 transition"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جارٍ التحقق...
                </>
              ) : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gold-200 text-center">
            <p className="text-sm text-darkgray">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary-700 font-bold hover:text-primary-800 transition">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-darkgray mt-6">
          © 2026 جامعة نايف العربية للعلوم الأمنية
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen institutional-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
