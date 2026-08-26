import { randomBytes, randomInt } from 'crypto';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALNUM = LOWER + '0123456789';

/**
 * Generates an admin-style code that:
 *  - starts with a letter (a–z)
 *  - contains at least one digit
 *  - is alphanumeric and at most `length` characters (default 8)
 * This matches the requested format for both the admin route and the login code.
 */
export function genCompliantCode(length = 8): string {
  const len = Math.max(2, length);
  let code = LOWER[randomInt(0, LOWER.length)];
  for (let i = 1; i < len - 1; i++) {
    code += ALNUM[randomInt(0, ALNUM.length)];
  }
  code += '0123456789'[randomInt(0, 10)]; // guarantee at least one number
  return code;
}

/** Long random hex string used to sign the admin session cookie. */
export function genSessionSecret(): string {
  return randomBytes(48).toString('hex');
}

const isProd = process.env.NODE_ENV === 'production';

function firstNonPlaceholder(value: string | undefined, placeholders: string[]): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (!v || placeholders.includes(v)) return undefined;
  return v;
}

// `.env` is the single source of truth for these values. They are NOT
// generated at runtime — doing so would produce different codes in Next.js's
// separate main/worker processes (and across serverless instances on Vercel),
// so the printed code would not match the one the server actually accepts.
// Generate them once with `npm run setup`, which writes a compliant code
// (starts with a letter, contains digits, max 8 chars) and route into `.env`
// and prints them. If a value is missing, it stays empty (admin login fails
// closed) and the startup banner tells you to run `npm run setup`.
export const ADMIN_ACCESS_CODE = firstNonPlaceholder(process.env.ADMIN_ACCESS_CODE, [
  'change-this-to-a-long-secret-code'
]) ?? '';

export const ADMIN_ROUTE_SECRET = firstNonPlaceholder(process.env.ADMIN_ROUTE_SECRET, ['gatekeeper-7f2c91']) ?? '';

export const ADMIN_SESSION_SECRET = firstNonPlaceholder(process.env.ADMIN_SESSION_SECRET, [
  'change-this-too-generate-a-random-64-char-hex-string'
]) ?? '';

export const ADMIN_SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 8);

/** Prints the admin login URL and access code to the console on server start. */
export function printAdminStartup(baseUrl = '') {
  const prefix = baseUrl || (isProd ? '(your site URL)' : 'http://localhost:3000');
  const loginUrl = ADMIN_ROUTE_SECRET ? `${prefix}/${ADMIN_ROUTE_SECRET}` : '(not set)';
  const code = ADMIN_ACCESS_CODE || '(not set — set ADMIN_ACCESS_CODE)';
  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      '========================================================',
      ' ADMIN ACCESS',
      '--------------------------------------------------------',
      ` Login URL  : ${loginUrl}`,
      ` Access code: ${code}`,
      '========================================================',
      ''
    ].join('\n')
  );
}
