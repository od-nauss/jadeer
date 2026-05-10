'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { UniversityLogo } from '@/components/branding/Logo';
import Link from 'next/link';

export default function ExecutiveCenterLogin() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/executive-center/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError('كلمة المرور غير صحيحة.');
        setLoading(false);
        return;
      }

      router.push('/executive-center/overview');
    } catch {
      setError('حدث خطأ. حاول مرة أخرى.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-900 to-primary-700 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full bg-gold-300 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-10">
          <UniversityLogo size="md" className="brightness-0 invert mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white">
            مركز العرض <span className="text-gold-400">التنفيذي</span>
          </h1>
          <p className="text-gold-200 mt-2">عرض قيادي محمي بكلمة مرور</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-gold-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 border border-gold-400/40 mb-4">
              <Lock className="h-7 w-7 text-gold-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">دخول العرض</h2>
            <p className="text-sm text-gold-200/80">أدخل كلمة المرور للوصول إلى العرض</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-400/40 rounded-lg flex items-center gap-2 text-sm text-rose-200">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              placeholder="••••"
              className="w-full px-4 py-3 bg-white/5 border-2 border-gold-500/30 hover:border-gold-400/60 focus:border-gold-400 rounded-lg text-white text-center text-2xl tracking-widest outline-none transition-colors"
              dir="ltr"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold py-3 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'دخول'}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70 hover:text-gold-300 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
