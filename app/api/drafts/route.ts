import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDef } from '@/lib/questionnaires/definitions';

// Save a (possibly partial) draft. No strict shape validation — drafts are
// incomplete by nature. Works on both local SQLite and hosted Postgres.
export async function POST(req: NextRequest) {
  let body: { type?: string; data?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const def = body.type ? getDef(body.type) : undefined;
  if (!def) {
    return NextResponse.json({ error: `Unknown questionnaire type: ${body.type}` }, { status: 400 });
  }

  try {
    const created = await prisma.draft.create({
      data: { type: def.key, data: JSON.stringify(body.data || {}) }
    });
    return NextResponse.json({ ok: true, id: created.id, type: def.key }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save draft', detail: String(err?.message || err) }, { status: 500 });
  }
}
