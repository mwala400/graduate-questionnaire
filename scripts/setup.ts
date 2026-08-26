import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { genCompliantCode, genSessionSecret } from '../lib/adminConfig';

const envPath = join(process.cwd(), '.env');

const accessCode = genCompliantCode(8);
const routeSecret = genCompliantCode(8);
const sessionSecret = genSessionSecret();

let lines: string[] = [];
if (existsSync(envPath)) {
  lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
}

function setOrUpdate(key: string, value: string) {
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  const entry = `${key}="${value}"`;
  if (idx >= 0) lines[idx] = entry;
  else lines.push(entry);
}

// Only (re)generate the admin credentials; leave DATABASE_URL and
// ADMIN_SESSION_HOURS untouched if they already exist.
setOrUpdate('ADMIN_ACCESS_CODE', accessCode);
setOrUpdate('ADMIN_ROUTE_SECRET', routeSecret);
setOrUpdate('ADMIN_SESSION_SECRET', sessionSecret);

writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');

// eslint-disable-next-line no-console
console.log(
  [
    '',
    '========================================================',
    ' ADMIN CREDENTIALS GENERATED',
    '--------------------------------------------------------',
    ` Login URL  : http://localhost:3000/${routeSecret}`,
    ` Access code: ${accessCode}`,
    ' (saved to .env — copy these into your Vercel env vars)',
    '========================================================',
    ''
  ].join('\n')
);
