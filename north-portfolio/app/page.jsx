import { listProjects } from '../lib/data';
import Portfolio from '../components/Portfolio';
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  let projects = [];
  try { projects = await listProjects(); } catch { projects = []; }
  return <Portfolio projects={projects} contactUrl={process.env.NEXT_PUBLIC_CONTACT_URL || ''} />;
}
