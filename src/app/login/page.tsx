'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UniversityLogo } from '@/components/branding/Logo';
import { ROLES } from '@/lib/auth/roles';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('فشل تسجيل الدخول.');
        setLoading(false);
        return;
      }

      // جلب الدور الأساسي للمستخدم
      const { data: userRow } = await supabase
        .from('users')
        .select('id, user_roles(roles(code))')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      type UserRoleRow = { roles: { code: string } };
      const roles = (userRow as { user_roles?: UserRoleRow[] } | null)?.user_roles?.map(
        (r) => r.roles.code
      ) || [];

      const rolePriority = ['admin', 'president', 'governance', 'hr', 'advisor', 'candidate'];
      const primaryRole = rolePriority.find((r) => roles.includes(r)) || roles[0];

      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
      } else if (primaryRole && ROLES[primaryRole as keyof typeof ROLES]) {
        router.push(ROLES[primaryRole as keyof typeof ROLES].homePath);
      } else if (data.user.email === 'admin@nauss.edu.sa') {
        // المدير: توجيه للوحة الإدارة حتى لو لم يتم تهيئة السجل بعد
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <UniversityLogo size="lg" className="mx-auto" />
          <h1 className="text-3xl font-bold text-primary-700 mt-6">
            منصة <span className="text-gold-600">جدير</span>
          </h1>
          <p className="text-sm text-darkgray mt-2">منصة مؤسسية لقياس الجدارة القيادية</p>
        </div>

        {/* Form Card */}
        <div className="institutional-card p-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-darkgray mb-6">أدخل بياناتك للوصول إلى المنصة</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-sm text-wine">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="example@domain.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gold-200 text-center">
            <p className="text-sm text-darkgray">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary-700 font-bold hover:text-primary-800">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="block text-center mt-6 text-sm text-darkgray hover:text-primary-700"
        >
          ← العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
