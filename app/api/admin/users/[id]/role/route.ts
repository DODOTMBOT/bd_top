export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ROLES = ['OWNER','PARTNER','POINT','USER'] as const
type Role = (typeof ROLES)[number]

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { role } = await req.json() as { role: Role }
  if (!ROLES.includes(role as Role)) return NextResponse.json({ error: 'BAD_ROLE' }, { status: 400 })

  const user = await (prisma as any).user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, role: true }
  })
  return NextResponse.json(user)
}