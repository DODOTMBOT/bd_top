export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { audit } from "@/lib/audit";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole(req, [Role.OWNER]);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  await prisma.user.update({ where: { id: params.id }, data: { sessionVersion: { increment: 1 } } });
  await audit({ actorUserId: gate.userId, targetUserId: params.id, action: "USER_REVOKE_SESSIONS" });
  return NextResponse.json({ ok: true });
}
