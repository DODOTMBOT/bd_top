import { listPointsAction } from './actions'
import PointsTable from './PointsTable'
import NewPointForm from './NewPointForm'
import { requirePartnerFromSession } from '@/lib/partner'

export default async function PartnerPointsPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  try {
    const partner = await requirePartnerFromSession()
    const { points } = await listPointsAction()
    const created = searchParams?.created === '1'
    const error = searchParams?.error ?? ''

    return (
      <div className="container py-8 space-y-6">

        {created && <div className="text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded">Точка создана</div>}
        {error && !created && <div className="text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{decodeURIComponent(error)}</div>}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Создать точку</h2>
          <NewPointForm />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Список точек</h2>
          {Array.isArray(points) && points.length > 0 ? (
            <PointsTable points={points} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Нет точек</p>
              <p className="text-sm mt-2">Создайте первую точку с помощью формы выше</p>
            </div>
          )}
        </div>
      </div>
    )
  } catch (e: any) {
    if (e?.code === 401 || e?.message === "PARTNER_NOT_FOUND_FOR_ACCOUNT" || e?.message === "Partner not found") {
      return (
        <div className="container py-8">
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Партнёр не найден</h2>
            <p className="text-gray-600 mb-6">
              Привяжите текущий аккаунт к роли Партнёра или создайте партнёра в админке.
            </p>
            <a 
              href="/admin/partners/new" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Создать партнёра
            </a>
          </div>
        </div>
      )
    }
    throw e
  }
}


