import { listPointsAction } from './actions'
import PointsTable from './PointsTable'
import NewPointForm from './NewPointForm'
import { requirePartnerFromSession } from '@/lib/partner'
import { Card, CardBody, CardHeader, Button, Alert } from '@/components/ui'

export default async function PartnerPointsPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  try {
    const partner = await requirePartnerFromSession()
    const { points } = await listPointsAction()
    const created = searchParams?.created === '1'
    const error = searchParams?.error ?? ''

    return (
      <div className="container py-8 space-y-6">

        {created && <Alert color="success" title="Успех" description="Точка создана" />}
        {error && !created && <Alert color="danger" title="Ошибка" description={decodeURIComponent(error)} />}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Создать точку</h2>
          </CardHeader>
          <CardBody>
            <NewPointForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Список точек</h2>
          </CardHeader>
          <CardBody>
            {Array.isArray(points) && points.length > 0 ? (
              <PointsTable points={points} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Нет точек</p>
                <p className="text-sm mt-2">Создайте первую точку с помощью формы выше</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    )
  } catch (e: any) {
    if (e?.code === 401 || e?.message === "PARTNER_NOT_FOUND_FOR_ACCOUNT" || e?.message === "Partner not found") {
      return (
        <div className="container py-8">
          <Card className="p-12 text-center">
            <CardHeader>
              <h2 className="text-xl font-semibold">Партнёр не найден</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-6">
                Привяжите текущий аккаунт к роли Партнёра или создайте партнёра в админке.
              </p>
              <Button as="a" href="/admin/partners/new" color="primary">
                Создать партнёра
              </Button>
            </CardBody>
          </Card>
        </div>
      )
    }
    throw e
  }
}


