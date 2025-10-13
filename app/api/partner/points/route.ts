// app/api/partner/points/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireRole } from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().min(2, "Название слишком короткое").max(100),
  address: z.string().min(5, "Адрес слишком короткий").max(200),
  login: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/,"Только латиница, цифры, . _ -"),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const partner = await requireRole("PARTNER");
  if (!partner) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, address, login, password } = parsed.data;

  // Проверим уникальность логина для будущего пользователя POINT
  const exists = await prisma.user.findUnique({ where: { login } });
  if (exists) {
    return NextResponse.json({ error: "LOGIN_TAKEN" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Создаём юзера для входа точки (роль POINT)
      const pointUser = await tx.user.create({
        data: {
          login,
          passwordHash,
          role: "POINT",
          name: name,
        },
        select: { id: true },
      });

      // Создаём саму точку, связывая с PARTNER и POINT-логином
      const point = await tx.point.create({
        data: {
          name,
          address,
          partnerUserId: partner.id,
          pointUserId: pointUser.id,
        },
      });

      return point;
    });

    return NextResponse.json({ ok: true, pointId: result.id });
  } catch (e) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
