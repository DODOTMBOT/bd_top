import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireRole(["PARTNER"]);
    
    if (!session.user.partnerId) {
      return NextResponse.json({ error: "PARTNER_WITHOUT_PARTNERID" }, { status: 400 });
    }

    const points = await prisma.point.findMany({
      where: { partnerId: session.user.partnerId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ points });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["PARTNER"]);
    
    if (!session.user.partnerId) {
      return NextResponse.json({ error: "PARTNER_WITHOUT_PARTNERID" }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
    }

    const point = await prisma.point.create({
      data: {
        name: name.trim(),
        partnerId: session.user.partnerId,
      },
      select: { id: true, name: true, createdAt: true }
    });

    return NextResponse.json({ id: point.id, name: point.name }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
