import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { payloadToRowData, rowToPayload } from '@/lib/serialize';
import { isAdminRequest } from '@/lib/requireAdmin';
import { QuestionnairePayload } from '@/lib/schema';

export async function POST(req: NextRequest) {
  let body: QuestionnairePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.activities || !body.softSkills || !body.professionalSkills || !body.specializations || !body.certifications) {
    return NextResponse.json({ error: 'Missing required questionnaire sections' }, { status: 400 });
  }

  try {
    const created = await prisma.response.create({ data: payloadToRowData(body) });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save response', detail: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.response.findMany({ orderBy: { createdAt: 'desc' } });
  const list = rows.map((r) => ({ id: r.id, createdAt: r.createdAt, ...rowToPayload(r) }));
  return NextResponse.json({ responses: list });
}
