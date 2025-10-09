import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canAccess } from '@/lib/acl'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login?cb=/dashboard')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Доступные страницы</h1>
      <ul className="list-inside list-disc space-y-1">
        {(session.user.pages || []).map((p) => (
          <li key={p}>
            <Link href={p} className="text-blue-600 hover:underline">{p}</Link>
          </li>
        ))}
      </ul>

      <div className="space-x-4">
        {canAccess('/owner', session) && (
          <Link href="/owner" className="text-blue-600 hover:underline">Owner</Link>
        )}
        {canAccess('/partner', session) && (
          <Link href="/partner" className="text-blue-600 hover:underline">Partner</Link>
        )}
        {canAccess('/point', session) && (
          <Link href="/point" className="text-blue-600 hover:underline">Point</Link>
        )}
      </div>
    </div>
  )
}



