import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const hasPlan = typeof (prisma as any).plan !== "undefined";
  return NextResponse.json({ hasPlan, db: process.env.DATABASE_URL ?? null });
}