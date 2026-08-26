import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildAnalytics } from '@/lib/analytics';

export async function GET() {
  const rows = await prisma.response.findMany();
  return NextResponse.json(buildAnalytics(rows));
}
