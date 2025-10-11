import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const users = await prisma.adminUser.findMany({ orderBy: { email: "asc" } });
  return NextResponse.json({ users }, { status: 200 });
}
