import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
// مركز العرض التنفيذي مفتوح الآن — لا يحتاج كلمة مرور
export default function ExecAccessPage() {
  redirect('/executive-center/overview');
}
