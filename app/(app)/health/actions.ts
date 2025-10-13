// app/(app)/health/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRoles, resolveTenantContext } from "@/lib/authz";
import { z } from "zod";

const HealthLogSchema = z.object({
  date: z.string().min(1),
  employeeId: z.string().min(1, "Выберите сотрудника"),
  employeeName: z.string().min(1),
  temperature: z.string().optional(), // хранится как float, парсим ниже
  symptoms: z.string().optional(),
  wounds: z.string().optional(),
  firstAid: z.string().optional(),
  allowedToWork: z.boolean(),
  managerName: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateHealthLogInput = z.infer<typeof HealthLogSchema>;

export async function createHealthLog(input: CreateHealthLogInput) {
  const { session } = await requireRoles(["PARTNER", "POINT", "USER", "OWNER", "PLATFORM_OWNER"]);
  const { partnerId, pointId } = await resolveTenantContext(session.user.id);

  const data = HealthLogSchema.parse(input);

  const temperature = data.temperature && data.temperature.trim() !== ""
    ? parseFloat(data.temperature.replace(",", "."))
    : null;

  await prisma.healthLog.create({
    data: {
      date: new Date(data.date),
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      temperature,
      symptoms: data.symptoms || null,
      wounds: data.wounds || null,
      firstAid: data.firstAid || null,
      allowedToWork: data.allowedToWork,
      managerName: data.managerName || null,
      notes: data.notes || null,
      createdById: session.user.id,
      partnerId,
      pointId,
    },
  });

  return { ok: true };
}

export async function listHealthLogs(limit = 50) {
  const { session } = await requireRoles(["PARTNER", "POINT", "USER", "OWNER", "PLATFORM_OWNER"]);
  const { partnerId, pointId } = await resolveTenantContext(session.user.id);
  const items = await prisma.healthLog.findMany({
    where: { partnerId, pointId },
    orderBy: { date: "desc" },
    take: limit,
    select: {
      id: true, date: true, employeeName: true, allowedToWork: true, temperature: true, managerName: true, createdAt: true,
    },
  });
  return items;
}
