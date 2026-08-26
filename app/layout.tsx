import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "ATC IT Graduates' Curriculum Questionnaire",
  description: 'Curriculum review questionnaire for the Ordinary Diploma in Information Technology, Arusha Technical College'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top-header">
          <div className="top-header-inner">
            <img src="/logos/tanzania-emblem.png" alt="United Republic of Tanzania emblem" />
            <div>
              <h1>THE UNITED REPUBLIC OF TANZANIA — MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY</h1>
              <p>Arusha Technical College — Graduates&apos; Questionnaire for Review of Curriculum (Diploma in IT)</p>
            </div>
            <img src="/logos/atc-logo.png" alt="Arusha Technical College logo" />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
