export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Base = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  priceMonthly: z.coerce.number().int().nonnegative().default(0),
  priceYearly:  z.coerce.number().int().nonnegative().default(0),
  isPopular: z.coerce.boolean().optional().default(false),
  isActive:  z.coerce.boolean().optional().default(true),
});
const CreateSchema = Base;
const UpdateSchema = Base.extend({ id: z.string().min(1) });

function guardPlan() {
  if (!(prisma as any).plan) {
    return NextResponse.json(
      { error: "PRISMA_CLIENT_MISSMODEL", details: "prisma.plan is undefined. Run prisma migrate dev && prisma generate. Check DATABASE_URL and single @prisma/client." },
      { status: 500 }
    );
  }
  return null;
}

export async function GET() {
  const g = guardPlan(); if (g) return g;
  const data = await prisma.plan.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data, { status: 200 });
}
export async function POST(req: Request) {
  const g = guardPlan(); if (g) return g;
  const dto = CreateSchema.parse(await req.json());
  const created = await prisma.plan.create({ data: dto });
  return NextResponse.json(created, { status: 200 });
}
export async function PUT(req: Request) {
  const g = guardPlan(); if (g) return g;
  const dto = UpdateSchema.parse(await req.json());
  const updated = await prisma.plan.update({ where: { id: dto.id }, data: dto });
  return NextResponse.json(updated, { status: 200 });
}
export async function DELETE(req: Request) {
  const g = guardPlan(); if (g) return g;
  const { id } = await req.json();
  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true }, { status: 200 });
}