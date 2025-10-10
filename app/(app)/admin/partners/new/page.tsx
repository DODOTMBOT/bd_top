import { Card, CardBody, CardHeader } from '@/components/ui'
import NewPartnerForm from './NewPartnerForm'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewPartnerPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Создать партнёра</h1>
        </CardHeader>
        <CardBody>
          <NewPartnerForm />
        </CardBody>
      </Card>
    </div>
  )
}
