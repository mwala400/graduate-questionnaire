import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDef, ALL_TYPES } from '@/lib/questionnaires/definitions';
import { rowToPayload } from '@/lib/questionnaires/payload';
import { buildQuestionnaireAnalytics } from '@/lib/analyticsBuilder';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || ALL_TYPES[0].key;
  const def = getDef(type);
  if (!def) {
    return NextResponse.json({ error: `Unknown questionnaire type: ${type}` }, { status: 400 });
  }
  const rows = await prisma.response.findMany({ where: { type: def.key } });
  const payloads = rows.map(rowToPayload);
  return NextResponse.json({ type: def.key, label: def.label, ...buildQuestionnaireAnalytics(def, payloads) });
}
