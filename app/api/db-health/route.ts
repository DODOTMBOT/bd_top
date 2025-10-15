export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ db: 'ok' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}


