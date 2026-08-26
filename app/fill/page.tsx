'use client';

import { useEffect, useState } from 'react';
import RatingMatrix from './RatingMatrix';
import {
  ACTIVITY_OPTIONS,
  ASSESSMENT_MODES,
  ATTACHMENT_DURATIONS,
  CERTIFICATIONS,
  COLLABORATION_OPTIONS,
  MatrixAnswer,
  PRACTICAL_ACTIVITIES,
  PROFESSIONAL_SKILLS,
  QuestionnairePayload,
  SOFT_SKILLS,
  SPECIALIZATIONS,
  STATUS_OPTIONS,
  WEIGHTING_COLUMNS
} from '@/lib/schema';

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const DRAFT_KEY = 'atc-questionnaire-draft-v1';

type DraftState = {
  name: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  statusOther: string;
  activities: string[];
  activitiesOther: string;
  softSkills: MatrixAnswer;
  softSkillsOther: string;
  professionalSkills: MatrixAnswer;
  professionalSkillsOther: string;
  specializations: MatrixAnswer;
  specializationsOther: string;
  knowledgeGap: string;
  certifications: MatrixAnswer;
  attachmentDuration: string;
  practicalActivities: string[];
  practicalActivitiesOther: string;
  collaboration: string[];
  collaborationOther: string;
  weightingColumn: string;
  weightingOther: { lecture?: number; tutorial?: number; practical?: number; visit?: number; professional?: number };
  assessmentMode: string;
  assessmentOther: { semester?: number; continuous?: number };
  respondentName: string;
  respondentPosition: string;
  respondentPhone: string;
  respondentDate: string;
};

