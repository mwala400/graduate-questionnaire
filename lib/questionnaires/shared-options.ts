// Option lists reused by more than one questionnaire type. Kept separate
// from lib/questionnaires/definitions.ts so the definitions file stays a
// readable list of *structure*, not data.

export const RATING_LEVELS = ['Highly Recommended', 'Recommended', 'Not Recommended'] as const;
export type RatingLevel = (typeof RATING_LEVELS)[number];
export type MatrixAnswer = Record<string, RatingLevel>;

export const STATUS_OPTIONS = [
  'Central/Local Government',
  'Academia',
  'Professional Body',
  'Industry',
  'Regulatory Body',
  'Other'
];

export const ACTIVITY_OPTIONS = [
  'Production/Manufacturing',
  'Services',
  'Maintenance/Repair',
  'Construction',
  'Research and Development',
  'Education and Training',
  'Agriculture',
  'Other'
];

export const SOFT_SKILLS = [
  'Behavioral skills',
  'Organizational skills',
  'Teamwork',
  'Problem-solving skills',
  'Creativity',
  'Supervisory Skills',
  'Entrepreneurial Skills',
  'Interpersonal skills',
  'Initiative skills',
  'Intercultural skills',
  'Multiple tasking skills',
  'Innovation skills',
  'Leadership skills',
  'Customer care skills',
  'Effective oral and written communication skills',
  'Working under pressure',
  'Analytical skills',
  'Social and Emotional Intelligence',
  'Professional ethics'
];

export const PROFESSIONAL_SKILLS = [
  'Ability to gather and analyze business and user requirements',
  'Ability to design and deploy cloud-native applications',
  'Ability to apply AI tools to solve real-world business problems',
  'Ability to design, configure and maintain computer networks',
  'Ability to configure, maintain computers, servers and peripherals',
  'Ability to secure computer systems and applications.',
  'Ability to use software development frameworks',
  'Ability to perform digital marketing technologies and tools',
  'Ability to audit information systems',
  'Ability to design processes, architecture, data flows, and system components'
];

export const SPECIALIZATIONS = [
  'Internet Technologies',
  'Software Development',
  'Web Development',
  'Mobile Development',
  'Computer Networking',
  'Database Management',
  'Systems Administration',
  'Computer Maintenance',
  'Multimedia Technology',
  'Systems Analysis',
  'Cybersecurity',
  'IT Project Management',
  'Optical Fiber Communication',
  'Computer Programming',
  'Information System Auditing',
  'Business Analysis',
  'Digital Marketing',
  'AI Engineering'
];

export const CERTIFICATIONS = [
  'AWS Certified Developer / Cloud Practitioner',
  'Google Associate Cloud Engineer',
  'Microsoft Azure Developer Associate',
  'Oracle Java Certification (OCA/OCP)',
  'TensorFlow Developer Certificate (Google)',
  'MongoDB Certified Developer',
  'GitHub Actions / DevOps Certifications',
  'Certified Kubernetes Application Developer (CKAD)',
  'IBM Data Science Professional Certificate',
  'Meta Back-End / Front-End Developer Certificate',
  'CompTIA Linux+'
];

export const ATTACHMENT_DURATIONS = ['8 weeks', '12 weeks', '16 weeks', '24 weeks', 'One semester'];

export const PRACTICAL_ACTIVITIES = [
  'Live software projects',
  'Hackathons',
  'Capstone challenges',
  'Research projects',
  'Industry mentoring',
  'Professional certification prep',
  'Open-source contributions',
  'Innovation challenges',
  'Others'
];

export const COLLABORATION_OPTIONS = [
  'Industrial attachment hosting',
  'Guest lectures / seminars',
  'Adjunct teaching',
  'Research collaboration',
  'Curriculum review input',
  'Software/equipment donation',
  'Hackathon co-hosting',
  'Professional mentoring',
  'Scholarship/bursary',
  'Graduate employment',
  'Joint innovation projects',
  'Open-source collaboration',
  'Others'
];

// Table 5 - weighting of components. Columns A-E carry pre-set
// percentages; "OTHER" lets the respondent specify their own.
export const WEIGHTING_ROWS = [
  { key: 'lecture', label: 'Lecture' },
  { key: 'tutorial', label: 'Tutorial' },
  { key: 'practical', label: 'Practical work' },
  { key: 'visit', label: 'Industrial visit/Field works' },
  { key: 'professional', label: 'Professional lectures' }
] as const;

export const WEIGHTING_COLUMNS: Record<string, Record<(typeof WEIGHTING_ROWS)[number]['key'], number>> = {
  A: { lecture: 50, tutorial: 10, practical: 20, visit: 10, professional: 10 },
  B: { lecture: 40, tutorial: 10, practical: 30, visit: 10, professional: 10 },
  C: { lecture: 35, tutorial: 5, practical: 35, visit: 15, professional: 10 },
  D: { lecture: 30, tutorial: 5, practical: 40, visit: 15, professional: 10 },
  E: { lecture: 30, tutorial: 5, practical: 50, visit: 10, professional: 5 }
};

export const ASSESSMENT_MODES: Record<string, string> = {
  '60_40': '60% Semester Examination and 40% Continuous Assessment',
  '50_50': '50% Semester Examination and 50% Continuous Assessment',
  '40_60': '40% Semester Examination and 60% Continuous Assessment'
};

// ---- Employer-only option lists ----
export const INDUSTRY_TYPES = [
  'Banking',
  'Telecommunication',
  'Government',
  'Education',
  'Manufacturing/Industrial',
  'Mining',
  'Healthcare',
  'ICT Company',
  'Other'
];

export const ICT_STAFF_COUNTS = ['None', '1 – 5', '6 – 10', '11 – 20', 'Above 20'];

export const RECRUIT_COUNTS = ['None', '1–2', '3–5', 'More than 5'];

// ---- Professional-only option list (Table 6, simple tick, no rating) ----
export const ALUMNI_LINKAGE_ITEMS = [
  'Learning Facilities',
  'Industrial attachment',
  'Sponsor students',
  'Offer Professional lecture',
  'Industrial Visit',
  'Industrial Practical learning'
];
