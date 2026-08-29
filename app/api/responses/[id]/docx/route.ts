import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDef } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnaireDocx } from '@/lib/docBuilder';

// Intentionally NOT admin-gated: this is a "receipt" link for the person
// who just submitted, so they can keep a copy for their own records. It
// only works because the id is an unguessable cuid — there is no listing
// endpoint that exposes other people's ids.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row = await prisma.response.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const def = getDef(row.type);
  if (!def) return NextResponse.json({ error: 'Unknown questionnaire type on this response' }, { status: 500 });

  const buffer = await buildQuestionnaireDocx(def, rowToPayload(row), { id: row.id, createdAt: row.createdAt });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${def.slug}-questionnaire-${row.id}.docx"`
    }
  });
}
