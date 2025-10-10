import { prisma } from '@/lib/db'

export async function invalidateUserSessions(userId: string) {
  // NextAuth v5 default is JWT (no DB sessions). If sessions table exists, delete by userId.
  try {
    // @ts-expect-error - if Session model does not exist, this will throw at runtime
    await (prisma as { session?: { deleteMany?: (args: { where: { userId: string } }) => Promise<void> } }).session?.deleteMany?.({ where: { userId } })
  } catch {
    // ignore if sessions table not configured
  }
}



