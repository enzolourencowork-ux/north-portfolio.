import { NextResponse } from 'next/server';
import { makeSession, setSessionCookie, validOrigin, verifyPassword } from '../../../../lib/auth';
export const runtime = 'nodejs';
const attempts = new Map();
export async function POST(request) {
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem não autorizada.' }, { status: 403 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const state = attempts.get(ip) || { count: 0, until: now + 15 * 60_000 };
  if (now > state.until) { state.count = 0; state.until = now + 15 * 60_000; }
  if (state.count >= 5) return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!process.env.SESSION_SECRET || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: 'Login ainda não configurado pelo proprietário.' }, { status: 503 });
  }
  if (email !== process.env.ADMIN_EMAIL.toLowerCase() || !verifyPassword(password)) {
    state.count++; attempts.set(ip, state);
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }
  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, makeSession(email));
  return response;
}
