import { Card, CardBody, CardHeader } from '@/components/ui'
import NewPartnerForm from './NewPartnerForm'

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
