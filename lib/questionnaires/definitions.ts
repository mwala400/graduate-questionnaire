import { Block, QuestionnaireDef } from './blocks';
import {
  ACTIVITY_OPTIONS,
  ALUMNI_LINKAGE_ITEMS,
  ATTACHMENT_DURATIONS,
  CERTIFICATIONS,
  COLLABORATION_OPTIONS,
  ICT_STAFF_COUNTS,
  INDUSTRY_TYPES,
  PRACTICAL_ACTIVITIES,
  PROFESSIONAL_SKILLS,
  RECRUIT_COUNTS,
  SOFT_SKILLS,
  SPECIALIZATIONS,
  STATUS_OPTIONS
} from './shared-options';

const INTRO_PARAGRAPH =
  'This questionnaire is part of the curriculum review for the Ordinary Diploma in Information Technology programme at Arusha Technical College, conducted in line with NACTVET requirements. The review aims to ensure the curricula remain relevant to labour market demands, technological advancement, industry requirements, national development priorities, global ICT standards, and professional expectations. All information provided will be treated with strict confidentiality and used solely for curriculum review and improvement purposes.';

const introBlocks: Block[] = [
  { type: 'subheading', text: 'Introduction' },
  { type: 'paragraph', text: 'Dear Respondent,' },
  { type: 'paragraph', text: INTRO_PARAGRAPH },
  { type: 'paragraph', text: 'Thank you for your valuable contribution.' }
];

