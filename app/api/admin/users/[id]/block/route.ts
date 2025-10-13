export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Json =
  | { ok: true; isBlocked: boolean }
  | { ok: false; code: string; detail?: string }

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, isBlocked: true },
    })
    if (!user) {
      return NextResponse.json<Json>({ ok: false, code: 'NOT_FOUND' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isBlocked: !user.isBlocked },
      select: { isBlocked: true },
    })
    return NextResponse.json<Json>({ ok: true, isBlocked: updated.isBlocked })
  } catch (e: any) {
    return NextResponse.json<Json>(
      { ok: false, code: 'BLOCK_FAILED', detail: e?.message || String(e) },
      { status: 500 },
    )
  }
}
