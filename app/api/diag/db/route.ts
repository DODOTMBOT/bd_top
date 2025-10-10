import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const users = await prisma.user.count().catch(() => -1);
    return NextResponse.json({ ok: true, users });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return NextResponse.json({ ok: false, message: error?.message ?? "error" }, { status: 503 });
  }
}