const personalParticularsBlocks: Block[] = [
  { type: 'heading', text: 'Section A: Characteristics of a Respondent' },
  { type: 'subheading', text: 'A1: Personal Particulars' },
  {
    type: 'fields',
    fields: [
      { key: 'name', label: 'Name (Optional)' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone number', kind: 'tel' },
      { key: 'email', label: 'E-mail', kind: 'email' }
    ]
  },
  { type: 'subheading', text: 'A2: Status' },
  { type: 'single', key: 'status', options: STATUS_OPTIONS, otherTrigger: 'Other', otherKey: 'statusOther' },
  { type: 'subheading', text: 'A3: Main Activities' },
  { type: 'multi', key: 'activities', options: ACTIVITY_OPTIONS, otherTrigger: 'Other', otherKey: 'activitiesOther' }
];

const skillsBlocks: Block[] = [
  { type: 'heading', text: 'Section B: Recommendations on Competencies' },
  { type: 'subheading', text: 'B1: Recommended Soft Skills by Employers' },
  { type: 'matrix', key: 'softSkills', title: 'Recommended Soft Skills', items: SOFT_SKILLS, otherKey: 'softSkillsOther', otherLabel: 'Other soft skills not specified above' },
  { type: 'subheading', text: 'B2: Recommended Professional Skills by Employers' },
  {
    type: 'matrix',
    key: 'professionalSkills',
    title: 'Recommended Professional Skills',
    items: PROFESSIONAL_SKILLS,
    otherKey: 'professionalSkillsOther',
    otherLabel: 'Other professional skills not specified above'
  },
  { type: 'subheading', text: 'B3: Important Areas of Specialization for Curriculum Review' },
  {
    type: 'matrix',
    key: 'specializations',
    title: 'Area of Specialization',
    items: SPECIALIZATIONS,
    otherKey: 'specializationsOther',
    otherLabel: 'Other specialization not listed above'
  }
];

const certificationsBlock: Block = {
  type: 'matrix',
  key: 'certifications',
  title: 'Recommended Certifications',
  items: CERTIFICATIONS
};

const respondentBlock: Block = { type: 'respondent' };

// ---------------------------------------------------------------------
// GRADUATE
// ---------------------------------------------------------------------
export const GRADUATE_DEF: QuestionnaireDef = {
  key: 'graduate',
  slug: 'graduate',
  label: "Graduates' Questionnaire",
  shortLabel: 'Graduate',
  docTitle: "GRADUATES' QUESTIONNAIRE FOR REVIEW OF CURRICULUM FOR ORDINARY DIPLOMA PROGRAMME IN INFORMATION TECHNOLOGY",
  blocks: [
    ...introBlocks,
    ...personalParticularsBlocks,
    ...skillsBlocks,
    { type: 'text', key: 'knowledgeGap', label: 'Competence/knowledge you wish had been taught before joining industry/work/business' },
    { type: 'heading', text: 'Section C: Industry Certifications for Diploma of Information Technology Graduates' },
    certificationsBlock,
    { type: 'heading', text: 'Section D: Industrial Training (Field Attachment)' },
    { type: 'subheading', text: '1. Recommended duration of industrial attachment' },
    { type: 'single', key: 'attachmentDuration', options: ATTACHMENT_DURATIONS },
    { type: 'subheading', text: '2. Practical activities during attachment' },
    { type: 'multi', key: 'practicalActivities', options: PRACTICAL_ACTIVITIES, otherTrigger: 'Others', otherKey: 'practicalActivitiesOther' },
    { type: 'heading', text: 'Section E: Industry-College Collaboration' },
    { type: 'subheading', text: 'How can your organisation support the programme?' },
    { type: 'multi', key: 'collaboration', options: COLLABORATION_OPTIONS, otherTrigger: 'Others', otherKey: 'collaborationOther' },
    { type: 'heading', text: 'Section F: Relevance of Mode of Delivery and Industry Engagement' },
    { type: 'weighting', key: 'weightingColumn', otherKey: 'weightingOther', withAssessment: true, assessmentKey: 'assessmentMode', assessmentOtherKey: 'assessmentOther' },
    respondentBlock
  ]
};

// ---------------------------------------------------------------------
// SOCIETY
// ---------------------------------------------------------------------
export const SOCIETY_DEF: QuestionnaireDef = {
  key: 'society',
  slug: 'society',
  label: "Society's Questionnaire",
  shortLabel: 'Society',
  docTitle: "SOCIETY'S QUESTIONNAIRE FOR REVIEW OF CURRICULUM FOR ORDINARY DIPLOMA PROGRAMME IN INFORMATION TECHNOLOGY",
  blocks: [...introBlocks, ...personalParticularsBlocks, ...skillsBlocks, respondentBlock]
};

// ---------------------------------------------------------------------
// EMPLOYER
// ---------------------------------------------------------------------
export const EMPLOYER_DEF: QuestionnaireDef = {
  key: 'employer',
  slug: 'employer',
  label: "Employers' Questionnaire",
  shortLabel: 'Employer',
  docTitle: "EMPLOYERS' QUESTIONNAIRE FOR REVIEW OF CURRICULUM FOR ORDINARY DIPLOMA PROGRAMME IN INFORMATION TECHNOLOGY",
  blocks: [
    ...introBlocks,
    { type: 'heading', text: 'Section A: Employer / Organisation Profile' },
    {
      type: 'fields',
      fields: [
        { key: 'orgName', label: '1. Name of the Organization' },
        { key: 'orgAddress', label: '2. Physical Address' },
        { key: 'orgPhone', label: '3. Phone Number', kind: 'tel' },
        { key: 'orgEmail', label: '4. Email Address', kind: 'email' },
        { key: 'orgRegion', label: '5. Region/Location of the Organization' }
      ]
    },
    { type: 'subheading', text: '6. Type of industry/sector' },
    { type: 'single', key: 'industryType', options: INDUSTRY_TYPES, otherTrigger: 'Other', otherKey: 'industryOther' },
    { type: 'subheading', text: '7. Number of ICT professionals currently employed' },
    { type: 'single', key: 'ictStaffCount', options: ICT_STAFF_COUNTS },
    { type: 'text', key: 'diplomaGraduatesCount', label: '8. Number of Diploma Graduates (or equivalent) employed' },
    { type: 'text', key: 'internshipsPerYear', label: '9. Number of Internships offered annually' },
    ...skillsBlocks,
    { type: 'heading', text: 'Section C: Industry Certifications for Diploma of Information Technology Graduates' },
    certificationsBlock,
    { type: 'heading', text: 'Section D: Labour Market Demand' },
    { type: 'subheading', text: '1. How many IT technicians do you anticipate recruiting in the next 3 years?' },
    { type: 'single', key: 'recruitCount', options: RECRUIT_COUNTS },
    { type: 'text', key: 'commonRoles', label: '2. Most common software/programming roles your organisation recruits for' },
    { type: 'text', key: 'recruitingChallenges', label: '3. Challenges faced when recruiting Information Technology diploma graduates' },
    { type: 'text', key: 'demandLanguages', label: '4. Programming languages or frameworks most in demand in your organisation' },
    { type: 'heading', text: 'Section E: Industrial Training (Field Attachment)' },
    { type: 'subheading', text: '1. Recommended duration of industrial attachment (field training)' },
    { type: 'single', key: 'attachmentDuration', options: ATTACHMENT_DURATIONS },
    { type: 'subheading', text: '2. Practical activities students should undertake during attachment' },
    { type: 'multi', key: 'practicalActivities', options: PRACTICAL_ACTIVITIES, otherTrigger: 'Others', otherKey: 'practicalActivitiesOther' },
    { type: 'heading', text: 'Section F: Industry-College Collaboration' },
    { type: 'subheading', text: 'How can your organisation support the programme?' },
    { type: 'multi', key: 'collaboration', options: COLLABORATION_OPTIONS, otherTrigger: 'Others', otherKey: 'collaborationOther' },
    { type: 'heading', text: 'Section G: Relevance of Mode of Delivery and Industry Engagement' },
    { type: 'weighting', key: 'weightingColumn', otherKey: 'weightingOther' },
    respondentBlock
  ]
};

// ---------------------------------------------------------------------
// PROFESSIONAL
// ---------------------------------------------------------------------
export const PROFESSIONAL_DEF: QuestionnaireDef = {
  key: 'professional',
  slug: 'professional',
  label: "Professionals' Questionnaire",
  shortLabel: 'Professional',
  docTitle: "PROFESSIONALS' QUESTIONNAIRE FOR REVIEW OF CURRICULUM FOR ORDINARY DIPLOMA PROGRAMME IN INFORMATION TECHNOLOGY",
  blocks: [
    ...introBlocks,
    ...personalParticularsBlocks,
    ...skillsBlocks,
    { type: 'heading', text: 'Section C: Industry Certifications for Diploma of Information Technology Graduates' },
    certificationsBlock,
    { type: 'heading', text: 'Section D: Relevance of Mode of Delivery and Industry Engagement' },
    { type: 'weighting', key: 'weightingColumn', otherKey: 'weightingOther' },
    { type: 'subheading', text: 'Institute-Alumni Linkage — Table 6: Areas of cooperation' },
    { type: 'boolean-list', key: 'alumniLinkage', title: 'Institute - Alumni (industry) Linkage', items: ALUMNI_LINKAGE_ITEMS },
    respondentBlock
  ]
};

export const REGISTRY: Record<string, QuestionnaireDef> = {
  graduate: GRADUATE_DEF,
  society: SOCIETY_DEF,
  employer: EMPLOYER_DEF,
  professional: PROFESSIONAL_DEF
};

export const ALL_TYPES = Object.values(REGISTRY);

export function getDef(slug: string): QuestionnaireDef | undefined {
  return REGISTRY[slug];
}
