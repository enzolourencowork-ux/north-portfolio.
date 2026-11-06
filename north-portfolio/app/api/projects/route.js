import { NextResponse } from 'next/server';
import { database, listProjects, sanitizeProject } from '../../../lib/data';
import { getSession, validOrigin } from '../../../lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const admin = new URL(request.url).searchParams.get('admin') === '1';
  if (admin && !await getSession()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  try { return NextResponse.json({ projects: await listProjects(admin), configured: Boolean(database()) }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(request) {
  if (!await getSession()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const db = database();
  if (!db) return NextResponse.json({ error: 'Conecte o Supabase para salvar projetos.' }, { status: 503 });
  try {
    const data = sanitizeProject(await request.json());
    if (!data.title) throw new Error('Informe o nome do projeto.');
    const { data: project, error } = await db.from('projects').insert(data).select('*').single();
    if (error) throw new Error('Erro ao salvar projeto no banco.');
    return NextResponse.json({ project }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
