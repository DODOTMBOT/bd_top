export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
type Role = "OWNER" | "PARTNER" | "POINT" | "USER";

export async function GET(req: NextRequest) {
  try {
    const gate = await requireRole(req, ["OWNER"]);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

            const total = await (prisma as any).user.count({ where: { isActive: true } });
            const active = await (prisma as any).user.count({ where: { isActive: true, isBlocked: false } });
            const blocked = await (prisma as any).user.count({ where: { isActive: true, isBlocked: true } });
            const byRole = await (prisma as any).user.groupBy({ 
              by: ["role"], 
              where: { isActive: true },
              _count: { role: true } 
            });

    return NextResponse.json({ total, active, blocked, byRole });
  } catch (e: any) {
    console.error("GET /api/admin/users/stats error:", e);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
