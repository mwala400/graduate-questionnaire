import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rowToPayload } from '@/lib/serialize';
import { buildResponseDocx } from '@/lib/docxTemplate';
import { docxBufferToPdf } from '@/lib/pdf';
import { isAdminRequest } from '@/lib/requireAdmin';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const row = await prisma.response.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const docxBuffer = await buildResponseDocx({ id: row.id, createdAt: row.createdAt, data: rowToPayload(row) });
    const pdfBuffer = await docxBufferToPdf(docxBuffer);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="questionnaire-${row.id}.pdf"`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'PDF conversion failed. Is LibreOffice installed and on PATH? See README.md.', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
