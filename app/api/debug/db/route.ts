export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // простая проверка соединения и наличия таблицы Page
    await prisma.$queryRaw`SELECT 1`;
    // если модель Page есть в клиенте, попробуем лёгкий запрос
    const any = await prisma.page?.findFirst?.().catch(() => null);
    return NextResponse.json({ ok: true, pageTableReachable: Boolean(any !== undefined) });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'DB error' },
      { status: 500 },
    );
  }
}
