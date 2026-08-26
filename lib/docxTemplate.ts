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
import {
  ACTIVITY_OPTIONS,
  ASSESSMENT_MODES,
  ATTACHMENT_DURATIONS,
  CERTIFICATIONS,
  COLLABORATION_OPTIONS,
  MatrixAnswer,
  PRACTICAL_ACTIVITIES,
  PROFESSIONAL_SKILLS,
  QuestionnairePayload,
  RATING_LEVELS,
  SOFT_SKILLS,
  SPECIALIZATIONS,
  STATUS_OPTIONS,
  WEIGHTING_COLUMNS
} from './schema';

const CHECKED = '☒';
const UNCHECKED = '☐';

function tick(isChecked: boolean) {
  return isChecked ? CHECKED : UNCHECKED;
}

function loadLogo(fileName: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), 'public', 'logos', fileName));
}

function labeledLine(label: string, value?: string | null) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value && value.trim() ? value : '__________________________________________' })
    ]
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true })]
  });
}

function subHeading(text: string) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true })]
  });
}

function checklistParagraph(options: string[], selected: string[], otherLabel = 'Other', otherValue?: string | null) {
  const runs: TextRun[] = [];
  options.forEach((opt, i) => {
    const isOther = opt.toLowerCase().startsWith(otherLabel.toLowerCase());
    const checked = selected.includes(opt);
    runs.push(new TextRun({ text: `${tick(checked)} ${opt}`, break: i === 0 ? 0 : 1 }));
    if (isOther && checked && otherValue) {
      runs.push(new TextRun({ text: `  (Specify): ${otherValue}` }));
    }
  });
  return new Paragraph({ spacing: { after: 200 }, children: runs });
}

const CELL_MARGIN = { top: 60, bottom: 60, left: 100, right: 100 };

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

/** Builds a 3-column rating matrix table (Highly Recommended / Recommended / Not Recommended). */
function buildRatingMatrix(title: string, items: string[], answers: MatrixAnswer, snWidth = 500, labelWidth = 5500) {
  const ratingWidth = (9000 - snWidth - labelWidth) / 3;
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('S/N', snWidth),
      headerCell(title, labelWidth),
      ...RATING_LEVELS.map((lvl) => headerCell(lvl, ratingWidth))
    ]
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

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [headerRow, ...rows]
  });
}

