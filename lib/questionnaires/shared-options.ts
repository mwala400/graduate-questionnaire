// Option lists reused by more than one questionnaire type. Kept separate
// from lib/questionnaires/definitions.ts so the definitions file stays a
// readable list of *structure*, not data.

export const RATING_LEVELS = ['Highly Recommended', 'Recommended', 'Not Recommended'] as const;
export type RatingLevel = (typeof RATING_LEVELS)[number];
export type MatrixAnswer = Record<string, string>;

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

// ---------------------------------------------------------------------
// ENTREPRENEURSHIP CENTRE — Training Needs Assessment option lists
// ---------------------------------------------------------------------

export const TRAINING_NEED_LEVELS = ['High need', 'Medium need', 'Low need', 'Not needed'] as const;
export type TrainingNeedLevel = (typeof TRAINING_NEED_LEVELS)[number];

export const RESPONDENT_GROUPS = [
  'Form four / form six leaver',
  'College or university graduate',
  'Youth seeking employment or self-employment',
  "Woman entrepreneur / member of a women's group (e.g. VICOBA)",
  'Tour operator, tour guide or tourism business owner',
  'Small business owner (shop, salon, food vendor, tailoring, etc.)',
  'Farmer or agro-processor',
  'Artisan or craft maker',
  'Employee planning to start a business',
  'Other'
];

export const GENDER_OPTIONS = ['Female', 'Male'];

export const AGE_OPTIONS = ['Below 18', '18–24', '25–35', '36–45', '46 and above'];

export const EDUCATION_OPTIONS = ['Primary', 'Form four', 'Form six', 'Certificate / Diploma', 'Degree and above'];

export const BUSINESS_SITUATION_OPTIONS = ['Yes', "No, but I plan to start one", "No, and I have no plans yet"];

export const BUSINESS_PERIOD_OPTIONS = ['Less than 1 year', '1–3 years', 'More than 3 years'];

export const REGISTRATION_OPTIONS = ['Yes (business licence / TIN)', 'No', 'Not applicable'];

export const CHALLENGES_OPTIONS = [
  'Lack of capital or access to loans',
  'Lack of a good business idea',
  'Lack of business knowledge and skills',
  'Finding customers and markets',
  'Keeping records and managing money',
  'Competition',
  'Business registration, licences and tax',
  'Lack of equipment or working space',
  'Other'
];

export const TRAINING_AREAS = [
  'Generating and testing business ideas',
  'Starting a business and writing a business plan',
  'Record keeping and bookkeeping',
  'Costing and pricing products or services',
  'Marketing and finding customers',
  'Digital marketing (WhatsApp Business, Instagram, Facebook)',
  'Customer care',
  'Accessing loans (banks, SACCOS, council youth and women loans)',
  'Business registration, licences and tax (BRELA, TIN, EFD)',
  'Savings, investment and group (VICOBA) management',
  'Packaging, branding and product quality (TBS)',
  'Value addition and food processing',
  'Tourism business: tour packaging, online bookings and guest service',
  'Selling crafts and products to tourists and export markets',
  'Leadership and teamwork',
  'Green business: reducing waste, reusing and recycling'
];

export const DURATION_OPTIONS = ['1 day', '2–3 days', '1 week', '2–4 weeks'];

export const TIME_OPTIONS = ['Weekdays (morning)', 'Weekdays (afternoon)', 'Evenings', 'Weekends'];

export const MODE_OPTIONS = ['Face-to-face', 'Online / phone', 'Both'];

export const LANGUAGE_OPTIONS = ['Kiswahili', 'English', 'Both'];

export const METHODS_OPTIONS = [
  'Practical / hands-on',
  'Group discussions',
  'Business visits',
  'Mentoring after training',
  'Lectures',
  'Certificate of completion'
];

export const AFFORD_OPTIONS = ['200,000–300,000', '300,001–400,000', '400,001–500,000', 'Above 500,000'];

export const SUPPORT_OPTIONS = [
  'Mentoring and follow-up visits',
  'Linking to loans and finance',
  'Business incubation (space and support to start)',
  'Linking to markets and trade fairs',
  'Help with business registration'
];

export const CONTACT_OPTIONS = ['Yes', 'No'];
