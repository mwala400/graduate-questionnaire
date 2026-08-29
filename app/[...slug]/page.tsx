import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/auth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// This single catch-all route is what keeps the admin area undiscoverable:
// there is no link to it anywhere in the UI, and any path that does not
// exactly match the ADMIN_ROUTE_SECRET from .env renders a completely
// ordinary Next.js 404 — identical to a path that was never a route at all.
export default async function CatchAllPage({ params }: { params: { slug: string[] } }) {
  const secret = process.env.ADMIN_ROUTE_SECRET;
  if (!secret) {
    // Misconfigured deployment: fail closed, not open.
    notFound();
  }

  const path = (params.slug || []).join('/');
  const loginPath = `/${secret}`;
  const dashboardPath = `/${secret}/dashboard`;

  if (path === secret) {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (await verifyAdminSessionToken(token)) {
      redirect(dashboardPath);
    }
    return <AdminLogin loginPath={loginPath} dashboardPath={dashboardPath} />;
  }

  if (path === `${secret}/dashboard`) {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      redirect(loginPath);
    }
    return <AdminDashboard loginPath={loginPath} />;
  }

  notFound();
}
