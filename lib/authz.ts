// lib/authz.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type Role = "OWNER" | "PARTNER" | "POINT" | "USER" | "PLATFORM_OWNER";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Не авторизован");
  return session;
}

export async function requireRoles(roles: Role[]) {
  const session = await requireSession();
  const role = (session.user as any)?.role as Role;
  if (!roles.includes(role)) throw new Error("Доступ запрещен");
  return { session, role };
}

/**
 * Возвращает текущий partnerId/pointId пользователя.
 * Предполагается, что у User есть поля partnerId/pointId или доступные связи.
 * Если у тебя другая модель — подстрой резолвер.
 */
export async function resolveTenantContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, partnerId: true, pointId: true, name: true },
  });
  if (!user?.partnerId || !user?.pointId) throw new Error("Не найден tenant-контекст пользователя");
  return { partnerId: user.partnerId, pointId: user.pointId, userName: user.name ?? "" };
}

/**
 * Возвращает сотрудников текущей точки для селекта.
 */
export async function listPointEmployees(pointId: string) {
  return prisma.user.findMany({
    where: { pointId, role: "USER", isBlocked: false },
    select: { id: true, name: true, login: true },
    orderBy: { name: "asc" },
  });
}
