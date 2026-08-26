import { QuestionnairePayload } from './schema';

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Prisma row -> nested payload shape used by the form/UI/docx generator. */
export function rowToPayload(row: any): QuestionnairePayload {
  return {
    name: row.name ?? undefined,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,

    status: row.status ?? undefined,
    statusOther: row.statusOther ?? undefined,

    activities: parseJson(row.activitiesJson, []),
    activitiesOther: row.activitiesOther ?? undefined,

    softSkills: parseJson(row.softSkillsJson, {}),
    softSkillsOther: row.softSkillsOther ?? undefined,

    professionalSkills: parseJson(row.professionalSkillsJson, {}),
    professionalSkillsOther: row.professionalSkillsOther ?? undefined,

    specializations: parseJson(row.specializationsJson, {}),
    specializationsOther: row.specializationsOther ?? undefined,
    knowledgeGap: row.knowledgeGap ?? undefined,

    certifications: parseJson(row.certificationsJson, {}),

    attachmentDuration: row.attachmentDuration ?? undefined,
    practicalActivities: parseJson(row.practicalActivitiesJson, []),
    practicalActivitiesOther: row.practicalActivitiesOther ?? undefined,

    collaboration: parseJson(row.collaborationJson, []),
    collaborationOther: row.collaborationOther ?? undefined,

    weightingColumn: row.weightingColumn ?? undefined,
    weightingOther: parseJson(row.weightingOtherJson, undefined as any),
    assessmentMode: row.assessmentMode ?? undefined,
    assessmentOther: parseJson(row.assessmentOtherJson, undefined as any),

    respondentName: row.respondentName ?? undefined,
    respondentPosition: row.respondentPosition ?? undefined,
    respondentPhone: row.respondentPhone ?? undefined,
    respondentDate: row.respondentDate ?? undefined
  };
}

/** Nested payload from the form -> flat Prisma `create` input. */
export function payloadToRowData(p: QuestionnairePayload) {
  return {
    name: p.name || null,
    address: p.address || null,
    phone: p.phone || null,
    email: p.email || null,

    status: p.status || null,
    statusOther: p.statusOther || null,

    activitiesJson: JSON.stringify(p.activities || []),
    activitiesOther: p.activitiesOther || null,

    softSkillsJson: JSON.stringify(p.softSkills || {}),
    softSkillsOther: p.softSkillsOther || null,

    professionalSkillsJson: JSON.stringify(p.professionalSkills || {}),
    professionalSkillsOther: p.professionalSkillsOther || null,

    specializationsJson: JSON.stringify(p.specializations || {}),
    specializationsOther: p.specializationsOther || null,
    knowledgeGap: p.knowledgeGap || null,

    certificationsJson: JSON.stringify(p.certifications || {}),

    attachmentDuration: p.attachmentDuration || null,
    practicalActivitiesJson: JSON.stringify(p.practicalActivities || []),
    practicalActivitiesOther: p.practicalActivitiesOther || null,

    collaborationJson: JSON.stringify(p.collaboration || []),
    collaborationOther: p.collaborationOther || null,

    weightingColumn: p.weightingColumn || null,
    weightingOtherJson: p.weightingOther ? JSON.stringify(p.weightingOther) : null,
    assessmentMode: p.assessmentMode || null,
    assessmentOtherJson: p.assessmentOther ? JSON.stringify(p.assessmentOther) : null,

    respondentName: p.respondentName || null,
    respondentPosition: p.respondentPosition || null,
    respondentPhone: p.respondentPhone || null,
    respondentDate: p.respondentDate || null
  };
}
