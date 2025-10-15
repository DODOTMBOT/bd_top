export const runtime = 'nodejs'

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const error = e as { message?: string };
    console.error("[DB][PING]", error.message);
    return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
  }
}

