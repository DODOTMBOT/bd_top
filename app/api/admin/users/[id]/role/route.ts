import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const Body = z.object({ roleKey: z.enum(["owner","partner","manager","employee"]) });

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  try {
    const updated = await prisma.adminUser.update({
      where: { id: params.id },
      data: { roleKey: parsed.data.roleKey },
    });
    return NextResponse.json({ ok: true, user: updated }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
