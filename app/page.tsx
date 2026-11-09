import Link from 'next/link';
import { getDef } from '@/lib/questionnaires/definitions';

const def = getDef('entrepreneurship');

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="section-title">ARUSHA TECHNICAL COLLEGE</h1>
        <p className="muted">Entrepreneurship Centre — Training Needs Assessment Questionnaire</p>
        <p>
          The Entrepreneurship Centre at Arusha Technical College plans to offer practical short courses
          to help people start, run and grow their own businesses. This questionnaire will help us
          understand what you want to learn, so that we can design courses that meet your needs.
        </p>
        <p className="muted">
          It takes about 10 minutes to complete. Your answers are confidential and used only to plan training.
        </p>
        <div className="btn-row">
          <Link className="btn" href={`/fill/${def!.slug}`}>
            Fill the Entrepreneurship Centre Questionnaire
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Global Analysis</h3>
        <p className="muted">View aggregated results for the Entrepreneurship Centre questionnaire.</p>
        <Link className="btn secondary" href="/analysis?type=entrepreneurship">
          View Global Analysis
        </Link>
      </div>
    </main>
  );
}
