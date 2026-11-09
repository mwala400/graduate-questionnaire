import { notFound } from 'next/navigation';
import { getDef } from '@/lib/questionnaires/definitions';
import QuestionnaireForm from '@/components/QuestionnaireForm';

export default function FillTypePage({ params }: { params: { type: string } }) {
  const def = getDef(params.type);
  if (!def) notFound();

  return (
    <main className="container">
      <div className="card">
        <h2 className="section-title">{def.label}</h2>
        <p className="muted">Arusha Technical College — Entrepreneurship Centre</p>
      </div>
      <QuestionnaireForm def={def} />
    </main>
  );
}
