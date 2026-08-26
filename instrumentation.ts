export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { printAdminStartup } = await import('@/lib/adminConfig');
    const base = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';
    printAdminStartup(base);
  }
}
