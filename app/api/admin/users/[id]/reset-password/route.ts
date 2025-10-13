export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { audit } from "@/lib/audit";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole(req, [Role.OWNER]);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { tempPassword } = await req.json(); // передаём временный пароль, отправку почты реализуешь позже
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({ where: { id: params.id }, data: { passwordHash, mustResetPassword: true, sessionVersion: { increment: 1 } } });
  await audit({ actorUserId: gate.userId, targetUserId: params.id, action: "USER_FORCE_PASSWORD_RESET" });
  return NextResponse.json({ ok: true });
}