export default function FillPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [status, setStatus] = useState('');
  const [statusOther, setStatusOther] = useState('');

  const [activities, setActivities] = useState<string[]>([]);
  const [activitiesOther, setActivitiesOther] = useState('');

  const [softSkills, setSoftSkills] = useState<MatrixAnswer>({});
  const [softSkillsOther, setSoftSkillsOther] = useState('');

  const [professionalSkills, setProfessionalSkills] = useState<MatrixAnswer>({});
  const [professionalSkillsOther, setProfessionalSkillsOther] = useState('');

  const [specializations, setSpecializations] = useState<MatrixAnswer>({});
  const [specializationsOther, setSpecializationsOther] = useState('');
  const [knowledgeGap, setKnowledgeGap] = useState('');

  const [certifications, setCertifications] = useState<MatrixAnswer>({});

  const [attachmentDuration, setAttachmentDuration] = useState('');
  const [practicalActivities, setPracticalActivities] = useState<string[]>([]);
  const [practicalActivitiesOther, setPracticalActivitiesOther] = useState('');

  const [collaboration, setCollaboration] = useState<string[]>([]);
  const [collaborationOther, setCollaborationOther] = useState('');

  const [weightingColumn, setWeightingColumn] = useState('');
  const [weightingOther, setWeightingOther] = useState<{ lecture?: number; tutorial?: number; practical?: number; visit?: number; professional?: number }>({});
  const [assessmentMode, setAssessmentMode] = useState('');
  const [assessmentOther, setAssessmentOther] = useState<{ semester?: number; continuous?: number }>({});

  const [respondentName, setRespondentName] = useState('');
  const [respondentPosition, setRespondentPosition] = useState('');
  const [respondentPhone, setRespondentPhone] = useState('');
  const [respondentDate, setRespondentDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem(DRAFT_KEY)) {
        setDraftAvailable(true);
      }
    } catch {
      /* ignore storage access errors */
    }
  }, []);

  function gatherDraft(): DraftState {
    return {
      name, address, phone, email,
      status, statusOther,
      activities, activitiesOther,
      softSkills, softSkillsOther,
      professionalSkills, professionalSkillsOther,
      specializations, specializationsOther, knowledgeGap,
      certifications,
      attachmentDuration, practicalActivities, practicalActivitiesOther,
      collaboration, collaborationOther,
      weightingColumn, weightingOther,
      assessmentMode, assessmentOther,
      respondentName, respondentPosition, respondentPhone, respondentDate
    };
  }

  function applyDraft(d: DraftState) {
    setName(d.name ?? '');
    setAddress(d.address ?? '');
    setPhone(d.phone ?? '');
    setEmail(d.email ?? '');
    setStatus(d.status ?? '');
    setStatusOther(d.statusOther ?? '');
    setActivities(d.activities ?? []);
    setActivitiesOther(d.activitiesOther ?? '');
    setSoftSkills(d.softSkills ?? {});
    setSoftSkillsOther(d.softSkillsOther ?? '');
    setProfessionalSkills(d.professionalSkills ?? {});
    setProfessionalSkillsOther(d.professionalSkillsOther ?? '');
    setSpecializations(d.specializations ?? {});
    setSpecializationsOther(d.specializationsOther ?? '');
    setKnowledgeGap(d.knowledgeGap ?? '');
    setCertifications(d.certifications ?? {});
    setAttachmentDuration(d.attachmentDuration ?? '');
    setPracticalActivities(d.practicalActivities ?? []);
    setPracticalActivitiesOther(d.practicalActivitiesOther ?? '');
    setCollaboration(d.collaboration ?? []);
    setCollaborationOther(d.collaborationOther ?? '');
    setWeightingColumn(d.weightingColumn ?? '');
    setWeightingOther(d.weightingOther ?? {});
    setAssessmentMode(d.assessmentMode ?? '');
    setAssessmentOther(d.assessmentOther ?? {});
    setRespondentName(d.respondentName ?? '');
    setRespondentPosition(d.respondentPosition ?? '');
    setRespondentPhone(d.respondentPhone ?? '');
    setRespondentDate(d.respondentDate ?? '');
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(gatherDraft()));
      setDraftAvailable(true);
      setDraftLoaded(true);
      setResult({ ok: true, message: 'Draft saved on this device. You can return later and load it to continue.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setResult({ ok: false, message: 'Could not save draft (browser storage unavailable).' });
    }
  }

  function loadDraft() {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      applyDraft(JSON.parse(raw));
      setDraftLoaded(true);
      setResult({ ok: true, message: 'Draft loaded. Continue filling the form and submit when ready.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setResult({ ok: false, message: 'Could not load saved draft.' });
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setDraftAvailable(false);
    setDraftLoaded(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const payload: QuestionnairePayload = {
      name,
      address,
      phone,
      email,
      status,
      statusOther,
      activities,
      activitiesOther,
      softSkills,
      softSkillsOther,
      professionalSkills,
      professionalSkillsOther,
      specializations,
      specializationsOther,
      knowledgeGap,
      certifications,
      attachmentDuration,
      practicalActivities,
      practicalActivitiesOther,
      collaboration,
      collaborationOther,
      weightingColumn,
      weightingOther,
      assessmentMode,
      assessmentOther,
      respondentName,
      respondentPosition,
      respondentPhone,
      respondentDate
    };

    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        clearDraft();
        setResult({ ok: true, message: 'Thank you! Your response has been submitted successfully.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setResult({ ok: false, message: data.error || 'Submission failed. Please try again.' });
      }
    } catch (err: any) {
      setResult({ ok: false, message: 'Network error: ' + String(err?.message || err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      {result && <div className={`alert ${result.ok ? 'success' : 'error'}`}>{result.message}</div>}

      {draftAvailable && !draftLoaded && (
        <div className="alert info">
          <p className="muted" style={{ margin: 0 }}>A saved draft was found on this device.</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={loadDraft}>Load saved draft</button>
            <button type="button" className="btn ghost" onClick={clearDraft}>Discard draft</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 className="section-title">Introduction</h2>
          <p className="muted">
            This questionnaire is part of the curriculum review for the Ordinary Diploma in Information Technology
            programme at Arusha Technical College, conducted in line with NACTVET requirements. All information
            provided will be treated with strict confidentiality and used solely for curriculum review purposes.
          </p>
        </div>

        <div className="card">
          <h2 className="section-title">Section A: Characteristics of a Respondent</h2>
          <h3>A1: Personal Particulars</h3>
          <div className="field">
            <label>Name (Optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <h3>A2: Status</h3>
          <div className="choice-grid">
            {STATUS_OPTIONS.map((opt) => (
              <label className="choice-row" key={opt}>
                <input type="radio" name="status" checked={status === opt} onChange={() => setStatus(opt)} />
                {opt}
              </label>
            ))}
          </div>
          {status === 'Other' && (
            <div className="field">
              <label>Specify</label>
              <input type="text" value={statusOther} onChange={(e) => setStatusOther(e.target.value)} />
            </div>
          )}

          <h3>A3: Main Activities</h3>
          <div className="choice-grid">
            {ACTIVITY_OPTIONS.map((opt) => (
              <label className="choice-row" key={opt}>
                <input type="checkbox" checked={activities.includes(opt)} onChange={() => setActivities(toggle(activities, opt))} />
                {opt}
              </label>
            ))}
          </div>
          {activities.includes('Other') && (
            <div className="field">
              <label>Specify</label>
              <input type="text" value={activitiesOther} onChange={(e) => setActivitiesOther(e.target.value)} />
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Section B: Recommendations on Competencies</h2>
          <h3>B1: Recommended Soft Skills by Employers</h3>
          <RatingMatrix title="Recommended Soft Skills" items={SOFT_SKILLS} value={softSkills} onChange={setSoftSkills} />
          <div className="field" style={{ marginTop: 12 }}>
            <label>Other soft skills not specified above</label>
            <textarea value={softSkillsOther} onChange={(e) => setSoftSkillsOther(e.target.value)} />
          </div>

          <h3>B2: Recommended Professional Skills by Employers</h3>
          <RatingMatrix title="Recommended Professional Skills" items={PROFESSIONAL_SKILLS} value={professionalSkills} onChange={setProfessionalSkills} />
          <div className="field" style={{ marginTop: 12 }}>
            <label>Other professional skills not specified above</label>
            <textarea value={professionalSkillsOther} onChange={(e) => setProfessionalSkillsOther(e.target.value)} />
          </div>

          <h3>B3: Important Areas of Specialization for Curriculum Review</h3>
          <RatingMatrix title="Area of Specialization" items={SPECIALIZATIONS} value={specializations} onChange={setSpecializations} />
          <div className="field" style={{ marginTop: 12 }}>
            <label>Other specialization not listed above</label>
            <textarea value={specializationsOther} onChange={(e) => setSpecializationsOther(e.target.value)} />
          </div>
          <div className="field">
            <label>Competence/knowledge you wish had been taught before joining industry/work/business</label>
            <textarea value={knowledgeGap} onChange={(e) => setKnowledgeGap(e.target.value)} />
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Section C: Industry Certifications</h2>
          <RatingMatrix title="Recommended Certifications" items={CERTIFICATIONS} value={certifications} onChange={setCertifications} />
        </div>

        <div className="card">
          <h2 className="section-title">Section D: Industrial Training (Field Attachment)</h2>
          <h3>1. Recommended duration of industrial attachment</h3>
          <div className="choice-grid">
            {ATTACHMENT_DURATIONS.map((opt) => (
              <label className="choice-row" key={opt}>
                <input type="radio" name="attachmentDuration" checked={attachmentDuration === opt} onChange={() => setAttachmentDuration(opt)} />
                {opt}
              </label>
            ))}
          </div>

          <h3>2. Practical activities during attachment</h3>
          <div className="choice-grid">
            {PRACTICAL_ACTIVITIES.map((opt) => (
              <label className="choice-row" key={opt}>
                <input type="checkbox" checked={practicalActivities.includes(opt)} onChange={() => setPracticalActivities(toggle(practicalActivities, opt))} />
                {opt}
              </label>
            ))}
          </div>
          {practicalActivities.includes('Others') && (
            <div className="field">
              <label>Specify</label>
              <input type="text" value={practicalActivitiesOther} onChange={(e) => setPracticalActivitiesOther(e.target.value)} />
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Section E: Industry–College Collaboration</h2>
          <h3>How can your organisation support the programme?</h3>
          <div className="choice-grid">
            {COLLABORATION_OPTIONS.map((opt) => (
              <label className="choice-row" key={opt}>
                <input type="checkbox" checked={collaboration.includes(opt)} onChange={() => setCollaboration(toggle(collaboration, opt))} />
                {opt}
              </label>
            ))}
          </div>
          {collaboration.includes('Others') && (
            <div className="field">
              <label>Specify</label>
              <input type="text" value={collaborationOther} onChange={(e) => setCollaborationOther(e.target.value)} />
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Section F: Mode of Delivery &amp; Industry Engagement</h2>
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
                {(['lecture', 'tutorial', 'practical', 'visit', 'professional'] as const).map((key) => (
                  <tr key={key}>
                    <td className="label" style={{ textTransform: 'capitalize' }}>
                      {key === 'visit' ? 'Industrial visit/Field works' : key}
                    </td>
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((c) => (
                      <td key={c}>{WEIGHTING_COLUMNS[c][key]}%</td>
                    ))}
                    <td>
                      <input
                        type="text"
                        style={{ width: 50 }}
                        value={weightingOther[key] ?? ''}
                        onChange={(e) =>
                          setWeightingOther({ ...weightingOther, [key]: e.target.value === '' ? undefined : Number(e.target.value) })
                        }
                        disabled={weightingColumn !== 'OTHER'}
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
                <input type="radio" name="weightingColumn" checked={weightingColumn === c} onChange={() => setWeightingColumn(c)} />
                Column {c}
              </label>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>Mode of Assessment</h3>
          <div className="choice-grid">
            {Object.entries(ASSESSMENT_MODES).map(([key, label]) => (
              <label className="choice-row" key={key}>
                <input type="radio" name="assessmentMode" checked={assessmentMode === key} onChange={() => setAssessmentMode(key)} />
                {label}
              </label>
            ))}
            <label className="choice-row">
              <input type="radio" name="assessmentMode" checked={assessmentMode === 'OTHER'} onChange={() => setAssessmentMode('OTHER')} />
              Other:
              <input
                type="text"
                placeholder="%"
                style={{ width: 50 }}
                disabled={assessmentMode !== 'OTHER'}
                value={assessmentOther.semester ?? ''}
                onChange={(e) => setAssessmentOther({ ...assessmentOther, semester: Number(e.target.value) })}
              />
              % Semester /
              <input
                type="text"
                placeholder="%"
                style={{ width: 50 }}
                disabled={assessmentMode !== 'OTHER'}
                value={assessmentOther.continuous ?? ''}
                onChange={(e) => setAssessmentOther({ ...assessmentOther, continuous: Number(e.target.value) })}
              />
              % Continuous
            </label>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Respondent Details</h2>
          <div className="field">
            <label>Name (optional)</label>
            <input type="text" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} />
          </div>
          <div className="field">
            <label>Position</label>
            <input type="text" value={respondentPosition} onChange={(e) => setRespondentPosition(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone/Email</label>
            <input type="text" value={respondentPhone} onChange={(e) => setRespondentPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={respondentDate} onChange={(e) => setRespondentDate(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Questionnaire'}
            </button>
            <button className="btn ghost" type="button" onClick={saveDraft}>
              Save draft for later
            </button>
            {draftAvailable && (
              <button className="btn ghost" type="button" onClick={clearDraft}>
                Clear saved draft
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
