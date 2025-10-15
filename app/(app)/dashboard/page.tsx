import Link from 'next/link'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Добро пожаловать в панель управления!</p>
      
      <div className="space-x-4">
        <Link href="/owner" className="text-blue-600 hover:underline">Owner</Link>
        <Link href="/partner" className="text-blue-600 hover:underline">Partner</Link>
        <Link href="/point" className="text-blue-600 hover:underline">Point</Link>
      </div>
    </div>
  )
}



