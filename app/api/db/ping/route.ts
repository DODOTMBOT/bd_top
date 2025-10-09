import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return Response.json({ ok: true });
  } catch (e: any) {
    console.error("[DB][PING]", e.code ?? e.name, e.message);
    return new Response(JSON.stringify({ ok: false, code: e.code, message: e.message }), { status: 500 });
  }
}

