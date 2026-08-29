const fs = require('fs');
const path = require('path');

// Load .env files manually (Node does not auto-load them; Prisma/Next do,
// but this script runs before those tools and must know the provider).
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(path.join(__dirname, '..', '.env'));
loadEnvFile(path.join(__dirname, '..', '.env.local'));

const url = process.env.DATABASE_URL || '';

let provider = 'postgresql';
if (url.startsWith('file:') || url.startsWith('sqlite')) {
  provider = 'sqlite';
}

const tplPath = path.join(__dirname, '..', 'prisma', 'schema.template.prisma');
const outPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

const content = fs.readFileSync(tplPath, 'utf8').replace('__PROVIDER__', provider);
fs.writeFileSync(outPath, content);

console.log(`[setup-prisma] Prisma provider resolved to: ${provider} (from DATABASE_URL="${url || '(unset)'}")`);
