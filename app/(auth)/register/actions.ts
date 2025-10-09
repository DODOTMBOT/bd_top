"use server";

import { prisma, isP1001, dbPing } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

type Input = { name: string; email: string; password: string; partnerName?: string };

export type RegisterResult =
  | { ok: true; userId: string; role: string; partnerId: string }
  | { ok: false; code: "DB_UNAVAILABLE" | "VALIDATION" | "CONFLICT" | "UNKNOWN"; message: string };

export async function registerPartnerAction({ name, email, password, partnerName }: Input): Promise<RegisterResult> {
  const emailLower = email.trim().toLowerCase();

  if (!emailLower || !password) {
    return { ok: false, code: "VALIDATION", message: "Email и пароль обязательны" };
  }

  const up = await dbPing(1000);
  if (!up) return { ok: false, code: "DB_UNAVAILABLE", message: "База данных недоступна" };

  try {
    const exists = await prisma.user.findUnique({ where: { email: emailLower } });
    if (exists) {
      return { ok: false, code: "CONFLICT", message: "Этот email уже зарегистрирован" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем Partner и User в транзакции
    const result = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({ 
        data: { name: partnerName ?? "Новый партнёр" }
      });

      const user = await tx.user.create({
        data: {
          name: (name || 'Партнёр').trim(),
          email: emailLower,
          role: "PARTNER",
          passwordHash,
          partnerId: partner.id,
          mustChangePassword: false,
        },
        select: { id: true, role: true, partnerId: true, email: true },
      });

      return { user, partner };
    });

    // best-effort авто-логин (без падения)
    try {
      const res = await signIn("credentials", { redirect: false, identifier: emailLower, password });
      if ((res as any)?.error) {
        return { ok: true, userId: result.user.id, role: result.user.role, partnerId: result.user.partnerId! };
      }
    } catch {
      // игнорируем
    }

    return { ok: true, userId: result.user.id, role: result.user.role, partnerId: result.user.partnerId! };
  } catch (e: any) {
    if (e?.code === "P2002" || /unique/i.test(String(e?.message))) {
      return { ok: false, code: "CONFLICT", message: "Этот email уже зарегистрирован" };
    }
    if (isP1001(e)) {
      return { ok: false, code: "DB_UNAVAILABLE", message: "База данных недоступна" };
    }
    return { ok: false, code: "UNKNOWN", message: "Не удалось зарегистрироваться" };
  }
}



