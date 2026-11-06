import { NextResponse } from 'next/server';
import { database, sanitizeProject } from '../../../../lib/data';
import { getSession, validOrigin } from '../../../../lib/auth';
async function guard(request) {
  if (!await getSession()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  if (!database()) return NextResponse.json({ error: 'Conecte o Supabase.' }, { status: 503 });
  return null;
}
export async function PATCH(request, { params }) {
  const failure = await guard(request); if (failure) return failure;
  try {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('ID inválido.');
    const updates = sanitizeProject(await request.json());
    const { data, error } = await database().from('projects').update(updates).eq('id', id).select('*').single();
    if (error) throw new Error('Não foi possível atualizar o projeto.');
    return NextResponse.json({ project: data });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
export async function DELETE(request, { params }) {
  const failure = await guard(request); if (failure) return failure;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  const { error } = await database().from('projects').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Não foi possível excluir.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
