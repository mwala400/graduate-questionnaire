import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const row = await prisma.draft.findUnique({ where: { id: params.id } });
  if (!row) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  let data: any = {};
  try {
    data = JSON.parse(row.data);
  } catch {
    data = {};
  }
  return NextResponse.json({ id: row.id, type: row.type, data });
}
