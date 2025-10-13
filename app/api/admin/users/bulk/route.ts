export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const gate = await requireRole(req, ["OWNER"]);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const { ids, action } = await req.json() as { ids: string[]; action: 'block' | 'unblock' | 'delete' };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'EMPTY' }, { status: 400 });
    }

    if (action === 'delete') {
      await (prisma as any).user.deleteMany({ where: { id: { in: ids } } });
      await audit({ actorUserId: gate.userId, action: "BULK_DELETE", meta: { count: ids.length } });
      return NextResponse.json({ ok: true });
    }

    const setValue = action === 'block';
    await (prisma as any).user.updateMany({ 
      where: { id: { in: ids } }, 
      data: { isBlocked: setValue } 
    });
    
    await audit({ 
      actorUserId: gate.userId, 
      action: setValue ? "BULK_BLOCK" : "BULK_UNBLOCK", 
      meta: { count: ids.length } 
    });
    
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/admin/users/bulk error:", e);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
