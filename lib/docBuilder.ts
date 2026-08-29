import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType
} from 'docx';
import fs from 'fs';
import path from 'path';
import { Block, QuestionnaireDef } from './questionnaires/blocks';
import { Payload } from './questionnaires/payload';
import { RATING_LEVELS, WEIGHTING_COLUMNS, WEIGHTING_ROWS, ASSESSMENT_MODES } from './questionnaires/shared-options';

const CHECKED = '☒';
const UNCHECKED = '☐';
const tick = (checked: boolean) => (checked ? CHECKED : UNCHECKED);
const CELL_MARGIN = { top: 60, bottom: 60, left: 100, right: 100 };

function loadLogo(fileName: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), 'public', 'logos', fileName));
}

function sectionHeading(text: string) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true })] });
}
function subHeading(text: string) {
  return new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true })] });
}
function plainParagraph(text: string) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text })] });
}
function labeledLine(label: string, value?: string | null) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value && String(value).trim() ? String(value) : '__________________________________________' })
    ]
  });
}
function headerCell(text: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: 'D9D9D9' },
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true })] })]
  });
}
function tickCell(width: number, checked: boolean) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tick(checked) })] })]
  });
}
function textCell(text: string, width: number, opts: { bold?: boolean } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    children: [new Paragraph({ children: [new TextRun({ text, bold: !!opts.bold })] })]
  });
}

function checklistParagraph(options: string[], selected: string[], otherTrigger?: string, otherValue?: string) {
  const runs: TextRun[] = [];
  options.forEach((opt, i) => {
    const checked = selected.includes(opt);
    runs.push(new TextRun({ text: `${tick(checked)} ${opt}`, break: i === 0 ? 0 : 1 }));
    if (otherTrigger && opt === otherTrigger && checked && otherValue) {
      runs.push(new TextRun({ text: `  (Specify): ${otherValue}` }));
    }
  });
  return new Paragraph({ spacing: { after: 200 }, children: runs });
}

function ratingMatrixTable(title: string, items: string[], answers: Record<string, string>, snWidth = 500, labelWidth = 5500) {
  const ratingWidth = (9000 - snWidth - labelWidth) / 3;
  const headerRow = new TableRow({
    tableHeader: true,
    children: [headerCell('S/N', snWidth), headerCell(title, labelWidth), ...RATING_LEVELS.map((lvl) => headerCell(lvl, ratingWidth))]
  });
  const rows = items.map(
    (item, idx) =>
      new TableRow({
        children: [
          textCell(String(idx + 1), snWidth),
          textCell(item, labelWidth),
          ...RATING_LEVELS.map((lvl) => tickCell(ratingWidth, answers?.[item] === lvl))
        ]
      })
  );
  return new Table({ width: { size: 9000, type: WidthType.DXA }, rows: [headerRow, ...rows] });
}

function booleanListTable(title: string, items: string[], selected: string[]) {
  const snWidth = 600;
  const labelWidth = 6900;
  const tickWidth = 1500;
  const headerRow = new TableRow({
    tableHeader: true,
    children: [headerCell('S/N', snWidth), headerCell(title, labelWidth), headerCell('Selected', tickWidth)]
  });
  const rows = items.map(
    (item, idx) =>
      new TableRow({ children: [textCell(String(idx + 1), snWidth), textCell(item, labelWidth), tickCell(tickWidth, selected.includes(item))] })
  );
  return new Table({ width: { size: 9000, type: WidthType.DXA }, rows: [headerRow, ...rows] });
}

function weightingTable(chosenColumn: string | undefined, otherValues: Record<string, number> | undefined) {
  const colWidth = (9000 - 2400) / 6;
  const headerRow = new TableRow({
    tableHeader: true,
    children: [headerCell('COMPONENT TYPE', 2400), ...(['A', 'B', 'C', 'D', 'E', 'OTHER'] as const).map((c) => headerCell(c, colWidth))]
  });
  const rows = WEIGHTING_ROWS.map(
    (r) =>
      new TableRow({
        children: [
          textCell(r.label, 2400),
          ...(['A', 'B', 'C', 'D', 'E'] as const).map((c) => textCell(`${WEIGHTING_COLUMNS[c][r.key]}%`, colWidth, { bold: chosenColumn === c })),
          textCell(chosenColumn === 'OTHER' && otherValues?.[r.key] != null ? `${otherValues[r.key]}%` : '', colWidth, { bold: chosenColumn === 'OTHER' })
        ]
      })
  );
  return new Table({ width: { size: 9000, type: WidthType.DXA }, rows: [headerRow, ...rows] });
}

