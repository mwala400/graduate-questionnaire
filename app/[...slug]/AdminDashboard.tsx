'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResponseRow {
  id: string;
  createdAt: string;
  name?: string;
  status?: string;
  respondentName?: string;
}

export default function AdminDashboard({ loginPath }: { loginPath: string }) {
  const [rows, setRows] = useState<ResponseRow[] | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  async function load() {
    const res = await fetch('/api/responses');
    if (res.status === 401) {
      router.push(loginPath);
      return;
    }
    const data = await res.json();
    setRows(data.responses);
  }

  useEffect(() => {
    load().catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(loginPath);
    router.refresh();
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
        <p className="muted">Total responses: {rows ? rows.length : '…'}</p>

        <h3 style={{ marginTop: 20 }}>Bulk downloads</h3>
        <div className="btn-row">
          <a className="btn" href="/api/admin/download/all/docx-zip">
            Download All (.docx ZIP)
          </a>
          <a className="btn" href="/api/admin/download/all/pdf-zip">
            Download All (.pdf ZIP)
          </a>
          <a className="btn secondary" href="/api/admin/download/all/excel">
            Download All (Excel .xlsx)
          </a>
          <a className="btn secondary" href="/api/admin/download/all/full-zip">
            Download Full Folder (docx + pdf + Excel)
          </a>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">All Responses</h3>
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
                  <th>Name</th>
                  <th>Status</th>
                  <th>Respondent</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{r.name || <span className="muted">— not given —</span>}</td>
                    <td>{r.status || ''}</td>
                    <td>{r.respondentName || ''}</td>
                    <td>
                      <a className="btn ghost" style={{ padding: '4px 10px', fontSize: 12, marginRight: 6 }} href={`/api/admin/download/${r.id}/docx`}>
                        .docx
                      </a>
                      <a className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} href={`/api/admin/download/${r.id}/pdf`}>
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
