import { NextResponse } from 'next/server'

export const runtime = 'nodejs';
import { z } from 'zod'
import bcryptjs from 'bcryptjs'
import { prisma, dbPing, isP1001 } from '@/lib/prisma'
import { UserRoleType } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().trim().optional(),
})

export async function POST(req: Request) {
  if (process.env.ENABLE_PUBLIC_SIGNUP !== 'true') {
    return NextResponse.json({ error: 'Public signup disabled' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password, name } = parsed.data

  const up = await dbPing(1000)
  if (!up) {
    return NextResponse.json({ error: 'DB_UNAVAILABLE' }, { status: 503 })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcryptjs.hash(password, 10)
    await prisma.user.create({
      data: { email, name: name || null, passwordHash, role: UserRoleType.EMPLOYEE },
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    if (isP1001(e)) {
      return NextResponse.json({ error: 'DB_UNAVAILABLE' }, { status: 503 })
    }
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
}



