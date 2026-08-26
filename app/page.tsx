import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h2 className="section-title">Welcome</h2>
        <p>
          This portal collects employer, alumni, and industry feedback for the curriculum review of the
          Ordinary Diploma in Information Technology (NTA Level 4–6) at Arusha Technical College.
        </p>
        <div className="nav-links">
          <Link className="btn" href="/fill">
            Fill the Questionnaire
          </Link>
          <Link className="btn secondary" href="/analysis">
            View Global Analysis
          </Link>
        </div>
      </div>
    </main>
  );
}