export async function buildResponseDocx(response: {
  id: string;
  createdAt: Date;
  data: QuestionnairePayload;
}): Promise<Buffer> {
  const d = response.data;

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
                children: [
                  new ImageRun({
                    data: loadLogo('tanzania-emblem.png'),
                    transformation: { width: 90, height: 95 },
                    type: 'png'
                  })
                ]
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
                children: [
                  new ImageRun({
                    data: loadLogo('atc-logo.png'),
                    transformation: { width: 85, height: 95 },
                    type: 'png'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  const weightingSelection =
    d.weightingColumn && d.weightingColumn !== 'OTHER'
      ? WEIGHTING_COLUMNS[d.weightingColumn]
      : d.weightingOther;

  const weightingCols = ['A', 'B', 'C', 'D', 'E', 'OTHER'];
  const weightingHeaderRow = new TableRow({
    tableHeader: true,
    children: [headerCell('COMPONENT TYPE', 2400), ...weightingCols.map((c) => headerCell(c === 'OTHER' ? 'OTHER' : c, (9000 - 2400) / 6))]
  });
  const weightingRowsDef: { label: string; key: keyof typeof WEIGHTING_COLUMNS['A'] }[] = [
    { label: 'Lecture', key: 'lecture' },
    { label: 'Tutorial', key: 'tutorial' },
    { label: 'Practical work', key: 'practical' },
    { label: 'Industrial visit/Field works', key: 'visit' },
    { label: 'Professional lectures', key: 'professional' }
  ];
  const colWidth = (9000 - 2400) / 6;
  const weightingRows = weightingRowsDef.map(
    (r) =>
      new TableRow({
        children: [
          textCell(r.label, 2400),
          ...(['A', 'B', 'C', 'D', 'E'] as const).map((c) =>
            textCell(`${WEIGHTING_COLUMNS[c][r.key]}%`, colWidth, { bold: d.weightingColumn === c })
          ),
          textCell(d.weightingColumn === 'OTHER' && d.weightingOther?.[r.key] != null ? `${d.weightingOther[r.key]}%` : '', colWidth, {
            bold: d.weightingColumn === 'OTHER'
          })
        ]
      })
  );
  const weightingTable = new Table({ width: { size: 9000, type: WidthType.DXA }, rows: [weightingHeaderRow, ...weightingRows] });

  const doc = new Document({
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1100, right: 1100 } } },
        children: [
          headerTable,
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "GRADUATES' QUESTIONNAIRE FOR REVIEW OF CURRICULUM FOR ORDINARY DIPLOMA PROGRAMME IN INFORMATION TECHNOLOGY",
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: '(NTA LEVEL 4–6)', bold: true })]
          }),
          subHeading('Introduction'),
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: 'Dear Respondent,' })] }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text:
                  'This questionnaire is part of the curriculum review for the Ordinary Diploma in Information Technology programmes at Arusha Technical College, conducted in line with NACTVET requirements. The review aims to ensure the curricula remain relevant to labour market demands, technological advancement, industry requirements, national development priorities, global ICT standards, and professional expectations. Your responses will help assess the relevance of the programme titles, current curriculum content, and the competencies required by employers. All information provided will be treated with strict confidentiality and used solely for curriculum review and improvement purposes.'
              })
            ]
          }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Thank you for your valuable contribution.' })] }),

          sectionHeading('SECTION A: CHARACTERISTICS OF A RESPONDENT'),
          subHeading('A1: Personal Particulars'),
          labeledLine('Name (Optional)', d.name),
          labeledLine('Address', d.address),
          labeledLine('Phone number', d.phone),
          labeledLine('E-mail', d.email),

          subHeading('A2: Status'),
          checklistParagraph(STATUS_OPTIONS, d.status ? [d.status] : [], 'Other', d.statusOther),

          subHeading('A3: Main Activities'),
          checklistParagraph(ACTIVITY_OPTIONS, d.activities || [], 'Other', d.activitiesOther),

          sectionHeading('SECTION B: RECOMMENDATIONS ON COMPETENCIES'),
          subHeading('B1: Recommended Soft Skills by Employers'),
          buildRatingMatrix('RECOMMENDED SOFT SKILLS', SOFT_SKILLS, d.softSkills),
          new Paragraph({ spacing: { before: 150, after: 200 }, children: [new TextRun({ text: 'Other soft skills recommended: ' + (d.softSkillsOther || '—') })] }),

          subHeading('B2: Recommended Professional Skills by Employers'),
          buildRatingMatrix('RECOMMENDED PROFESSIONAL SKILLS', PROFESSIONAL_SKILLS, d.professionalSkills, 500, 6300),
          new Paragraph({ spacing: { before: 150, after: 200 }, children: [new TextRun({ text: 'Other professional skills recommended: ' + (d.professionalSkillsOther || '—') })] }),

          subHeading('B3: Important Areas of Specialization for Consideration in Curriculum Review'),
          buildRatingMatrix('AREA OF SPECIALIZATION', SPECIALIZATIONS, d.specializations, 500, 5500),
          new Paragraph({ spacing: { before: 150, after: 100 }, children: [new TextRun({ text: 'Other specialization not listed above: ' + (d.specializationsOther || '—') })] }),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text:
                  'Competence or knowledge wished to have been taught before joining the industry/work/business: ' +
                  (d.knowledgeGap || '—')
              })
            ]
          }),

          sectionHeading('SECTION C: INDUSTRY CERTIFICATIONS FOR DIPLOMA OF INFORMATION TECHNOLOGY GRADUATES'),
          buildRatingMatrix('RECOMMENDED CERTIFICATIONS', CERTIFICATIONS, d.certifications, 500, 5500),

          sectionHeading('SECTION D: INDUSTRIAL TRAINING (FIELD ATTACHMENT)'),
          subHeading('1. Recommended duration of industrial attachment'),
          checklistParagraph(ATTACHMENT_DURATIONS, d.attachmentDuration ? [d.attachmentDuration] : []),
          subHeading('2. Practical activities during attachment'),
          checklistParagraph(PRACTICAL_ACTIVITIES, d.practicalActivities || [], 'Others', d.practicalActivitiesOther),

          sectionHeading('SECTION E: INDUSTRY-COLLEGE COLLABORATION'),
          subHeading('1. How the organisation can support the programme'),
          checklistParagraph(COLLABORATION_OPTIONS, d.collaboration || [], 'Others', d.collaborationOther),

          sectionHeading('SECTION F: RELEVANCE OF MODE OF DELIVERY AND INDUSTRY ENGAGEMENT'),
          subHeading('Table 5: Weighting of components (recommended column is bolded)'),
          weightingTable,
          new Paragraph({ text: '' }),
          subHeading('Mode of Assessment'),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text:
                  d.assessmentMode && d.assessmentMode !== 'OTHER'
                    ? `${tick(true)} ${ASSESSMENT_MODES[d.assessmentMode]}`
                    : d.assessmentMode === 'OTHER'
                    ? `${tick(true)} Other: ${d.assessmentOther?.semester ?? '.....'}% Semester Examination and ${
                        d.assessmentOther?.continuous ?? '.....'
                      }% Continuous Assessment`
                    : 'Not answered'
              })
            ]
          }),

          sectionHeading('RESPONDENT DETAILS'),
          labeledLine('Name (optional)', d.respondentName),
          labeledLine('Position', d.respondentPosition),
          labeledLine('Phone/Email', d.respondentPhone),
          labeledLine('Date', d.respondentDate),

          new Paragraph({ text: '' }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Thank you for your valuable input.', bold: true, italics: true })] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300 },
            children: [
              new TextRun({
                text: `Response ID: ${response.id}  |  Submitted: ${response.createdAt.toISOString()}`,
                italics: true,
                size: 16,
                color: '888888'
              })
            ]
          })
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}
