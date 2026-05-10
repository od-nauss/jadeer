import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'منصة جدير - منصة مؤسسية لقياس الجدارة القيادية',
  description:
    'منصة جدير منصة مؤسسية ذكية تتيح لجميع موظفي المنظمة التقدم لمسار الجاهزية القيادية. جامعة نايف العربية للعلوم الأمنية',
  keywords: ['جدير', 'منصة جدير', 'الجاهزية القيادية', 'جامعة نايف', 'تقييم 360'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-messiri antialiased">{children}</body>
    </html>
  );
}
