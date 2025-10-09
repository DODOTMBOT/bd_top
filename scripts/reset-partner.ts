import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'

async function main() {
  const email = process.argv[2]
  const newPass = process.argv[3] || 'Partner123'
  if (!email) throw new Error('Usage: tsx scripts/reset-partner.ts partner@example.com [newPass]')
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash: await hashPassword(newPass), mustChangePassword: false },
  })
  console.log('OK. New password set.')
}

main().catch((e) => { console.error(e); process.exit(1) })



