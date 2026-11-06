import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/auth';
import Login from '../../../components/Login';
export const dynamic = 'force-dynamic';
export default async function LoginPage() {
  if (await getSession()) redirect('/admin');
  return <Login/>;
}
