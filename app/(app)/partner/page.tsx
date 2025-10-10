import { guard } from '@/lib/guard';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Button } from '@/components/ui';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PartnerPage() {
  const { role } = await guard('/partner');
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Партнёр</h1>
      
      {(role === 'PARTNER' || role === 'OWNER') && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Управление</h2>
          </CardHeader>
          <CardBody>
            <Button as={Link} href="/partner/points" color="primary">
              Точки
            </Button>
          </CardBody>
        </Card>
      )}
      
      <Card>
        <CardBody>
          <p className="opacity-70">Здесь будут точки и сотрудники.</p>
        </CardBody>
      </Card>
    </section>
  );
}


