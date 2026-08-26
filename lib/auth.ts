import { SignJWT, jwtVerify } from 'jose';
import { timingSafeEqual } from 'crypto';
import { ADMIN_ACCESS_CODE, ADMIN_SESSION_SECRET, ADMIN_SESSION_HOURS } from './adminConfig';

export const ADMIN_COOKIE_NAME = 'atc_admin_session';

function getSecretKey() {
  const secret = ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short. Set a long random value in your .env file.'
    );
  }
  return new TextEncoder().encode(secret);
}

/** Constant-time comparison so the admin code can't be brute-forced via timing. */
export function isValidAdminCode(candidate: string): boolean {
  const expected = ADMIN_ACCESS_CODE || '';
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still run a comparison of equal-length buffers to avoid an obvious
    // early-exit timing signal on length mismatches.
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function createAdminSessionToken(): Promise<string> {
  const hours = ADMIN_SESSION_HOURS;
  const key = getSecretKey();
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${hours}h`)
    .sign(key);
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
