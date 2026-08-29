import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDef } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnaireDocx } from '@/lib/docBuilder';
import { isAdminRequest } from '@/lib/requireAdmin';

export async function GET(_req: NextRequest, { params }: { params: { type: string; id: string } }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const def = getDef(params.type);
  if (!def) return NextResponse.json({ error: 'Unknown questionnaire type' }, { status: 404 });

  const row = await prisma.response.findUnique({ where: { id: params.id } });
  if (!row || row.type !== def.key) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const buffer = await buildQuestionnaireDocx(def, rowToPayload(row), { id: row.id, createdAt: row.createdAt });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${def.slug}-${row.id}.docx"`
    }
  });
}
