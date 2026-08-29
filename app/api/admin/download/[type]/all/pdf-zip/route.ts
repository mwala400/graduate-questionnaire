import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { prisma } from '@/lib/db';
import { getDef } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnairePdf } from '@/lib/pdfBuilder';
import { isAdminRequest } from '@/lib/requireAdmin';

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function GET(_req: NextRequest, { params }: { params: { type: string } }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const def = getDef(params.type);
  if (!def) return NextResponse.json({ error: 'Unknown questionnaire type' }, { status: 404 });

  const rows = await prisma.response.findMany({ where: { type: def.key }, orderBy: { createdAt: 'asc' } });
  if (rows.length === 0) return NextResponse.json({ error: 'No responses yet' }, { status: 404 });

  const archive = archiver('zip', { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  for (const row of rows) {
    const buffer = await buildQuestionnairePdf(def, rowToPayload(row), { id: row.id, createdAt: row.createdAt });
    archive.append(buffer, { name: `${def.slug}-${row.id}.pdf` });
  }
  archive.finalize();

  const zipBuffer = await streamToBuffer(passthrough);
  return new NextResponse(zipBuffer, {
    headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${def.slug}-responses-pdf.zip"` }
  });
}
