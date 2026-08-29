'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_TYPES } from '@/lib/questionnaires/definitions';

interface ResponseRow {
  id: string;
  type: string;
  createdAt: string;
  data: Record<string, any>;
}

export default function AdminDashboard({ loginPath }: { loginPath: string }) {
  const [activeType, setActiveType] = useState(ALL_TYPES[0].key);
  const [rows, setRows] = useState<ResponseRow[] | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  async function load(type: string) {
    setRows(null);
    const res = await fetch(`/api/responses?type=${type}`);
    if (res.status === 401) {
      router.push(loginPath);
      return;
    }
    const data = await res.json();
    setRows(data.responses);
  }

  useEffect(() => {
    load(activeType).catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(loginPath);
    router.refresh();
  }

  const activeDef = ALL_TYPES.find((d) => d.key === activeType)!;

  // Pick a couple of representative columns per type for the quick-glance table.
  function previewColumns(row: ResponseRow): { label: string; value: string }[] {
    const d = row.data || {};
    switch (row.type) {
      case 'employer':
        return [
          { label: 'Organisation', value: d.orgName || '—' },
          { label: 'Industry', value: d.industryType || '—' }
        ];
      default:
        return [
          { label: 'Name', value: d.name || '—' },
          { label: 'Status', value: d.status || '—' }
        ];
    }
  }

  return (
    <main className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title" style={{ border: 'none', margin: 0 }}>
            Admin Dashboard
          </h2>
          <button className="btn ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <h3 style={{ marginTop: 16 }}>Questionnaire type</h3>
        <div className="btn-row">
          {ALL_TYPES.map((def) => (
            <button key={def.key} className={activeType === def.key ? 'btn' : 'btn ghost'} onClick={() => setActiveType(def.key)}>
              {def.shortLabel}
            </button>
          ))}
        </div>
        <p className="muted">Total {activeDef.label.toLowerCase()} responses: {rows ? rows.length : '…'}</p>

        <h3 style={{ marginTop: 20 }}>Bulk downloads — {activeDef.shortLabel}</h3>
        <div className="btn-row">
          <a className="btn" href={`/api/admin/download/${activeType}/all/docx-zip`}>
            Download All (.docx ZIP)
          </a>
          <a className="btn" href={`/api/admin/download/${activeType}/all/pdf-zip`}>
            Download All (.pdf ZIP)
          </a>
          <a className="btn secondary" href={`/api/admin/download/${activeType}/all/excel`}>
            Download All (Excel .xlsx)
          </a>
          <a className="btn secondary" href={`/api/admin/download/${activeType}/all/full-zip`}>
            Download Full Folder (docx + pdf + Excel)
          </a>
        </div>

        <h3 style={{ marginTop: 20 }}>Everything, every type</h3>
        <div className="btn-row">
          <a className="btn ghost" href="/api/admin/download/everything-zip">
            Download ALL questionnaire types (one ZIP, organized by folder)
          </a>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">{activeDef.label} — All Responses</h3>
        {error && <div className="alert error">{error}</div>}
        {!rows ? (
          <p>Loading…</p>
        ) : rows.length === 0 ? (
          <p>No responses submitted yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>{previewColumns(rows[0]).map((c) => c.label).join(' / ')}</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{previewColumns(r).map((c) => c.value).join(' / ')}</td>
                    <td>
                      <a className="btn ghost" style={{ padding: '4px 10px', fontSize: 12, marginRight: 6 }} href={`/api/admin/download/${r.type}/${r.id}/docx`}>
                        .docx
                      </a>
                      <a className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} href={`/api/admin/download/${r.type}/${r.id}/pdf`}>
                        .pdf
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
