import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from './auth';

/** Returns true if the current request carries a valid admin session cookie. */
export async function isAdminRequest(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}
