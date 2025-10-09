import { checkAccess } from "@/lib/rbac";
import DbDown from "@/components/DbDown";

function Denied() {
  return <div className="p-4 border border-red-300 bg-red-50 rounded">Нет доступа</div>;
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
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Панель OWNER</h1>
      <p className="opacity-70">Вы вошли как {res.session?.user?.email || 'Неизвестный пользователь'}</p>
      <div className="border rounded p-4">Здесь будет управление сервисом.</div>
    </section>
  );
}


