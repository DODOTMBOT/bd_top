"use server";
import { prisma } from "@/lib/prisma";

export async function listRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
}

export async function createRole(data: { key: string; name: string; description?: string }) {
  return prisma.role.create({ data });
}
