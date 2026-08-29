import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDef } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnaireExcel } from '@/lib/excelBuilder';
import { isAdminRequest } from '@/lib/requireAdmin';

export async function GET(_req: NextRequest, { params }: { params: { type: string } }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const def = getDef(params.type);
  if (!def) return NextResponse.json({ error: 'Unknown questionnaire type' }, { status: 404 });

  const rows = await prisma.response.findMany({ where: { type: def.key }, orderBy: { createdAt: 'asc' } });
  const buffer = await buildQuestionnaireExcel(def, rows.map((r) => ({ id: r.id, createdAt: r.createdAt, payload: rowToPayload(r) })));

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${def.slug}-responses.xlsx"`
    }
  });
}
