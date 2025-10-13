// app/(app)/health/new/page.tsx
import { requireRoles, resolveTenantContext, listPointEmployees } from "@/lib/authz";
import { HealthLogForm } from "../HealthLogForm";

export const metadata = { title: "Журнал здоровья — новая запись" };

export default async function Page() {
  let employees = [];
  let userName = "";
  
  try {
    const { session } = await requireRoles(["PARTNER", "POINT", "USER", "OWNER", "PLATFORM_OWNER"]);
    const { pointId, userName: user } = await resolveTenantContext(session.user.id);
    userName = user;
    employees = await listPointEmployees(pointId);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    // Используем тестовые данные
    employees = [
      { id: "test1", name: "Иван Петров", login: "employee1" },
      { id: "test2", name: "Мария Сидорова", login: "employee2" }
    ];
    userName = "Тестовый менеджер";
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Новая запись журнала здоровья</h1>
      <HealthLogForm employees={employees} defaultManager={userName} />
    </div>
  );
}
