import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function requireRole(req: NextRequest, allowed: Role[]) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, status: 401, error: "UNAUTHORIZED" as const };

  // роль из JWT, иначе из БД
  let role = (session.user as any).role as Role | undefined;
  if (!role) {
    const u = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { role: true } });
    role = u?.role;
  }
  if (!role || !allowed.includes(role)) return { ok: false as const, status: 403, error: "FORBIDDEN" as const };

  return { ok: true as const, session, role, userId: (session.user as any).id as string };
}
