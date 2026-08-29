import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { Block, QuestionnaireDef } from './questionnaires/blocks';
import { Payload } from './questionnaires/payload';
import { RATING_LEVELS, WEIGHTING_COLUMNS, WEIGHTING_ROWS, ASSESSMENT_MODES } from './questionnaires/shared-options';

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function loadLogo(fileName: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), 'public', 'logos', fileName));
}

interface Col {
  width: number;
  text?: string;
  checkbox?: boolean;
  align?: 'left' | 'center';
  bold?: boolean;
}

class PdfCanvas {
  doc!: PDFDocument;
  page!: PDFPage;
  font!: PDFFont;
  boldFont!: PDFFont;
  y = 0;

  static async create(): Promise<PdfCanvas> {
    const c = new PdfCanvas();
    c.doc = await PDFDocument.create();
    c.font = await c.doc.embedFont(StandardFonts.Helvetica);
    c.boldFont = await c.doc.embedFont(StandardFonts.HelveticaBold);
    c.addPage();
    return c;
  }

  addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  ensureSpace(h: number) {
    if (this.y - h < MARGIN) this.addPage();
  }

  wrapText(text: string, maxWidth: number, size: number, font: PDFFont): string[] {
    const words = String(text ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);
    if (words.length === 0) return [''];
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }

  drawParagraph(
    text: string,
    opts: { size?: number; bold?: boolean; align?: 'left' | 'center'; gray?: boolean; gapAfter?: number; maxWidth?: number } = {}
  ) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.boldFont : this.font;
    const maxWidth = opts.maxWidth ?? CONTENT_WIDTH;
    const lines = this.wrapText(text, maxWidth, size, font);
    const color = opts.gray ? rgb(0.5, 0.5, 0.5) : rgb(0, 0, 0);
    for (const line of lines) {
      this.ensureSpace(size + 4);
      let x = MARGIN;
      if (opts.align === 'center') {
        const w = font.widthOfTextAtSize(line, size);
        x = (PAGE_WIDTH - w) / 2;
      }
      this.page.drawText(line, { x, y: this.y - size, size, font, color });
      this.y -= size + 4;
    }
    this.y -= opts.gapAfter ?? 0;
  }

  drawGap(h: number) {
    this.y -= h;
  }

  drawLabelValue(label: string, value?: string) {
    const size = 10;
    this.ensureSpace(size + 6);
    const boldText = `${label}: `;
    const boldW = this.boldFont.widthOfTextAtSize(boldText, size);
    this.page.drawText(boldText, { x: MARGIN, y: this.y - size, size, font: this.boldFont });
    const val = value && String(value).trim() ? String(value) : '________________________________________';
    const lines = this.wrapText(val, CONTENT_WIDTH - boldW, size, this.font);
    this.page.drawText(lines[0] || '', { x: MARGIN + boldW, y: this.y - size, size, font: this.font });
    this.y -= size + 6;
    for (let i = 1; i < lines.length; i++) {
      this.ensureSpace(size + 6);
      this.page.drawText(lines[i], { x: MARGIN, y: this.y - size, size, font: this.font });
      this.y -= size + 6;
    }
  }

  /** Draws one bordered table row; row height auto-grows to fit wrapped text. Cursor moves down by the row height. */
  drawTableRow(cols: Col[], opts: { header?: boolean } = {}) {
    const size = 8.5;
    const padX = 4;
    const padY = 4;
    const font = opts.header ? this.boldFont : this.font;
    const colLines = cols.map((c) => (c.text !== undefined ? this.wrapText(c.text, c.width - padX * 2, size, c.bold ? this.boldFont : font) : ['']));
    const maxLines = Math.max(...colLines.map((l) => l.length), 1);
    const rowHeight = Math.max(18, maxLines * (size + 3) + padY * 2);
    this.ensureSpace(rowHeight);
    const startY = this.y;
    const totalWidth = cols.reduce((s, c) => s + c.width, 0);

    if (opts.header) {
      this.page.drawRectangle({ x: MARGIN, y: startY - rowHeight, width: totalWidth, height: rowHeight, color: rgb(0.86, 0.86, 0.86) });
    }

    let x = MARGIN;
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      this.page.drawRectangle({ x, y: startY - rowHeight, width: c.width, height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 0.5 });
      if (c.checkbox !== undefined) {
        const boxSize = 9;
        const bx = x + c.width / 2 - boxSize / 2;
        const by = startY - rowHeight / 2 - boxSize / 2;
        this.page.drawRectangle({ x: bx, y: by, width: boxSize, height: boxSize, borderColor: rgb(0, 0, 0), borderWidth: 0.75 });
        if (c.checkbox) {
          this.page.drawLine({ start: { x: bx, y: by }, end: { x: bx + boxSize, y: by + boxSize }, thickness: 0.9, color: rgb(0, 0, 0) });
          this.page.drawLine({ start: { x: bx, y: by + boxSize }, end: { x: bx + boxSize, y: by }, thickness: 0.9, color: rgb(0, 0, 0) });
        }
      } else if (c.text !== undefined) {
        const lines = colLines[i];
        let ty = startY - padY - size;
        const cellFont = c.bold || opts.header ? this.boldFont : this.font;
        for (const line of lines) {
          let tx = x + padX;
          if (c.align === 'center') {
            const w = cellFont.widthOfTextAtSize(line, size);
            tx = x + (c.width - w) / 2;
          }
          this.page.drawText(line, { x: tx, y: ty, size, font: cellFont });
          ty -= size + 3;
        }
      }
      x += c.width;
    }
    this.y = startY - rowHeight;
  }

  drawChecklist(options: string[], selected: string[], otherTrigger?: string, otherValue?: string) {
    const size = 9.5;
    const boxSize = 9;
    for (const opt of options) {
      this.ensureSpace(size + 5);
      const checked = selected.includes(opt);
      const by = this.y - size;
      this.page.drawRectangle({ x: MARGIN, y: by, width: boxSize, height: boxSize, borderColor: rgb(0, 0, 0), borderWidth: 0.75 });
      if (checked) {
        this.page.drawLine({ start: { x: MARGIN, y: by }, end: { x: MARGIN + boxSize, y: by + boxSize }, thickness: 0.9, color: rgb(0, 0, 0) });
        this.page.drawLine({ start: { x: MARGIN, y: by + boxSize }, end: { x: MARGIN + boxSize, y: by }, thickness: 0.9, color: rgb(0, 0, 0) });
      }
      let label = opt;
      if (otherTrigger && opt === otherTrigger && checked && otherValue) label += `  (Specify): ${otherValue}`;
      this.page.drawText(label, { x: MARGIN + boxSize + 6, y: this.y - size, size, font: this.font });
      this.y -= size + 5;
    }
    this.y -= 6;
  }
}

