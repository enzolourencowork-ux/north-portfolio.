import { NextResponse } from 'next/server';
import { clearSessionCookie, validOrigin } from '../../../../lib/auth';
export async function POST(request) {
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
