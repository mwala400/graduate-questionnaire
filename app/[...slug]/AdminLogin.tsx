'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin({ dashboardPath }: { loginPath: string; dashboardPath: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        router.push(dashboardPath);
        router.refresh();
      } else {
        setError('Incorrect code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card login-box">
        <h2 className="section-title">Restricted Access</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Access Code</label>
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter admin access code"
            />
          </div>
          {error && <div className="alert error">{error}</div>}
          <button className="btn" type="submit" disabled={loading || !code}>
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </main>
  );
}
