'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-xl" dir="rtl">
      <h2 className="text-xl font-bold text-red-700 mb-4">خطأ في قسم الإدارة</h2>
      <p className="text-red-600 font-mono text-sm mb-2">
        <strong>الرسالة:</strong> {error.message}
      </p>
      {error.digest && (
        <p className="text-red-500 text-xs mb-4">
          <strong>Digest:</strong> {error.digest}
        </p>
      )}
      <pre className="text-xs text-red-500 bg-red-50 p-4 rounded overflow-auto whitespace-pre-wrap border border-red-100 mb-4">
        {error.stack}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
