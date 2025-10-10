// app/admin/page.tsx
import AdminTabsClient from "./tabs/AdminTabsClient";
import { prisma } from "@/lib/db";
import { $Enums } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// маппинг ключа роли из таблицы Role -> enum пользователя
const KEY_TO_ENUM: Record<string, $Enums.UserRoleType> = {
  OWNER: $Enums.UserRoleType.OWNER,
  PARTNER: $Enums.UserRoleType.PARTNER,
  POINT: $Enums.UserRoleType.POINT,
  EMPLOYEE: $Enums.UserRoleType.EMPLOYEE,
  USER: $Enums.UserRoleType.EMPLOYEE,
};

export default async function AdminPage() {
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  // считаем пользователей по enum
  const grouped = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });
  const countByEnum = new Map(grouped.map(g => [g.role, g._count.role]));

  const rolesWithCounts = roles.map(r => {
    const e = KEY_TO_ENUM[r.key] ?? (r.key as unknown as $Enums.UserRoleType);
    return { ...r, usersCount: countByEnum.get(e) ?? 0 };
  });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, login: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Панель администратора</h1>
        <p className="text-default-500">Управление ролями, ресурсами и правами доступа в системе RBAC</p>
      </div>
      <AdminTabsClient roles={rolesWithCounts} users={users} />
    </div>
  );
}