'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type RatingRow = Record<string, string | number>;

interface Analytics {
  totalResponses: number;
  status: { name: string; count: number }[];
  activities: { name: string; count: number }[];
  softSkills: RatingRow[];
  professionalSkills: RatingRow[];
  specializations: RatingRow[];
  certifications: RatingRow[];
}

function RatingChart({ title, data }: { title: string; data: RatingRow[] }) {
  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>
      <div style={{ width: '100%', height: Math.max(260, data.length * 32) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Highly Recommended" stackId="a" fill="#1b7a3e" />
            <Bar dataKey="Recommended" stackId="a" fill="#5b9bd5" />
            <Bar dataKey="Not Recommended" stackId="a" fill="#c0504d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analysis')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <main className="container">Failed to load analysis: {error}</main>;
  if (!data) return <main className="container">Loading…</main>;

  if (data.totalResponses === 0) {
    return (
      <main className="container">
        <div className="card">
          <h2 className="section-title">Global Analysis</h2>
          <p>No responses have been submitted yet. Check back after respondents start filling the questionnaire.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h2 className="section-title">Global Analysis</h2>
        <p>
          Based on <strong>{data.totalResponses}</strong> submitted response{data.totalResponses === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="card">
        <h3 className="section-title">Respondent Status</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data.status} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0b3d91" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Main Activities of Respondents</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data.activities} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1b7a3e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <RatingChart title="Soft Skills — Recommendation Breakdown" data={data.softSkills} />
      <RatingChart title="Professional Skills — Recommendation Breakdown" data={data.professionalSkills} />
      <RatingChart title="Areas of Specialization — Recommendation Breakdown" data={data.specializations} />
      <RatingChart title="Industry Certifications — Recommendation Breakdown" data={data.certifications} />
    </main>
  );
}
