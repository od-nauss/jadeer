import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default function ExecutiveCenterLogin() {
  redirect('/executive-center/overview');
}
