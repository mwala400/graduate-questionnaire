import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDef } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnairePdf } from '@/lib/pdfBuilder';

// Same "receipt" pattern as the .docx route — public but only reachable by
// the unguessable id the respondent was given right after submitting.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row = await prisma.response.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const def = getDef(row.type);
  if (!def) return NextResponse.json({ error: 'Unknown questionnaire type on this response' }, { status: 500 });

  const buffer = await buildQuestionnairePdf(def, rowToPayload(row), { id: row.id, createdAt: row.createdAt });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${def.slug}-questionnaire-${row.id}.pdf"`
    }
  });
}
