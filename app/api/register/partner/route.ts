export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { prisma, dbPing, isP1001 } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  companyName: z.string().trim().min(1).max(120),
})

function envTrue(v: unknown) {
  return ['true','1','yes','on'].includes(String(v ?? '').trim().toLowerCase())
}
function isSignupEnabled() {
  return envTrue((process.env as Record<string, string | undefined>)['ENABLE_PARTNER_SIGNUP'])
}

export async function GET() {
  return NextResponse.json({ signupEnabled: isSignupEnabled() })
}

export async function POST(req: Request) {
  if (!isSignupEnabled()) {
    return NextResponse.json({ error: 'signup_disabled' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password, companyName } = parsed.data

  const up = await dbPing(1000)
  if (!up) {
    return NextResponse.json({ error: 'DB_UNAVAILABLE' }, { status: 503 })
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'email_exists' }, { status: 409 })
    }

    const passwordHash = await bcryptjs.hash(password, 10)
    const accountUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'PARTNER',
        isActive: true
      },
      select: { id: true, email: true, role: true }
    })

    function buildPartnerCreateData(name: string): Prisma.PartnerCreateInput {
      return {
        name,
        account: { connect: { id: accountUser.id } },
      }
    }

    const partner = await prisma.partner.create({ data: buildPartnerCreateData(companyName) })

    await prisma.user.update({ where: { id: accountUser.id }, data: { partnerId: partner.id } })

    return NextResponse.json({ ok: true, user: { ...accountUser, partnerId: partner.id } }, { status: 201 })
  } catch (e: unknown) {
    const error = e as { code?: string; message?: string };
    if (isP1001(e)) {
      return NextResponse.json({ error: 'DB_UNAVAILABLE' }, { status: 503 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'conflict', code: error.code, meta: error.meta }, { status: 409 })
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'fk_failed', code: error.code, meta: error.meta }, { status: 400 })
      }
      return NextResponse.json({ error: 'prisma_known', code: error.code, meta: error.meta }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('[register.partner] validation_failed', error)
      return NextResponse.json({ error: 'validation_failed', message: error.message }, { status: 400 })
    }
    console.error('[register.partner] unexpected', error)
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
}


