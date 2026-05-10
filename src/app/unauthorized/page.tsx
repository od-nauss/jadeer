import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { UniversityLogo } from '@/components/branding/Logo';

export const dynamic = 'force-dynamic';
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen institutional-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <UniversityLogo size="sm" className="mx-auto mb-8" />

        <div className="institutional-card p-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-wine mb-6">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <h1 className="text-2xl font-bold text-primary-700 mb-3">
            ليست لديك صلاحية للوصول إلى هذه الصفحة
          </h1>
          <p className="text-darkgray mb-6 leading-relaxed">
            هذه الصفحة محمية حسب الدور. إذا كنت تظن أن هذا خطأ، تواصل مع مدير النظام.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-primary-700 text-primary-700 hover:bg-primary-50 rounded-lg font-medium transition"
            >
              <ArrowLeft className="h-4 w-4" />
              الصفحة الرئيسية
            </Link>
            <Link
              href="/login"
              className="btn-primary px-5 py-2.5 rounded-lg font-bold"
            >
              تسجيل الدخول بحساب آخر
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
