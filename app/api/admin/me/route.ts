import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    
    const me = await (prisma as any).user.findUnique({ 
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        login: true,
        role: true,
        isBlocked: true,
        partnerId: true,
        pointId: true,
      }
    });
    
    if (!me) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }
    
    return NextResponse.json({ me }, { status: 200 });
  } catch (err) {
    console.error("[me_API_ERROR]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
