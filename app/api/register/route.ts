import { NextResponse } from 'next/server'

export const runtime = 'nodejs';
import { z } from 'zod'
import bcryptjs from 'bcryptjs'
import { prisma, dbPing, isP1001 } from '@/lib/prisma'
import { ensureSessionVersionColumn } from '@/lib/db/ensureSessionVersion'
import { Role } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().trim().optional(),
})

export async function POST(req: Request) {
  if (process.env.ENABLE_PUBLIC_SIGNUP !== 'true') {
    return NextResponse.json({ error: 'Public signup disabled' }, { status: 403 })
  }

  try {
    await ensureSessionVersionColumn();
    const raw = await req.json()
    const email = String(raw.email ?? '').trim().toLowerCase()
    const password = String(raw.password ?? '')
    const name = String(raw.name ?? '').trim()

    if (!email || !password) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
    }

    const up = await dbPing(1000)
    if (!up) {
      return NextResponse.json({ error: 'DB_UNAVAILABLE' }, { status: 503 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'EMAIL_IN_USE' }, { status: 409 })
    }

    const hash = await bcryptjs.hash(password, 11)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name: name || null, passwordHash: hash, role: Role.USER },
        select: { id: true }
      })
      return user
    })

    return NextResponse.json({ ok: true, userId: result.id }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('email')) {
      return NextResponse.json({ error: 'EMAIL_IN_USE' }, { status: 409 })
    }
    if (isP1001(e)) {
      return NextResponse.json({ error: 'DB_UNAVAILABLE' }, { status: 503 })
    }
    console.error('REGISTER_ERROR', e)
    return NextResponse.json({ error: 'REGISTRATION_FAILED' }, { status: 500 })
  }
}



