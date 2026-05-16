'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Briefcase, Building, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { UniversityLogo } from '@/components/branding/Logo';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    employeeNumber: '',
    jobTitle: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف فأكثر.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'self' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل إنشاء الحساب.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full institutional-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-sage" />
          </div>
          <h2 className="text-2xl font-bold text-primary-700 mb-3">تم إنشاء حسابك بنجاح!</h2>
          <p className="text-darkgray mb-4 leading-relaxed">
            يمكنك الآن تسجيل الدخول والبدء في رحلتك القيادية. أكمل ملفك الشخصي لتبدأ مسار تقييم الجاهزية.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 btn-primary rounded-xl font-bold"
          >
            تسجيل الدخول الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <UniversityLogo size="sm" className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary-700 mt-4">
            منصة <span className="text-gold-600">جدير</span>
          </h1>
        </div>

        <div className="institutional-card p-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-1">إنشاء حساب مرشح قيادي</h2>

          {/* Important note about who should register */}
          <div className="mb-5 p-4 bg-primary-50 border border-primary-100 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-800">
              <div className="font-bold mb-1">هذا التسجيل مخصص للمرشحين القياديين فقط.</div>
              <div className="text-primary-700">
                أعضاء الموارد البشرية، لجنة الحوكمة، المستشارون والرئيس — يُضافون من قِبَل مديري النظام مباشرة، ولا يحتاجون للتسجيل هنا.
              </div>
            </div>
          </div>

          <p className="text-sm text-darkgray mb-6">
            سجّل بياناتك وستتمكن من الدخول فوراً للبدء في رحلتك القيادية.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-sm text-wine">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                الاسم الكامل <span className="text-wine">*</span>
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  required
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="الاسم كاملاً كما في بطاقة الهوية"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                البريد الإلكتروني <span className="text-wine">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="example@domain.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                رقم الموظف
              </label>
              <input
                type="text"
                value={form.employeeNumber}
                onChange={(e) => update('employeeNumber', e.target.value)}
                className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                المسمى الوظيفي
              </label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => update('jobTitle', e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                الإدارة
              </label>
              <div className="relative">
                <Building className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                كلمة المرور <span className="text-wine">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  minLength={8}
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="8 أحرف فأكثر"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                تأكيد كلمة المرور <span className="text-wine">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  required
                  className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 btn-primary py-3 rounded-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تقديم طلب التسجيل'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gold-200 text-center">
            <p className="text-sm text-darkgray">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary-700 font-bold hover:text-primary-800">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
