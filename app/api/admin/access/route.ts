import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { scanAllRoutes } from "@/src/lib/routeScanner";
import { z } from "zod";

const BodySchema = z.object({
  role: z.string().min(1),
  rules: z.array(z.object({
    path: z.string().min(1),
    allowed: z.boolean()
  })).max(5000), // жёсткий ограничитель нагрузки
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

type RuleDTO = { path: string; allowed: boolean };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  if (!role) return NextResponse.json({ error: "role param required" }, { status: 400 });

  try {
    const pages = await scanAllRoutes(); // [{ path: string, ... }]
    const paths = pages.map(p => p.path);

    const stored = await prisma.rolePageAccess.findMany({ where: { roleKey: role } });
    const storedMap = new Map(stored.map(r => [r.path, r.allowed]));

    const rules: RuleDTO[] = paths.map(path => ({
      path,
      allowed: storedMap.get(path) ?? false,
    }));

    return NextResponse.json({ role, rules }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_BODY", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { role, rules } = parsed.data;

    // Нормализуем и убираем дубликаты путей
    const dedupMap = new Map<string, boolean>();
    for (const r of rules) dedupMap.set(r.path, r.allowed);
    const data = Array.from(dedupMap.entries()).map(([path, allowed]) => ({
      roleKey: role,
      path,
      allowed,
    }));

    // Пустой набор правил допустим — просто очищаем
    const tasks: Parameters<typeof prisma.$transaction>[0] = [
      prisma.rolePageAccess.deleteMany({ where: { roleKey: role } }),
    ];

    if (data.length > 0) {
      // SQLite имеет лимит на кол-во параметров в запросе (~999).
      // Prisma createMany сам не всегда чанкует. Делаем это явно.
      const batches = chunk(data, 200); // 200 строк на батч — безопасно
      for (const b of batches) {
        tasks.push(
          prisma.rolePageAccess.createMany({
            data: b,
          })
        );
      }
    }

    await prisma.$transaction(tasks);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    // Логирование (опционально можно расширить кодами Prisma)
    console.error("PUT /api/admin/access failed", e);
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
