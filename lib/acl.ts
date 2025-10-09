import type { Session } from 'next-auth'

export function canAccess(slug: string, session: Session | null) {
  if (!session?.user?.pages) return false
  return session.user.pages.includes(slug)
}



