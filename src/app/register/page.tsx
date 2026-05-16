'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Mail, Lock, User, Briefcase, Building,
  AlertCircle, CheckCircle2, Clock, ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UniversityLogo } from '@/components/branding/Logo';

const ROLE_OPTIONS = [
  {
    value: 'candidate',
    label: 'مرشح قيادي',
    desc: 'أتقدم لمسار تقييم الجاهزية القيادية',
    icon: '🎯',
    badge: 'دخول فوري',
    badgeColor: 'bg-green-100 text-sage',
    instant: true,
  },
  {
    value: 'hr',
    label: 'عضو الموارد البشرية',
    desc: 'أعمل في الموارد البشرية وأتابع مسارات التطوير',
    icon: '👥',
    badge: 'يتطلب اعتماد الأدمن',
    badgeColor: 'bg-gold-100 text-gold-700',
    instant: false,
  },
  {
    value: 'governance',
    label: 'عضو لجنة الحوكمة',
    desc: 'أراجع الملفات وأصدر قرارات الاعتماد',
    icon: '⚖️',
    badge: 'يتطلب اعتماد الأدمن',
    badgeColor: 'bg-gold-100 text-gold-700',
    instant: false,
  },
  {
    value: 'advisor',
    label: 'مستشار',
    desc: 'مستشار معتمد للاطلاع على نتائج المرشحين',
    icon: '🎓',
    badge: 'يتطلب اعتماد الأدمن',
    badgeColor: 'bg-gold-100 text-gold-700',
    instant: false,
  },
  {
    value: 'president',
    label: 'الرئيس التنفيذي',
    desc: 'الاطلاع على البطاقات القيادية وقرارات الحوكمة',
    icon: '👑',
    badge: 'يتطلب اعتماد الأدمن',
    badgeColor: 'bg-gold-100 text-gold-700',
    instant: false,
  },
];

type SuccessState = { instant: boolean; role: string };

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState('');
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
  const [success, setSuccess] = useState<SuccessState | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const roleInfo = ROLE_OPTIONS.find(r => r.value === selectedRole);

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
    if (!selectedRole) {
      setError('يرجى اختيار الدور أولاً.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: selectedRole, source: 'self' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل إنشاء الحساب.');
        setLoading(false);
        return;
      }

      setSuccess({ instant: data.status === 'active', role: selectedRole });

      // المرشح: سجّل الدخول مباشرة
      if (data.status === 'active') {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        setTimeout(() => router.push('/candidate/dashboard'), 1500);
      }
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
      setLoading(false);
    }
  }

  // ── شاشة النجاح ─────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen institutional-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full institutional-card p-8 text-center">
          {success.instant ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-sage" />
              </div>
              <h2 className="text-2xl font-bold text-primary-700 mb-3">مرحباً بك في منصة جدير!</h2>
              <p className="text-darkgray mb-4">تم إنشاء حسابك بنجاح. جارٍ تحويلك للوحة التحكم...</p>
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto" />
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-gold-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary-700 mb-3">طلبك قيد المراجعة</h2>
              <p className="text-darkgray mb-5 leading-relaxed">
                تم إنشاء حسابك بنجاح بدور <strong>{roleInfo?.label}</strong>.
                سيراجع مدير النظام الطلب ويعتمد صلاحياتك خلال وقت قصير.
              </p>
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6 text-right text-sm">
                <div className="flex items-start gap-2 text-primary-700">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>لن تتمكن من الدخول للمنصة حتى يعتمد مدير النظام طلبك. ستصلك رسالة بريد إلكتروني عند القبول.</span>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 border border-primary-300 text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-50 transition"
              >
                العودة لصفحة الدخول
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen institutional-bg flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <UniversityLogo size="sm" className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary-700 mt-4">
            منصة <span className="text-gold-600">جدير</span>
          </h1>
          <p className="text-sm text-darkgray mt-1">منصة مؤسسية لقياس الجدارة القيادية</p>
        </div>

        <div className="institutional-card p-8">
          {/* شريط الخطوات */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 text-sm font-bold ${step === 'role' ? 'text-primary-700' : 'text-sage'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'role' ? 'bg-primary-700 text-white' : 'bg-sage text-white'}`}>
                {step === 'role' ? '1' : '✓'}
              </div>
              اختيار الدور
            </div>
            <div className="flex-1 h-px bg-gold-200" />
            <div className={`flex items-center gap-2 text-sm font-bold ${step === 'details' ? 'text-primary-700' : 'text-darkgray'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'details' ? 'bg-primary-700 text-white' : 'bg-gold-100 text-darkgray'}`}>
                2
              </div>
              البيانات الشخصية
            </div>
          </div>

          {/* الخطوة 1: اختيار الدور */}
          {step === 'role' && (
            <div>
              <h2 className="text-xl font-bold text-primary-700 mb-2">ما دورك في المنصة؟</h2>
              <p className="text-sm text-darkgray mb-6">اختر الدور المناسب لمهامك المؤسسية. يؤثر هذا على الصلاحيات والبيانات التي ستراها.</p>

              <div className="space-y-3 mb-8">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedRole(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-right transition-all ${
                      selectedRole === opt.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gold-200 hover:border-gold-400 bg-white'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-primary-700">{opt.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <div className="text-xs text-darkgray">{opt.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                      selectedRole === opt.value ? 'border-primary-600 bg-primary-600' : 'border-gold-300'
                    }`}>
                      {selectedRole === opt.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50 block" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { if (selectedRole) setStep('details'); }}
                disabled={!selectedRole}
                className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي ← بيانات الحساب
              </button>
            </div>
          )}

          {/* الخطوة 2: البيانات الشخصية */}
          {step === 'details' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('role')} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  ← تغيير الدور
                </button>
                <span className="text-darkgray text-sm">|</span>
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="text-xl">{roleInfo?.icon}</span>
                  <strong className="text-primary-700">{roleInfo?.label}</strong>
                </span>
              </div>

              <h2 className="text-xl font-bold text-primary-700 mb-1">البيانات الشخصية</h2>
              <p className="text-sm text-darkgray mb-5">
                {roleInfo?.instant
                  ? 'ستتمكن من الدخول فوراً بعد التسجيل.'
                  : 'سيعتمد مدير النظام طلبك قبل تفعيل الحساب.'}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-sm text-wine">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                {/* الاسم */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">الاسم الكامل <span className="text-wine">*</span></label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                    <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} required
                      className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="الاسم كاملاً" />
                  </div>
                </div>

                {/* البريد */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">البريد الإلكتروني <span className="text-wine">*</span></label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required dir="ltr"
                      className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="example@domain.com" />
                  </div>
                </div>

                {/* رقم الموظف */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">رقم الموظف</label>
                  <input value={form.employeeNumber} onChange={e => update('employeeNumber', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="اختياري" />
                </div>

                {/* المسمى */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">المسمى الوظيفي</label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                    <input value={form.jobTitle} onChange={e => update('jobTitle', e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>

                {/* الإدارة */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">الإدارة / القسم</label>
                  <div className="relative">
                    <Building className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                    <input value={form.department} onChange={e => update('department', e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>

                {/* كلمة المرور */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">كلمة المرور <span className="text-wine">*</span></label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                    <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={8}
                      className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="8 أحرف فأكثر" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">تأكيد كلمة المرور <span className="text-wine">*</span></label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gold-600" />
                    <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required
                      className="w-full pr-10 pl-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="md:col-span-2 btn-primary py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'إنشاء الحساب'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gold-200 text-center">
            <p className="text-sm text-darkgray">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary-700 font-bold hover:text-primary-800">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
