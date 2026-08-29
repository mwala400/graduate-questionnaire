import Link from 'next/link';
import { ALL_TYPES } from '@/lib/questionnaires/definitions';

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h2 className="section-title">Welcome</h2>
        <p>
          This portal collects feedback for the curriculum review of the Ordinary Diploma in
          Information Technology (NTA Level 4–6) at Arusha Technical College, from four groups of
          respondents. Each group has its own questionnaire and its own shareable link below.
        </p>
      </div>

      <div className="card">
        <h3 className="section-title">Fill a Questionnaire</h3>
        <p className="muted">Share the matching link with each audience — everyone fills only their own form.</p>
        <div className="btn-row">
          {ALL_TYPES.map((def) => (
            <Link key={def.key} className="btn" href={`/fill/${def.slug}`}>
              {def.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Global Analysis</h3>
        <p className="muted">Aggregated results are public, broken down by respondent type.</p>
        <Link className="btn secondary" href="/analysis">
          View Global Analysis
        </Link>
      </div>
    </main>
  );
}
