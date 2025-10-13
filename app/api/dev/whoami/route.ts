export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const s = await auth();
  return NextResponse.json({ session: s });
}
