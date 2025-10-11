import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { scanAllRoutes } from "@/src/lib/routeScanner";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  if (!role) return NextResponse.json({ error: "role param required" }, { status: 400 });

  const pages = await scanAllRoutes(); // ожидается массив с полем path
  const validPaths = new Set<string>(pages.map(p => p.path));

  // считаем только те записи, которые соответствуют реально существующим путям
  const allowed = await prisma.rolePageAccess.findMany({
    where: { roleKey: role, allowed: true },
    select: { path: true }
  });

  const allowedCount = allowed.reduce((acc, r) => acc + (validPaths.has(r.path) ? 1 : 0), 0);
  const totalCount = validPaths.size;

  return NextResponse.json({ role, allowedCount, totalCount }, { status: 200 });
}
