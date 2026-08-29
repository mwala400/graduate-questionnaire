'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionnaireDef } from '@/lib/questionnaires/blocks';
import { emptyPayload, Payload } from '@/lib/questionnaires/payload';
import { RATING_LEVELS, WEIGHTING_ROWS, WEIGHTING_COLUMNS, ASSESSMENT_MODES } from '@/lib/questionnaires/shared-options';

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function QuestionnaireForm({ def }: { def: QuestionnaireDef }) {
  const [payload, setPayload] = useState<Payload>(() => emptyPayload(def));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; id?: string } | null>(null);

  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  function set(key: string, value: any) {
    setPayload((p) => ({ ...p, [key]: value }));
  }

  // Load an existing draft (via ?draft= link) or restore a local autosave.
  useEffect(() => {
    const fromLink = searchParams.get('draft');
    if (fromLink) {
      fetch(`/api/drafts/${fromLink}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && d.data) {
            setPayload(d.data);
            setDraftId(d.id);
          }
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
      return;
    }
    try {
      const saved = localStorage.getItem(`atc-draft:${def.key}`);
      if (saved) setPayload(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, [def.key, searchParams]);

  // Autosave the current answers to this device (adaptive: works with no
  // account and complements the server-side draft resume link).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(`atc-draft:${def.key}`, JSON.stringify(payload));
    } catch {}
  }, [payload, loaded, def.key]);

  async function handleSaveDraft() {
    setSavingDraft(true);
    setDraftMsg(null);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: def.key, data: payload })
      });
      const d = await res.json();
      if (res.ok) {
        setDraftId(d.id);
        try {
          localStorage.setItem(`atc-draftId:${def.key}`, d.id);
        } catch {}
        setDraftMsg('Draft saved. Resume later with this link (copy it):');
      } else {
        setDraftMsg('Could not save draft: ' + (d.error || 'unknown error'));
      }
    } catch (err: any) {
      setDraftMsg('Network error saving draft: ' + String(err?.message || err));
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: def.key, data: payload })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: 'Thank you! Your response has been submitted successfully.', id: data.id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setResult({ ok: false, message: (data.error || 'Submission failed.') + (data.detail ? ` (${data.detail})` : '') });
      }
    } catch (err: any) {
      setResult({ ok: false, message: 'Network error: ' + String(err?.message || err) });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="card">
        <div className="alert success">{result.message}</div>
        <p>Save a copy of your response for your own records:</p>
        <div className="btn-row">
          <a className="btn" href={`/api/responses/${result.id}/docx`}>
            Download my response (.docx)
          </a>
          <a className="btn secondary" href={`/api/responses/${result.id}/pdf`}>
            Download my response (.pdf)
          </a>
        </div>
        <p className="muted" style={{ marginTop: 14 }}>
          Keep this page open or bookmark it — this download link is unique to your submission.
        </p>
        <button className="btn ghost" style={{ marginTop: 14 }} onClick={() => setResult(null)}>
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {result && !result.ok && <div className="alert error">{result.message}</div>}

      {groupBlocksIntoCards(def).map((group, i) => (
        <div className="card" key={i}>
          {group.map((block, bi) => (
            <BlockRenderer key={bi} block={block} payload={payload} set={set} />
          ))}
        </div>
      ))}

      <div className="card">
        <div className="btn-row">
          <button className="btn" type="submit" disabled={submitting || !loaded}>
            {submitting ? 'Submitting…' : 'Submit Questionnaire'}
          </button>
          <button
            className="btn secondary"
            type="button"
            disabled={savingDraft || !loaded}
            onClick={handleSaveDraft}
          >
            {savingDraft ? 'Saving…' : 'Save Draft'}
          </button>
        </div>

        {draftMsg && (
          <div className="alert info" style={{ marginTop: 14 }}>
            <p>{draftMsg}</p>
            {draftId && (
              <div className="draft-link-row">
                <input
                  readOnly
                  value={`/fill/${def.key}?draft=${draftId}`}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      (typeof window !== 'undefined' ? window.location.origin : '') + `/fill/${def.key}?draft=${draftId}`
                    )
                  }
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}

        {!draftMsg && draftId && (
          <p className="muted" style={{ marginTop: 12 }}>
            A saved draft exists for this form. <a href={`/fill/${def.key}?draft=${draftId}`}>Open resume link</a>.
          </p>
        )}
        <p className="muted" style={{ marginTop: 12 }}>
          Your progress is also auto-saved on this device.
        </p>
      </div>
    </form>
  );
}

// Groups consecutive blocks so each "heading" starts a new visual card,
// matching how the original documents break into sections.
function groupBlocksIntoCards(def: QuestionnaireDef) {
  const groups: any[][] = [];
  let current: any[] = [];
  for (const block of def.blocks) {
    if (block.type === 'heading' && current.length) {
      groups.push(current);
      current = [];
    }
    current.push(block);
  }
  if (current.length) groups.push(current);
  return groups;
}

function BlockRenderer({ block, payload, set }: { block: any; payload: Payload; set: (k: string, v: any) => void }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="section-title">{block.text}</h2>;
    case 'subheading':
      return <h3>{block.text}</h3>;
    case 'paragraph':
      return <p className="muted">{block.text}</p>;
    case 'fields':
      return (
        <>
          {block.fields.map((f: any) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <input type={f.kind || 'text'} value={payload[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
            </div>
          ))}
        </>
      );
    case 'text':
      return (
        <div className="field">
          <label>{block.label}</label>
          <textarea value={payload[block.key] || ''} onChange={(e) => set(block.key, e.target.value)} />
        </div>
      );
    case 'single':
      return (
        <>
          <div className="choice-grid">
            {block.options.map((opt: string) => (
              <label className="choice-row" key={opt}>
                <input type="radio" name={block.key} checked={payload[block.key] === opt} onChange={() => set(block.key, opt)} />
                {opt}
              </label>
            ))}
          </div>
          {block.otherKey && payload[block.key] === block.otherTrigger && (
            <div className="field">
              <label>Specify</label>
              <input type="text" value={payload[block.otherKey] || ''} onChange={(e) => set(block.otherKey, e.target.value)} />
            </div>
          )}
        </>
      );
    case 'multi':
      return (
        <>
          <div className="choice-grid">
            {block.options.map((opt: string) => (
              <label className="choice-row" key={opt}>
                <input
                  type="checkbox"
                  checked={(payload[block.key] || []).includes(opt)}
                  onChange={() => set(block.key, toggle(payload[block.key] || [], opt))}
                />
                {opt}
              </label>
            ))}
          </div>
          {block.otherKey && (payload[block.key] || []).includes(block.otherTrigger) && (
            <div className="field">
              <label>Specify</label>
              <input type="text" value={payload[block.otherKey] || ''} onChange={(e) => set(block.otherKey, e.target.value)} />
            </div>
          )}
        </>
      );
    case 'matrix': {
      const answers = payload[block.key] || {};
      return (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="matrix">
              <thead>
                <tr>
                  <th style={{ width: 30 }}>S/N</th>
                  <th style={{ textAlign: 'left' }}>{block.title}</th>
                  {RATING_LEVELS.map((lvl) => (
                    <th key={lvl}>{lvl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.items.map((item: string, idx: number) => (
                  <tr key={item}>
                    <td>{idx + 1}</td>
                    <td className="label">{item}</td>
                    {RATING_LEVELS.map((lvl) => (
                      <td key={lvl}>
                        <input
                          type="radio"
                          name={`${block.key}-${idx}`}
                          checked={answers[item] === lvl}
                          onChange={() => set(block.key, { ...answers, [item]: lvl })}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.otherKey && (
            <div className="field" style={{ marginTop: 12 }}>
              <label>{block.otherLabel || 'Other'}</label>
              <textarea value={payload[block.otherKey] || ''} onChange={(e) => set(block.otherKey, e.target.value)} />
            </div>
          )}
        </>
      );
    }
    case 'boolean-list': {
      const selected: string[] = payload[block.key] || [];
      return (
        <div style={{ overflowX: 'auto' }}>
          <table className="matrix">
            <thead>
              <tr>
                <th style={{ width: 30 }}>S/N</th>
                <th style={{ textAlign: 'left' }}>{block.title}</th>
                <th>Selected</th>
              </tr>
            </thead>
            <tbody>
              {block.items.map((item: string, idx: number) => (
                <tr key={item}>
                  <td>{idx + 1}</td>
                  <td className="label">{item}</td>
                  <td>
                    <input type="checkbox" checked={selected.includes(item)} onChange={() => set(block.key, toggle(selected, item))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'weighting': {
      const chosen = payload[block.key] || '';
      const other = payload[block.otherKey] || {};
      return (
        <>
          <h3>Table 5: Weighting of components — choose your recommended column</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="matrix">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Component</th>
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                  <th>Other</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHTING_ROWS.map((r) => (
                  <tr key={r.key}>
                    <td className="label">{r.label}</td>
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((c) => (
                      <td key={c}>{WEIGHTING_COLUMNS[c][r.key]}%</td>
                    ))}
                    <td>
                      <input
                        type="text"
                        style={{ width: 50 }}
                        value={other[r.key] ?? ''}
                        onChange={(e) => set(block.otherKey, { ...other, [r.key]: e.target.value === '' ? undefined : Number(e.target.value) })}
                        disabled={chosen !== 'OTHER'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="choice-grid" style={{ marginTop: 10 }}>
            {(['A', 'B', 'C', 'D', 'E', 'OTHER'] as const).map((c) => (
              <label className="choice-row" key={c}>
                <input type="radio" name={block.key} checked={chosen === c} onChange={() => set(block.key, c)} />
                Column {c}
              </label>
            ))}
          </div>

          {block.withAssessment && (
            <>
              <h3 style={{ marginTop: 20 }}>Mode of Assessment</h3>
              <div className="choice-grid">
                {Object.entries(ASSESSMENT_MODES).map(([modeKey, label]) => (
                  <label className="choice-row" key={modeKey}>
                    <input
                      type="radio"
                      name={block.assessmentKey}
                      checked={payload[block.assessmentKey] === modeKey}
                      onChange={() => set(block.assessmentKey, modeKey)}
                    />
                    {label}
                  </label>
                ))}
                <label className="choice-row">
                  <input
                    type="radio"
                    name={block.assessmentKey}
                    checked={payload[block.assessmentKey] === 'OTHER'}
                    onChange={() => set(block.assessmentKey, 'OTHER')}
                  />
                  Other:
                  <input
                    type="text"
                    placeholder="%"
                    style={{ width: 50 }}
                    disabled={payload[block.assessmentKey] !== 'OTHER'}
                    value={payload[block.assessmentOtherKey]?.semester ?? ''}
                    onChange={(e) => set(block.assessmentOtherKey, { ...payload[block.assessmentOtherKey], semester: Number(e.target.value) })}
                  />
                  % Semester /
                  <input
                    type="text"
                    placeholder="%"
                    style={{ width: 50 }}
                    disabled={payload[block.assessmentKey] !== 'OTHER'}
                    value={payload[block.assessmentOtherKey]?.continuous ?? ''}
                    onChange={(e) => set(block.assessmentOtherKey, { ...payload[block.assessmentOtherKey], continuous: Number(e.target.value) })}
                  />
                  % Continuous
                </label>
              </div>
            </>
          )}
        </>
      );
    }
    case 'respondent':
      return (
        <>
          <h2 className="section-title">Respondent Details</h2>
          <div className="field">
            <label>Name (optional)</label>
            <input type="text" value={payload.respondentName || ''} onChange={(e) => set('respondentName', e.target.value)} />
          </div>
          <div className="field">
            <label>Position</label>
            <input type="text" value={payload.respondentPosition || ''} onChange={(e) => set('respondentPosition', e.target.value)} />
          </div>
          <div className="field">
            <label>Phone/Email</label>
            <input type="text" value={payload.respondentPhone || ''} onChange={(e) => set('respondentPhone', e.target.value)} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={payload.respondentDate || ''} onChange={(e) => set('respondentDate', e.target.value)} />
          </div>
        </>
      );
    default:
      return null;
  }
}
