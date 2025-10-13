export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "DISABLED" }, { status: 403 });

  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  await prisma.user.update({ where: { id: (s.user as any).id }, data: { role: "OWNER" } });

  return NextResponse.json({ ok: true });
}
