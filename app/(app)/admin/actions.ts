// app/admin/actions.ts
"use server";
import { prisma } from "@/lib/db";
import { $Enums } from "@prisma/client";

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as $Enums.UserRoleType;
  if (!userId) throw new Error("userId required");
  if (!Object.values($Enums.UserRoleType).includes(role)) throw new Error("invalid role");
  await prisma.user.update({ where: { id: userId }, data: { role } });
}