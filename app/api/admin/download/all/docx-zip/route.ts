import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { prisma } from '@/lib/db';
import { rowToPayload } from '@/lib/serialize';
import { buildResponseDocx } from '@/lib/docxTemplate';
import { isAdminRequest } from '@/lib/requireAdmin';

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await prisma.response.findMany({ orderBy: { createdAt: 'asc' } });
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No responses yet' }, { status: 404 });
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  for (const row of rows) {
    const buffer = await buildResponseDocx({ id: row.id, createdAt: row.createdAt, data: rowToPayload(row) });
    archive.append(buffer, { name: `questionnaire-${row.id}.docx` });
  }
  archive.finalize();

  const zipBuffer = await streamToBuffer(passthrough);

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="all-responses-docx.zip"`
    }
  });
}