async function drawHeader(c: PdfCanvas, docTitle: string) {
  const emblemBytes = loadLogo('tanzania-emblem.png');
  const atcBytes = loadLogo('atc-logo.png');
  const emblem = await c.doc.embedPng(emblemBytes);
  const atc = await c.doc.embedPng(atcBytes);

  const logoH = 62;
  const emblemDims = emblem.scale(logoH / emblem.height);
  const atcDims = atc.scale(logoH / atc.height);
  const topY = c.y;

  c.page.drawImage(emblem, { x: MARGIN, y: topY - logoH, width: emblemDims.width, height: logoH });
  c.page.drawImage(atc, { x: PAGE_WIDTH - MARGIN - atcDims.width, y: topY - logoH, width: atcDims.width, height: logoH });

  const lines = ['THE UNITED REPUBLIC OF TANZANIA', 'MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY', 'ARUSHA TECHNICAL COLLEGE'];
  let ty = topY - 14;
  for (const line of lines) {
    const size = 10.5;
    const w = c.boldFont.widthOfTextAtSize(line, size);
    c.page.drawText(line, { x: (PAGE_WIDTH - w) / 2, y: ty, size, font: c.boldFont });
    ty -= size + 5;
  }
  c.y = topY - logoH - 12;

  c.drawParagraph(docTitle, { bold: true, align: 'center', size: 11.5, gapAfter: 4 });
  c.drawParagraph('(NTA LEVEL 4–6)', { bold: true, align: 'center', size: 10.5, gapAfter: 10 });
}

function drawRatingMatrix(c: PdfCanvas, title: string, items: string[], answers: Record<string, string>) {
  const snW = 26;
  const ratingW = 78;
  const labelW = CONTENT_WIDTH - snW - ratingW * 3;
  c.drawTableRow(
    [
      { width: snW, text: 'S/N', align: 'center' },
      { width: labelW, text: title },
      { width: ratingW, text: 'Highly Recommended', align: 'center' },
      { width: ratingW, text: 'Recommended', align: 'center' },
      { width: ratingW, text: 'Not Recommended', align: 'center' }
    ],
    { header: true }
  );
  items.forEach((item, idx) => {
    c.drawTableRow([
      { width: snW, text: String(idx + 1), align: 'center' },
      { width: labelW, text: item },
      ...RATING_LEVELS.map((lvl) => ({ width: ratingW, checkbox: answers?.[item] === lvl }))
    ]);
  });
}

function drawBooleanList(c: PdfCanvas, title: string, items: string[], selected: string[]) {
  const snW = 26;
  const tickW = 70;
  const labelW = CONTENT_WIDTH - snW - tickW;
  c.drawTableRow(
    [
      { width: snW, text: 'S/N', align: 'center' },
      { width: labelW, text: title },
      { width: tickW, text: 'Selected', align: 'center' }
    ],
    { header: true }
  );
  items.forEach((item, idx) => {
    c.drawTableRow([{ width: snW, text: String(idx + 1), align: 'center' }, { width: labelW, text: item }, { width: tickW, checkbox: selected.includes(item) }]);
  });
}

