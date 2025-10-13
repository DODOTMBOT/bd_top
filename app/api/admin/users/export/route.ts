export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, [Role.OWNER]);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rows = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { email: true, name: true, login: true, role: true, partnerId: true, pointId: true, isBlocked: true, createdAt: true }
  });

  const header = ["email","name","login","role","partnerId","pointId","isBlocked","createdAt"].join(",");
  const body = rows.map(r => [
    r.email, r.name ?? "", r.login ?? "", r.role, r.partnerId ?? "", r.pointId ?? "", r.isBlocked ? "1" : "0", r.createdAt.toISOString()
  ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const csv = header + "\n" + body;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users.csv"`
    }
  });
}
