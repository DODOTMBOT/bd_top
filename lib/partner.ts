import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function requirePartnerFromSession() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED_NO_SESSION")
  }

  // user.id в сессии должен соответствовать Account.id
  const accountId = session.user.id

  const partner = await prisma.partner.findUnique({
    where: { accountId },
  })

  if (!partner) {
    throw new Error("Partner not found")
  }

  return partner
}


