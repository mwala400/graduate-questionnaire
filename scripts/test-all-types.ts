import fs from 'fs';
import { ALL_TYPES } from '../lib/questionnaires/definitions';
import { emptyPayload } from '../lib/questionnaires/payload';
import { buildQuestionnaireDocx } from '../lib/docBuilder';
import { buildQuestionnairePdf } from '../lib/pdfBuilder';

function fillSample(type: string, payload: any) {
  const p = { ...payload };
  if ('name' in p) p.name = 'Juma Mwakalinga';
  if ('address' in p) p.address = 'P.O. Box 1234, Arusha';
  if ('phone' in p) p.phone = '+255 712 345 678';
  if ('email' in p) p.email = 'juma@example.co.tz';
  if ('status' in p) p.status = 'Industry';
  if ('activities' in p) p.activities = ['Services', 'Research and Development'];
  if ('softSkills' in p) p.softSkills = { 'Behavioral skills': 'Highly Recommended', Teamwork: 'Highly Recommended', Creativity: 'Recommended' };
  if ('professionalSkills' in p)
    p.professionalSkills = { 'Ability to apply AI tools to solve real-world business problems': 'Highly Recommended' };
  if ('specializations' in p) p.specializations = { 'AI Engineering': 'Highly Recommended', Cybersecurity: 'Highly Recommended' };
  if ('certifications' in p) p.certifications = { 'CompTIA Linux+': 'Recommended' };
  if ('knowledgeGap' in p) p.knowledgeGap = 'More hands-on cloud deployment practice.';
  if ('attachmentDuration' in p) p.attachmentDuration = '16 weeks';
  if ('practicalActivities' in p) p.practicalActivities = ['Live software projects', 'Industry mentoring'];
  if ('collaboration' in p) p.collaboration = ['Industrial attachment hosting', 'Guest lectures / seminars'];
  if ('weightingColumn' in p) p.weightingColumn = 'C';
  if ('assessmentMode' in p) p.assessmentMode = '50_50';
  if ('orgName' in p) p.orgName = 'Acme Tech Ltd';
  if ('orgAddress' in p) p.orgAddress = 'Industrial Area, Arusha';
  if ('orgPhone' in p) p.orgPhone = '+255 700 111 222';
  if ('orgEmail' in p) p.orgEmail = 'hr@acmetech.co.tz';
  if ('orgRegion' in p) p.orgRegion = 'Arusha';
  if ('industryType' in p) p.industryType = 'ICT Company';
  if ('ictStaffCount' in p) p.ictStaffCount = '6 – 10';
  if ('diplomaGraduatesCount' in p) p.diplomaGraduatesCount = '4';
  if ('internshipsPerYear' in p) p.internshipsPerYear = '6';
  if ('recruitCount' in p) p.recruitCount = '3–5';
  if ('commonRoles' in p) p.commonRoles = 'Backend developers, network technicians';
  if ('recruitingChallenges' in p) p.recruitingChallenges = 'Limited hands-on cloud experience';
  if ('demandLanguages' in p) p.demandLanguages = 'Python, JavaScript, SQL';
  if ('alumniLinkage' in p) p.alumniLinkage = ['Industrial attachment', 'Offer Professional lecture'];
  if ('respondentName' in p) p.respondentName = 'Juma Mwakalinga';
  if ('respondentPosition' in p) p.respondentPosition = 'IT Manager';
  if ('respondentPhone' in p) p.respondentPhone = '+255 712 345 678';
  if ('respondentDate' in p) p.respondentDate = '2026-08-28';
  return p;
}

async function main() {
  for (const def of ALL_TYPES) {
    const payload = fillSample(def.key, emptyPayload(def));
    const meta = { id: `test-${def.key}-001`, createdAt: new Date() };

    const docxBuf = await buildQuestionnaireDocx(def, payload, meta);
    fs.writeFileSync(`/home/claude/work/test-${def.slug}.docx`, docxBuf);

    const pdfBuf = await buildQuestionnairePdf(def, payload, meta);
    fs.writeFileSync(`/home/claude/work/test-${def.slug}.pdf`, pdfBuf);

    console.log(`${def.key}: docx=${docxBuf.length}B pdf=${pdfBuf.length}B`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
