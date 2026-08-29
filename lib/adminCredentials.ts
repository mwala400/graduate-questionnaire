import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Format required: starts with a letter, followed by digits, 8 characters
// total (e.g. "K3948271"). Ambiguous letters (I, O) are excluded so codes
// are easy to read/type correctly.
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateAccessCode(): string {
  const letter = LETTERS[crypto.randomInt(LETTERS.length)];
  let digits = '';
  for (let i = 0; i < 7; i++) digits += crypto.randomInt(10);
  return letter + digits;
}

function upsertEnvLine(content: string, key: string, value: string): string {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(content)) return content.replace(re, line);
  return content.trimEnd() + (content.trim() ? '\n' : '') + line + '\n';
}

/**
 * Ensures ADMIN_ACCESS_CODE and ADMIN_ROUTE_SECRET exist for this process.
 * - If already set (e.g. via Vercel's Environment Variables), leaves them
 *   untouched and just prints them as a reminder.
 * - If missing (typical for a fresh local `npm run dev`), generates them,
 *   makes them available via process.env for this run, and — on a
 *   writable filesystem only — persists them to .env.local so they don't
 *   change on the next restart.
 * Always prints the current values to the console so they're visible
 * "pale unapo run" (every time you run the app).
 */
export function ensureAdminCredentials() {
  let code = process.env.ADMIN_ACCESS_CODE;
  let route = process.env.ADMIN_ROUTE_SECRET;
  let sessionSecret = process.env.ADMIN_SESSION_SECRET;
  let generated = false;

  if (!code) {
    code = generateAccessCode();
    process.env.ADMIN_ACCESS_CODE = code;
    generated = true;
  }
  if (!route) {
    route = generateAccessCode();
    process.env.ADMIN_ROUTE_SECRET = route;
    generated = true;
  }
  if (!sessionSecret || sessionSecret.length < 16) {
    sessionSecret = crypto.randomBytes(48).toString('hex');
    process.env.ADMIN_SESSION_SECRET = sessionSecret;
    generated = true;
  }

  if (generated) {
    try {
      const envLocalPath = path.join(process.cwd(), '.env.local');
      let content = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf8') : '';
      content = upsertEnvLine(content, 'ADMIN_ACCESS_CODE', code);
      content = upsertEnvLine(content, 'ADMIN_ROUTE_SECRET', route);
      content = upsertEnvLine(content, 'ADMIN_SESSION_SECRET', sessionSecret);
      fs.writeFileSync(envLocalPath, content);
    } catch {
      // Read-only filesystem (e.g. deployed on Vercel without these set) —
      // the values above still work for this running process; on Vercel
      // you should set them permanently in the dashboard instead (see README).
    }
  }

  // eslint-disable-next-line no-console
  console.log('\n──────────────────────────────────────────────');
  // eslint-disable-next-line no-console
  console.log(' ADMIN ACCESS' + (generated ? ' (auto-generated just now)' : ''));
  // eslint-disable-next-line no-console
  console.log(`   Login path : /${route}`);
  // eslint-disable-next-line no-console
  console.log(`   Access code: ${code}`);
  // eslint-disable-next-line no-console
  console.log('──────────────────────────────────────────────\n');
}
