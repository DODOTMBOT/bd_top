import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      partnerId: session.user.partnerId,
      pointId: session.user.pointId,
      login: session.user.login,
      mustChangePassword: session.user.mustChangePassword
    });
  } catch (error) {
    console.error("[API][ME] error", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
