import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canAccess } from '@/lib/acl'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login?cb=/dashboard')

  return (
    <div className="space-y-6">
      <ul className="list-inside list-disc space-y-1">
        {((session?.user as { pages?: string[] })?.pages as string[] | undefined)?.map((p: string) => (
          <li key={p}>
            <Link href={p} className="text-blue-600 hover:underline">{p}</Link>
          </li>
        ))}
      </ul>

      <div className="space-x-4">
        {canAccess(session, '/owner') && (
          <Link href="/owner" className="text-blue-600 hover:underline">Owner</Link>
        )}
        {canAccess(session, '/partner') && (
          <Link href="/partner" className="text-blue-600 hover:underline">Partner</Link>
        )}
        {canAccess(session, '/point') && (
          <Link href="/point" className="text-blue-600 hover:underline">Point</Link>
        )}
      </div>
    </div>
  )
}



