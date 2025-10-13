export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { audit } from "@/lib/audit";
type Role = "OWNER" | "PARTNER" | "POINT" | "USER";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole(req, ["OWNER"]);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.login !== undefined) data.login = body.login;
  if (body.role !== undefined) data.role = body.role as Role;
  if (body.partnerId !== undefined) data.partnerId = body.partnerId || null;
  if (body.pointId !== undefined) data.pointId = body.pointId || null;
  if (body.isActive !== undefined) data.isActive = !!body.isActive;

  const user = await (prisma as any).user.update({ where: { id: params.id }, data, select: { id: true } });
  await audit({ actorUserId: gate.userId, targetUserId: user.id, action: "USER_UPDATE", meta: data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole(req, ["OWNER"]);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  
  // Получаем данные пользователя перед удалением для аудита
  const user = await (prisma as any).user.findUnique({ where: { id: params.id }, select: { id: true, email: true, name: true } });
  if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  
  // Удаляем пользователя из базы данных
  await (prisma as any).user.delete({ where: { id: params.id } });
  await audit({ actorUserId: gate.userId, targetUserId: user.id, action: "USER_DELETE", meta: { email: user.email, name: user.name } });
  return NextResponse.json({ ok: true });
}
