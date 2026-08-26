import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildExcelWorkbook } from '@/lib/excel';
import { isAdminRequest } from '@/lib/requireAdmin';

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await prisma.response.findMany({ orderBy: { createdAt: 'asc' } });
  const buffer = await buildExcelWorkbook(rows);

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="all-responses.xlsx"`
    }
  });
}
