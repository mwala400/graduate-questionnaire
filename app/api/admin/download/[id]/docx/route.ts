import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rowToPayload } from '@/lib/serialize';
import { buildResponseDocx } from '@/lib/docxTemplate';
import { isAdminRequest } from '@/lib/requireAdmin';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const row = await prisma.response.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const buffer = await buildResponseDocx({ id: row.id, createdAt: row.createdAt, data: rowToPayload(row) });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="questionnaire-${row.id}.docx"`
    }
  });
}
