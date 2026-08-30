import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest } from '@/lib/requireAdmin';
import { isValidAdminCode } from '@/lib/auth';
import { getDef } from '@/lib/questionnaires/definitions';
import { isPayloadShapeValid, payloadToRowData, rowToPayload } from '@/lib/questionnaires/payload';

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
  if (!isPayloadShapeValid(def, body.data)) {
    return NextResponse.json({ error: "Submitted data does not match this questionnaire's structure" }, { status: 400 });
  }

  try {
    const created = await prisma.response.create({ data: payloadToRowData(def.key, body.data) });
    return NextResponse.json({ ok: true, id: created.id, type: def.key }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save response', detail: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get('type') || undefined;
  const rows = await prisma.response.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' }
  });
  const list = rows.map((r) => ({ id: r.id, type: r.type, createdAt: r.createdAt, data: rowToPayload(r) }));
  return NextResponse.json({ responses: list });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const all = req.nextUrl.searchParams.get('all') === 'true';
  const type = req.nextUrl.searchParams.get('type') || undefined;

  if (all) {
    // Irreversible mass deletion: require the admin access code as a second factor.
    const { code } = await req.json().catch(() => ({ code: '' }));
    if (typeof code !== 'string' || !isValidAdminCode(code)) {
      return NextResponse.json({ error: 'Admin access code required to delete all responses' }, { status: 403 });
    }
    await prisma.response.deleteMany({});
    return NextResponse.json({ ok: true, deleted: 'all' });
  }

  if (type) {
    await prisma.response.deleteMany({ where: { type } });
    return NextResponse.json({ ok: true, deleted: type });
  }

  return NextResponse.json({ error: 'Specify ?type=<type> or ?all=true' }, { status: 400 });
}
