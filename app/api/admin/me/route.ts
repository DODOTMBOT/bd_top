import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const email = process.env.CURRENT_USER_EMAIL ?? "owner@example.com";
  const me = await prisma.adminUser.findUnique({ where: { email } });
  return NextResponse.json({ me }, { status: 200 });
}
