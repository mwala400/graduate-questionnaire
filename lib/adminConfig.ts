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

// Resolve each admin setting. In development, missing/placeholder values are
// auto-generated once per process so the app is usable immediately and the
// codes can be printed on startup. In production (e.g. Vercel) we never
// auto-generate at runtime — the values MUST come from environment variables,
// otherwise each serverless instance would get a different (useless) code.
export const ADMIN_ACCESS_CODE = (() => {
  const fromEnv = firstNonPlaceholder(process.env.ADMIN_ACCESS_CODE, ['change-this-to-a-long-secret-code']);
  if (fromEnv) return fromEnv;
  if (!isProd) {
    const g = genCompliantCode(8);
    process.env.ADMIN_ACCESS_CODE = g;
    return g;
  }
  return '';
})();

export const ADMIN_ROUTE_SECRET = (() => {
  const fromEnv = firstNonPlaceholder(process.env.ADMIN_ROUTE_SECRET, ['gatekeeper-7f2c91']);
  if (fromEnv) return fromEnv;
  if (!isProd) {
    const g = genCompliantCode(8);
    process.env.ADMIN_ROUTE_SECRET = g;
    return g;
  }
  return '';
})();

export const ADMIN_SESSION_SECRET = (() => {
  const fromEnv = firstNonPlaceholder(process.env.ADMIN_SESSION_SECRET, [
    'change-this-too-generate-a-random-64-char-hex-string'
  ]);
  if (fromEnv) return fromEnv;
  if (!isProd) {
    const g = genSessionSecret();
    process.env.ADMIN_SESSION_SECRET = g;
    return g;
  }
  return '';
})();

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