function headerBlock(docTitle: string) {
  const headerTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new ImageRun({ data: loadLogo('tanzania-emblem.png'), transformation: { width: 90, height: 95 }, type: 'png' })]
              })
            ]
          }),
          new TableCell({
            width: { size: 5400, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'THE UNITED REPUBLIC OF TANZANIA', bold: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY', bold: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ARUSHA TECHNICAL COLLEGE', bold: true })] })
            ]
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new ImageRun({ data: loadLogo('atc-logo.png'), transformation: { width: 85, height: 95 }, type: 'png' })]
              })
            ]
          })
        ]
      })
    ]
  });

  return [
    headerTable,
    new Paragraph({ text: '' }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: docTitle, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: '(NTA LEVEL 4–6)', bold: true })] })
  ];
}

function renderBlock(block: Block, payload: Payload): (Paragraph | Table)[] {
  switch (block.type) {
    case 'heading':
      return [sectionHeading(block.text)];
    case 'subheading':
      return [subHeading(block.text)];
    case 'paragraph':
      return [plainParagraph(block.text)];
    case 'fields':
      return block.fields.map((f) => labeledLine(f.label, payload[f.key]));
    case 'text':
      return [plainParagraph(`${block.label}: ${payload[block.key] || '—'}`)];
    case 'single':
      return [checklistParagraph(block.options, payload[block.key] ? [payload[block.key]] : [], block.otherTrigger, block.otherKey ? payload[block.otherKey] : undefined)];
    case 'multi':
      return [checklistParagraph(block.options, payload[block.key] || [], block.otherTrigger, block.otherKey ? payload[block.otherKey] : undefined)];
    case 'matrix': {
      const els: (Paragraph | Table)[] = [ratingMatrixTable(block.title, block.items, payload[block.key] || {})];
      if (block.otherKey) {
        els.push(new Paragraph({ spacing: { before: 150, after: 200 }, children: [new TextRun({ text: `${block.otherLabel || 'Other'}: ${payload[block.otherKey] || '—'}` })] }));
      }
      return els;
    }
    case 'boolean-list':
      return [booleanListTable(block.title, block.items, payload[block.key] || [])];
    case 'weighting': {
      const els: (Paragraph | Table)[] = [subHeading('Table 5: Weighting of components (recommended column is bolded)'), weightingTable(payload[block.key], payload[block.otherKey])];
      if (block.withAssessment && block.assessmentKey) {
        const mode = payload[block.assessmentKey];
        const other = block.assessmentOtherKey ? payload[block.assessmentOtherKey] : undefined;
        els.push(subHeading('Mode of Assessment'));
        els.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text:
                  mode && mode !== 'OTHER'
                    ? `${tick(true)} ${ASSESSMENT_MODES[mode]}`
                    : mode === 'OTHER'
                    ? `${tick(true)} Other: ${other?.semester ?? '.....'}% Semester Examination and ${other?.continuous ?? '.....'}% Continuous Assessment`
                    : 'Not answered'
              })
            ]
          })
        );
      }
      return els;
    }
    case 'respondent':
      return [
        sectionHeading('Respondent Details'),
        labeledLine('Name (optional)', payload.respondentName),
        labeledLine('Position', payload.respondentPosition),
        labeledLine('Phone/Email', payload.respondentPhone),
        labeledLine('Date', payload.respondentDate)
      ];
    default:
      return [];
  }
}

export async function buildQuestionnaireDocx(def: QuestionnaireDef, payload: Payload, meta: { id: string; createdAt: Date }): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [...headerBlock(def.docTitle)];
  for (const block of def.blocks) children.push(...renderBlock(block, payload));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Thank you for your valuable input.', bold: true, italics: true })] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: `Response ID: ${meta.id}  |  Submitted: ${meta.createdAt.toISOString()}`, italics: true, size: 16, color: '888888' })]
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1100, right: 1100 } } },
        children
      }
    ]
  });

  return Packer.toBuffer(doc);
}
