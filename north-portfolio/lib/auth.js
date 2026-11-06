import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE = 'north_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

function sign(value) {
  return createHmac('sha256', process.env.SESSION_SECRET || 'unset')
    .update(value).digest('base64url');
}

export function verifyPassword(password) {
  const encoded = process.env.ADMIN_PASSWORD_HASH || '';
  const [salt, expected] = encoded.split(':');
  if (!salt || !expected || !/^[0-9a-f]{32,}$/.test(expected)) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expected, 'hex');
    return candidate.length === expectedBuffer.length && timingSafeEqual(candidate, expectedBuffer);
  } catch { return false; }
}

export function makeSession(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export async function getSession() {
  if (!process.env.SESSION_SECRET || !process.env.ADMIN_EMAIL) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  const [payload, signature, ...extra] = token.split('.');
  if (!payload || !signature || extra.length) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (parsed.exp <= Date.now() || parsed.email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) return null;
    return { email: parsed.email };
  } catch { return null; }
}

export function setSessionCookie(response, value) {
  response.cookies.set(COOKIE, value, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', path: '/', maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
}

export function validOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get('host'); }
  catch { return false; }
}
