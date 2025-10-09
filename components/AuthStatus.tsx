'use client'
import { useSession, signOut } from 'next-auth/react'

export default function AuthStatus() {
  const { data: session, status } = useSession()
  if (status === 'loading') return <span className="text-xs text-gray-500">…</span>

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span>{session.user.email} ({(session.user as any).role})</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="border px-2 py-1 rounded"
        >
          Выйти
        </button>
      </div>
    )
  }
  return <a href="/login" className="underline text-sm">Войти</a>
}



