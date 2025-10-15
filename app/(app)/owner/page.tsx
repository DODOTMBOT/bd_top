import { checkAccess } from "@/lib/checkAccess";
import { Card, CardBody } from "@/components/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerPage() {
  await checkAccess("/owner");
  
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Панель OWNER</h1>
      <p className="opacity-70">Добро пожаловать в панель владельца!</p>
      <Card>
        <CardBody>
          <p>Здесь будет управление сервисом.</p>
        </CardBody>
      </Card>
    </section>
  );
}


