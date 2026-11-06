import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSession, validOrigin } from '../../../../lib/auth';
import { database } from '../../../../lib/data';
const TYPES = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};
export async function POST(request) {
  if (!await getSession()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const db = database();
  if (!db) return NextResponse.json({ error: 'Conecte o Supabase para enviar arquivos.' }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 }); }
  const type = body.type;
  const kind = body.kind === 'video' ? 'video' : 'cover';
  const size = Number(body.size);
  if (!TYPES[type] || (kind === 'video' && !type.startsWith('video/')) || (kind === 'cover' && !type.startsWith('image/')) || !Number.isFinite(size) || size <= 0 || size > (kind === 'video' ? 50 : 10) * 1024 * 1024) {
    return NextResponse.json({ error: 'Formato inválido ou arquivo acima do limite (imagem 10 MB, vídeo 50 MB). Para vídeos maiores, use um link Vimeo/YouTube.' }, { status: 400 });
  }
  const path = `${kind}/${randomUUID()}.${TYPES[type]}`;
  const { data, error } = await db.storage.from('north-media').createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: 'Não foi possível preparar o envio. Verifique o bucket north-media.' }, { status: 500 });
  const { data: publicData } = db.storage.from('north-media').getPublicUrl(path);
  return NextResponse.json({ path, token: data.token, publicUrl: publicData.publicUrl });
}
