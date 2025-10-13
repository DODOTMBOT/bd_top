export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Body = { newPassword?: string }
type Json =
  | { ok: true }
  | { ok: false; code: string; detail?: string }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { newPassword } = (await req.json()) as Body
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json<Json>({ ok: false, code: 'WEAK_PASSWORD' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json<Json>({ ok: false, code: 'NOT_FOUND' }, { status: 404 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Поддержка разных названий поля в схеме
    let updated = null as any
    try {
      updated = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
        select: { id: true },
      })
    } catch {
      // fallback: hashedPassword
      updated = await prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword: passwordHash } as any,
        select: { id: true },
      })
    }

    return NextResponse.json<Json>({ ok: true })
  } catch (e: any) {
    return NextResponse.json<Json>(
      { ok: false, code: 'PASSWORD_UPDATE_FAILED', detail: e?.message || String(e) },
      { status: 500 },
    )
  }
}
