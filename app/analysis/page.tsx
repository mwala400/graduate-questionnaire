'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ALL_TYPES } from '@/lib/questionnaires/definitions';

interface ChartSection {
  key: string;
  title: string;
  kind: 'single' | 'multi' | 'matrix' | 'boolean-list';
  data: Record<string, number | string>[];
}

interface AnalyticsResponse {
  type: string;
  label: string;
  totalResponses: number;
  sections: ChartSection[];
}

function SingleOrMultiChart({ section }: { section: ChartSection }) {
  return (
    <div className="card">
      <h3 className="section-title">{section.title}</h3>
      <div style={{ width: '100%', height: Math.max(220, section.data.length * 34) }}>
        <ResponsiveContainer>
          <BarChart data={section.data} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0b3d91" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MatrixChart({ section }: { section: ChartSection }) {
  return (
    <div className="card">
      <h3 className="section-title">{section.title}</h3>
      <div style={{ width: '100%', height: Math.max(260, section.data.length * 32) }}>
        <ResponsiveContainer>
          <BarChart data={section.data} layout="vertical" margin={{ left: 40, right: 20 }}>
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
  const [type, setType] = useState(ALL_TYPES[0].key);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/analysis?type=${type}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [type]);

  return (
    <main className="container">
      <div className="card">
        <h2 className="section-title">Global Analysis</h2>
        <div className="btn-row">
          {ALL_TYPES.map((def) => (
            <button key={def.key} className={type === def.key ? 'btn' : 'btn ghost'} onClick={() => setType(def.key)}>
              {def.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card">Failed to load analysis: {error}</div>}

      {!data ? (
        <div className="card">Loading…</div>
      ) : data.totalResponses === 0 ? (
        <div className="card">
          <p>No {data.label} responses have been submitted yet.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <p>
              Based on <strong>{data.totalResponses}</strong> submitted {data.label.toLowerCase()} response{data.totalResponses === 1 ? '' : 's'}.
            </p>
          </div>
          {data.sections.map((section) =>
            section.kind === 'matrix' ? (
              <MatrixChart key={section.key} section={section} />
            ) : section.kind === 'boolean-list' ? (
              <SingleOrMultiChart key={section.key} section={section} />
            ) : (
              <SingleOrMultiChart key={section.key} section={section} />
            )
          )}
        </>
      )}
    </main>
  );
}
