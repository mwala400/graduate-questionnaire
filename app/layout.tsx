import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATC IT Curriculum Review Questionnaires',
  description: 'Curriculum review questionnaires (Graduate, Society, Employer, Professional) for the Ordinary Diploma in Information Technology, Arusha Technical College'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const staffSecret = process.env.ADMIN_ROUTE_SECRET;
  const staffHref = staffSecret ? `/${staffSecret}` : null;
  return (
    <html lang="en">
      <body>
        <header className="top-header">
          <div className="top-header-inner">
            <img src="/logos/tanzania-emblem.png" alt="United Republic of Tanzania emblem" />
            <div>
              <h1>THE UNITED REPUBLIC OF TANZANIA — MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY</h1>
              <p>Arusha Technical College — Curriculum Review Questionnaires (Diploma in IT)</p>
            </div>
            <img src="/logos/atc-logo.png" alt="Arusha Technical College logo" />
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <p className="muted">Arusha Technical College — Curriculum Review Portal</p>
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
