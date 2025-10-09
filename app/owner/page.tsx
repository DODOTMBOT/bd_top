import { checkAccess } from "@/lib/rbac";
import DbDown from "@/components/DbDown";
import { Card, CardBody, Alert } from "@/components/ui";

function Denied() {
  return <Alert color="danger" title="Доступ запрещен" description="Нет доступа" />;
}

export default async function OwnerPage() {
  const res = await checkAccess("/owner", "read");
  if (!res.allowed) {
    if (res.reason === "DB_UNAVAILABLE") {
      return (
        <div className="p-4">
          <DbDown />
        </div>
      );
    }
    return <Denied />;
  }
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Панель OWNER</h1>
      <p className="opacity-70">Вы вошли как {res.session?.user?.email || 'Неизвестный пользователь'}</p>
      <Card>
        <CardBody>
          <p>Здесь будет управление сервисом.</p>
        </CardBody>
      </Card>
    </section>
  );
}


