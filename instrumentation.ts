export async function register() {
  // Only run in the real Node.js server runtime (not the edge runtime, and
  // not during `next build`'s static analysis pass).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureAdminCredentials } = await import('./lib/adminCredentials');
    ensureAdminCredentials();
  }
}