function drawWeightingTable(c: PdfCanvas, chosenColumn: string | undefined, otherValues: Record<string, number> | undefined) {
  const labelW = 120;
  const colW = (CONTENT_WIDTH - labelW) / 6;
  c.drawTableRow(
    [{ width: labelW, text: 'COMPONENT TYPE' }, ...(['A', 'B', 'C', 'D', 'E', 'OTHER'] as const).map((cName) => ({ width: colW, text: cName, align: 'center' as const }))],
    { header: true }
  );
  for (const row of WEIGHTING_ROWS) {
    c.drawTableRow([
      { width: labelW, text: row.label },
      ...(['A', 'B', 'C', 'D', 'E'] as const).map((cName) => ({ width: colW, text: `${WEIGHTING_COLUMNS[cName][row.key]}%`, align: 'center' as const, bold: chosenColumn === cName })),
      { width: colW, text: chosenColumn === 'OTHER' && otherValues?.[row.key] != null ? `${otherValues[row.key]}%` : '', align: 'center' as const, bold: chosenColumn === 'OTHER' }
    ]);
  }
}

async function renderBlock(c: PdfCanvas, block: Block, payload: Payload) {
  switch (block.type) {
    case 'heading':
      c.drawGap(6);
      c.drawParagraph(block.text.toUpperCase(), { bold: true, size: 12, gapAfter: 6 });
      return;
    case 'subheading':
      c.drawParagraph(block.text, { bold: true, size: 10.5, gapAfter: 4 });
      return;
    case 'paragraph':
      c.drawParagraph(block.text, { size: 9.5, gapAfter: 4 });
      return;
    case 'fields':
      for (const f of block.fields) c.drawLabelValue(f.label, payload[f.key]);
      c.drawGap(4);
      return;
    case 'text':
      c.drawParagraph(`${block.label}: ${payload[block.key] || '—'}`, { size: 9.5, gapAfter: 6 });
      return;
    case 'single':
      c.drawChecklist(block.options, payload[block.key] ? [payload[block.key]] : [], block.otherTrigger, block.otherKey ? payload[block.otherKey] : undefined);
      return;
    case 'multi':
      c.drawChecklist(block.options, payload[block.key] || [], block.otherTrigger, block.otherKey ? payload[block.otherKey] : undefined);
      return;
    case 'matrix':
      drawRatingMatrix(c, block.title, block.items, payload[block.key] || {});
      if (block.otherKey) {
        c.drawGap(4);
        c.drawParagraph(`${block.otherLabel || 'Other'}: ${payload[block.otherKey] || '—'}`, { size: 9.5, gapAfter: 8 });
      } else {
        c.drawGap(8);
      }
      return;
    case 'boolean-list':
      drawBooleanList(c, block.title, block.items, payload[block.key] || []);
      c.drawGap(8);
      return;
    case 'weighting': {
      c.drawParagraph('Table 5: Weighting of components (recommended column is bolded)', { bold: true, size: 10, gapAfter: 4 });
      drawWeightingTable(c, payload[block.key], payload[block.otherKey]);
      c.drawGap(8);
      if (block.withAssessment && block.assessmentKey) {
        c.drawParagraph('Mode of Assessment', { bold: true, size: 10.5, gapAfter: 4 });
        const mode = payload[block.assessmentKey];
        const other = block.assessmentOtherKey ? payload[block.assessmentOtherKey] : undefined;
        const text =
          mode && mode !== 'OTHER'
            ? `[X] ${ASSESSMENT_MODES[mode]}`
            : mode === 'OTHER'
            ? `[X] Other: ${other?.semester ?? '.....'}% Semester Examination and ${other?.continuous ?? '.....'}% Continuous Assessment`
            : 'Not answered';
        c.drawParagraph(text, { size: 9.5, gapAfter: 8 });
      }
      return;
    }
    case 'respondent':
      c.drawGap(6);
      c.drawParagraph('RESPONDENT DETAILS', { bold: true, size: 12, gapAfter: 6 });
      c.drawLabelValue('Name (optional)', payload.respondentName);
      c.drawLabelValue('Position', payload.respondentPosition);
      c.drawLabelValue('Phone/Email', payload.respondentPhone);
      c.drawLabelValue('Date', payload.respondentDate);
      return;
  }
}

export async function buildQuestionnairePdf(def: QuestionnaireDef, payload: Payload, meta: { id: string; createdAt: Date }): Promise<Buffer> {
  const c = await PdfCanvas.create();
  await drawHeader(c, def.docTitle);
  for (const block of def.blocks) await renderBlock(c, block, payload);

  c.drawGap(8);
  c.drawParagraph('Thank you for your valuable input.', { bold: true, align: 'center', size: 10, gapAfter: 6 });
  c.drawParagraph(`Response ID: ${meta.id}  |  Submitted: ${meta.createdAt.toISOString()}`, { align: 'center', size: 7.5, gray: true });

  const bytes = await c.doc.save();
  return Buffer.from(bytes);
}
