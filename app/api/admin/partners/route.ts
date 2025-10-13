import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const partners = await prisma.user.findMany({
      where: { role: "PARTNER" },
      select: {
        id: true,
        name: true,
        login: true,
        email: true,
        createdAt: true,
        pointsOwned: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
            pointUser: {
              select: {
                login: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ partners }, { status: 200 });
  } catch (e: any) {
    console.error('GET /api/admin/partners error:', e);
    return NextResponse.json({ error: "PARTNERS_LIST_FAILED", details: e.message }, { status: 500 });
  }
}