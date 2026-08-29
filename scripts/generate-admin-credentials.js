// Run with: npm run generate:admin
// Prints a fresh ADMIN_ACCESS_CODE and ADMIN_ROUTE_SECRET in the required
// format (a letter followed by digits, 8 characters total). Use this to
// get values to paste into Vercel's Project Settings -> Environment
// Variables before your first deploy (Vercel can't auto-generate and
// persist them itself, since its filesystem is read-only at runtime).
const crypto = require('crypto');

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generate() {
  const letter = LETTERS[crypto.randomInt(LETTERS.length)];
  let digits = '';
  for (let i = 0; i < 7; i++) digits += crypto.randomInt(10);
  return letter + digits;
}

const code = generate();
const route = generate();

console.log('\nGenerated admin credentials:\n');
console.log(`  ADMIN_ACCESS_CODE=${code}`);
console.log(`  ADMIN_ROUTE_SECRET=${route}`);
console.log('\nCopy these into your .env (local) and/or your Vercel project\'s');
console.log('Environment Variables (Project Settings -> Environment Variables),');
console.log(`then your admin login will be at: /${route}\n`);
