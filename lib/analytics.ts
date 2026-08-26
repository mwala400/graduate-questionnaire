import { rowToPayload } from './serialize';
import {
  ACTIVITY_OPTIONS,
  CERTIFICATIONS,
  PROFESSIONAL_SKILLS,
  RATING_LEVELS,
  SOFT_SKILLS,
  SPECIALIZATIONS,
  STATUS_OPTIONS
} from './schema';

function countBy(rows: any[], options: string[], accessor: (p: ReturnType<typeof rowToPayload>) => string | undefined) {
  return options.map((opt) => ({
    name: opt,
    count: rows.filter((r) => accessor(rowToPayload(r)) === opt).length
  }));
}

function countMulti(rows: any[], options: string[], accessor: (p: ReturnType<typeof rowToPayload>) => string[] | undefined) {
  return options.map((opt) => ({
    name: opt,
    count: rows.filter((r) => (accessor(rowToPayload(r)) || []).includes(opt)).length
  }));
}

function ratingBreakdown(rows: any[], items: string[], field: 'softSkills' | 'professionalSkills' | 'specializations' | 'certifications') {
  return items.map((item) => {
    const entry: Record<string, number | string> = { name: item };
    RATING_LEVELS.forEach((lvl) => {
      entry[lvl] = rows.filter((r) => {
        const answers = (rowToPayload(r) as any)[field] || {};
        return answers[item] === lvl;
      }).length;
    });
    return entry;
  });
}

export function buildAnalytics(rows: any[]) {
  return {
    totalResponses: rows.length,
    status: countBy(rows, STATUS_OPTIONS, (p) => p.status),
    activities: countMulti(rows, ACTIVITY_OPTIONS, (p) => p.activities),
    softSkills: ratingBreakdown(rows, SOFT_SKILLS, 'softSkills'),
    professionalSkills: ratingBreakdown(rows, PROFESSIONAL_SKILLS, 'professionalSkills'),
    specializations: ratingBreakdown(rows, SPECIALIZATIONS, 'specializations'),
    certifications: ratingBreakdown(rows, CERTIFICATIONS, 'certifications')
  };
}
