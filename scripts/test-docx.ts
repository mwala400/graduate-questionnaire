import fs from 'fs';
import { buildResponseDocx } from '../lib/docxTemplate';
import { QuestionnairePayload } from '../lib/schema';

async function main() {
  const sample: QuestionnairePayload = {
    name: 'Juma Mwakalinga',
    address: 'P.O. Box 1234, Arusha',
    phone: '+255 712 345 678',
    email: 'juma@example.co.tz',
    status: 'Industry',
    activities: ['Services', 'Research and Development'],
    softSkills: {
      'Behavioral skills': 'Highly Recommended',
      'Teamwork': 'Highly Recommended',
      'Creativity': 'Recommended',
      'Leadership skills': 'Not Recommended'
    },
    softSkillsOther: 'Time management',
    professionalSkills: {
      'Ability to apply AI tools to solve real-world business problems': 'Highly Recommended',
      'Ability to secure computer systems and applications.': 'Highly Recommended'
    },
    specializations: {
      'AI Engineering': 'Highly Recommended',
      'Cybersecurity': 'Highly Recommended',
      'Web Development': 'Recommended'
    },
    knowledgeGap: 'More hands-on cloud deployment practice.',
    certifications: {
      'AWS Certified Developer / Cloud Practitioner': 'Highly Recommended',
      'CompTIA Linux+': 'Recommended'
    },
    attachmentDuration: '16 weeks',
    practicalActivities: ['Live software projects', 'Industry mentoring'],
    collaboration: ['Industrial attachment hosting', 'Guest lectures / seminars'],
    weightingColumn: 'C',
    assessmentMode: '50_50',
    respondentName: 'Juma Mwakalinga',
    respondentPosition: 'IT Manager',
    respondentPhone: '+255 712 345 678',
    respondentDate: '2026-08-26'
  };

  const buffer = await buildResponseDocx({ id: 'test-resp-001', createdAt: new Date(), data: sample });
  fs.writeFileSync('/home/claude/work/test-output.docx', buffer);
  console.log('Wrote test-output.docx, size:', buffer.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
