import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Create = z.object({ label: z.string().min(1), path: z.string().min(1) });
const UpdateMany = z.array(
  z.object({
    id: z.string(),
    label: z.string().min(1),
    path: z.string().min(1),
    order: z.number().int(),
  })
);

export async function GET() {
  const items = await prisma.menu.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const dto = Create.parse(body);
  const max = await prisma.menu.aggregate({ _max: { order: true } });
  const created = await prisma.menu.create({
    data: { label: dto.label, path: dto.path, order: (max._max.order ?? -1) + 1 },
  });
  return NextResponse.json(created, { status: 200 });
}

export async function PUT(req: Request) {
  const list = UpdateMany.parse(await req.json());
  await prisma.$transaction(
    list.map(i =>
      prisma.menu.update({
        where: { id: i.id },
        data: { label: i.label, path: i.path, order: i.order },
      })
    )
  );

  // вернуть свежие данные
  const updated = await prisma.menu.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.menu.delete({ where: { id } });
  return NextResponse.json({ success: true }, { status: 200 });
}