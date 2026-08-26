import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createAdminSessionToken, isValidAdminCode } from '@/lib/auth';
import { ADMIN_SESSION_HOURS } from '@/lib/adminConfig';

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: '' }));

  // Deliberately generic error message and identical response shape whether
  // the code is wrong or missing, so this endpoint doesn't leak which case
  // occurred to anyone probing it.
  if (typeof code !== 'string' || !isValidAdminCode(code)) {
    return NextResponse.json({ ok: false, error: 'Invalid code' }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const hours = ADMIN_SESSION_HOURS;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: hours * 60 * 60
  });
  return res;
}
