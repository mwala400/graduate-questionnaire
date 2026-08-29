import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { prisma } from '@/lib/db';
import { ALL_TYPES } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnaireDocx } from '@/lib/docBuilder';
import { buildQuestionnairePdf } from '@/lib/pdfBuilder';
import { buildQuestionnaireExcel } from '@/lib/excelBuilder';
import { isAdminRequest } from '@/lib/requireAdmin';

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const archive = archiver('zip', { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  let anyResponses = false;

  for (const def of ALL_TYPES) {
    const rows = await prisma.response.findMany({ where: { type: def.key }, orderBy: { createdAt: 'asc' } });
    if (rows.length === 0) continue;
    anyResponses = true;

    const payloadRows = rows.map((r) => ({ id: r.id, createdAt: r.createdAt, payload: rowToPayload(r) }));
    for (const row of payloadRows) {
      const docxBuffer = await buildQuestionnaireDocx(def, row.payload, { id: row.id, createdAt: row.createdAt });
      archive.append(docxBuffer, { name: `${def.slug}/docx/${def.slug}-${row.id}.docx` });
      const pdfBuffer = await buildQuestionnairePdf(def, row.payload, { id: row.id, createdAt: row.createdAt });
      archive.append(pdfBuffer, { name: `${def.slug}/pdf/${def.slug}-${row.id}.pdf` });
    }
    const excelBuffer = await buildQuestionnaireExcel(def, payloadRows);
    archive.append(excelBuffer as Buffer, { name: `${def.slug}/${def.slug}-responses.xlsx` });
  }

  if (!anyResponses) {
    return NextResponse.json({ error: 'No responses yet across any questionnaire type' }, { status: 404 });
  }

  archive.finalize();
  const zipBuffer = await streamToBuffer(passthrough);

  return new NextResponse(zipBuffer, {
    headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="all-questionnaires-full.zip"` }
  });
}
