import ExcelJS from 'exceljs';
import { QuestionnaireDef } from './questionnaires/blocks';
import { Payload } from './questionnaires/payload';

function safeSheetName(name: string): string {
  return name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Sheet';
}

export async function buildQuestionnaireExcel(def: QuestionnaireDef, rows: { id: string; createdAt: Date; payload: Payload }[]): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ATC Curriculum Review System';
  wb.created = new Date();

  const summary = wb.addWorksheet('Responses');
  const summaryCols: { header: string; key: string; width: number }[] = [
    { header: 'Response ID', key: 'id', width: 26 },
    { header: 'Submitted At', key: 'createdAt', width: 22 }
  ];

  for (const block of def.blocks) {
    if (block.type === 'fields') {
      for (const f of block.fields) summaryCols.push({ header: f.label, key: f.key, width: 22 });
    } else if (block.type === 'text' || block.type === 'single') {
      summaryCols.push({ header: block.type === 'single' ? block.key : (block as any).label, key: block.key, width: 22 });
    } else if (block.type === 'multi') {
      summaryCols.push({ header: block.key, key: block.key, width: 30 });
    } else if (block.type === 'weighting') {
      summaryCols.push({ header: 'Weighting Column', key: block.key, width: 16 });
      if (block.assessmentKey) summaryCols.push({ header: 'Assessment Mode', key: block.assessmentKey, width: 26 });
    } else if (block.type === 'respondent') {
      summaryCols.push(
        { header: 'Respondent Name', key: 'respondentName', width: 20 },
        { header: 'Respondent Position', key: 'respondentPosition', width: 20 },
        { header: 'Respondent Phone/Email', key: 'respondentPhone', width: 22 },
        { header: 'Date', key: 'respondentDate', width: 14 }
      );
    }
  }
  summary.columns = summaryCols;
  summary.getRow(1).font = { bold: true };

  for (const row of rows) {
    const record: Record<string, any> = { id: row.id, createdAt: row.createdAt.toISOString() };
    for (const col of summaryCols) {
      if (col.key === 'id' || col.key === 'createdAt') continue;
      const value = row.payload[col.key];
      record[col.key] = Array.isArray(value) ? value.join(', ') : value ?? '';
    }
    summary.addRow(record);
  }

  for (const block of def.blocks) {
    if (block.type === 'matrix') {
      const ws = wb.addWorksheet(safeSheetName(block.title));
      ws.columns = [{ header: 'Response ID', key: 'id', width: 26 }, ...block.items.map((item) => ({ header: item, key: item, width: 22 }))];
      ws.getRow(1).font = { bold: true };
      for (const row of rows) {
        const answers = row.payload[block.key] || {};
        const record: Record<string, any> = { id: row.id };
        block.items.forEach((item) => (record[item] = answers[item] || ''));
        ws.addRow(record);
      }
    } else if (block.type === 'boolean-list') {
      const ws = wb.addWorksheet(safeSheetName(block.title));
      ws.columns = [{ header: 'Response ID', key: 'id', width: 26 }, ...block.items.map((item) => ({ header: item, key: item, width: 22 }))];
      ws.getRow(1).font = { bold: true };
      for (const row of rows) {
        const selected: string[] = row.payload[block.key] || [];
        const record: Record<string, any> = { id: row.id };
        block.items.forEach((item) => (record[item] = selected.includes(item) ? 'Yes' : ''));
        ws.addRow(record);
      }
    }
  }

  return wb.xlsx.writeBuffer();
}
