import ExcelJS from 'exceljs';
import { rowToPayload } from './serialize';
import {
  ACTIVITY_OPTIONS,
  CERTIFICATIONS,
  PROFESSIONAL_SKILLS,
  SOFT_SKILLS,
  SPECIALIZATIONS
} from './schema';

export async function buildExcelWorkbook(rows: any[]): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ATC IT Graduate Questionnaire System';
  wb.created = new Date();

  const summary = wb.addWorksheet('Responses');
  summary.columns = [
    { header: 'Response ID', key: 'id', width: 26 },
    { header: 'Submitted At', key: 'createdAt', width: 22 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Address', key: 'address', width: 24 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 22 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Main Activities', key: 'activities', width: 30 },
    { header: 'Attachment Duration', key: 'attachmentDuration', width: 18 },
    { header: 'Weighting Column', key: 'weightingColumn', width: 16 },
    { header: 'Assessment Mode', key: 'assessmentMode', width: 26 },
    { header: 'Respondent Name', key: 'respondentName', width: 20 },
    { header: 'Respondent Position', key: 'respondentPosition', width: 20 },
    { header: 'Respondent Phone/Email', key: 'respondentPhone', width: 22 },
    { header: 'Date', key: 'respondentDate', width: 14 }
  ];
  summary.getRow(1).font = { bold: true };

  for (const row of rows) {
    const p = rowToPayload(row);
    summary.addRow({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      name: p.name || '',
      address: p.address || '',
      phone: p.phone || '',
      email: p.email || '',
      status: p.status || '',
      activities: (p.activities || []).join(', '),
      attachmentDuration: p.attachmentDuration || '',
      weightingColumn: p.weightingColumn || '',
      assessmentMode: p.assessmentMode || '',
      respondentName: p.respondentName || '',
      respondentPosition: p.respondentPosition || '',
      respondentPhone: p.respondentPhone || '',
      respondentDate: p.respondentDate || ''
    });
  }

  // One matrix-detail sheet per rating section, one row per response.
  const matrixSheets: { title: string; items: string[]; field: 'softSkills' | 'professionalSkills' | 'specializations' | 'certifications' }[] = [
    { title: 'Soft Skills', items: SOFT_SKILLS, field: 'softSkills' },
    { title: 'Professional Skills', items: PROFESSIONAL_SKILLS, field: 'professionalSkills' },
    { title: 'Specializations', items: SPECIALIZATIONS, field: 'specializations' },
    { title: 'Certifications', items: CERTIFICATIONS, field: 'certifications' }
  ];

  for (const sheetDef of matrixSheets) {
    const ws = wb.addWorksheet(sheetDef.title);
    ws.columns = [{ header: 'Response ID', key: 'id', width: 26 }, ...sheetDef.items.map((item) => ({ header: item, key: item, width: 22 }))];
    ws.getRow(1).font = { bold: true };
    for (const row of rows) {
      const p = rowToPayload(row);
      const answers = (p as any)[sheetDef.field] || {};
      const record: any = { id: row.id };
      sheetDef.items.forEach((item) => (record[item] = answers[item] || ''));
      ws.addRow(record);
    }
  }

  const activitiesSheet = wb.addWorksheet('Main Activities (tally)');
  activitiesSheet.columns = [
    { header: 'Activity', key: 'activity', width: 30 },
    { header: 'Count', key: 'count', width: 10 }
  ];
  activitiesSheet.getRow(1).font = { bold: true };
  for (const activity of ACTIVITY_OPTIONS) {
    const count = rows.filter((r) => (rowToPayload(r).activities || []).includes(activity)).length;
    activitiesSheet.addRow({ activity, count });
  }

  return wb.xlsx.writeBuffer();
}
