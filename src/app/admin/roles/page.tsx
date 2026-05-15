import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
// صفحة الأدوار دُمجت مع إدارة المستخدمين لتكون تشغيلية بالكامل
export default function AdminRolesPage() {
  redirect('/admin/users');
}
