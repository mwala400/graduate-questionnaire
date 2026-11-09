import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Entrepreneurship Centre — Arusha Technical College',
  description: 'Training Needs Assessment Questionnaire for the Entrepreneurship Centre, Arusha Technical College'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const staffSecret = process.env.ADMIN_ROUTE_SECRET;
  const staffHref = staffSecret ? `/${staffSecret}` : null;
  return (
    <html lang="en">
      <body>
        <header className="top-header">
          <div className="top-header-inner">
            <div>
              <h1>ARUSHA TECHNICAL COLLEGE</h1>
              <p>Entrepreneurship Centre</p>
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <p className="muted">Entrepreneurship Centre, Arusha Technical College — Training Needs Assessment</p>
          {staffHref && (
            <p>
              <a className="staff-link" href={staffHref}>
                Staff / Admin Login
              </a>
            </p>
          )}
        </footer>
      </body>
    </html>
  );
}
