import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { prisma } from '@/lib/db';
import { rowToPayload } from '@/lib/serialize';
import { buildResponseDocx } from '@/lib/docxTemplate';
import { docxBufferToPdf } from '@/lib/pdf';
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

  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const passthrough = new PassThrough();
    archive.pipe(passthrough);

    for (const row of rows) {
      const docxBuffer = await buildResponseDocx({ id: row.id, createdAt: row.createdAt, data: rowToPayload(row) });
      const pdfBuffer = await docxBufferToPdf(docxBuffer);
      archive.append(pdfBuffer, { name: `questionnaire-${row.id}.pdf` });
    }
    archive.finalize();

    const zipBuffer = await streamToBuffer(passthrough);

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="all-responses-pdf.zip"`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'PDF conversion failed. Is LibreOffice installed and on PATH? See README.md.', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
