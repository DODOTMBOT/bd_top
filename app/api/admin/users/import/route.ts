export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { audit } from "@/lib/audit";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

function parseCsv(raw: string) {
  // ожидаем header: email,name,login,role,partnerId,pointId,password
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines.shift()!;
  const cols = header.split(",").map(s => s.trim());
  const idx = (k: string) => cols.indexOf(k);
  const out: any[] = [];
  for (const line of lines) {
    const cells = line.split(",").map(s => s.replace(/^"|"$/g,"").replace(/""/g,'"'));
    out.push({
      email: cells[idx("email")],
      name: cells[idx("name")] || null,
      login: cells[idx("login")] || null,
      role: (cells[idx("role")] || "USER") as Role,
      partnerId: cells[idx("partnerId")] || null,
      pointId: cells[idx("pointId")] || null,
      password: cells[idx("password")] || null,
    });
  }
  return out;
}

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, [Role.OWNER]);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  const text = await file.text();
  const rows = parseCsv(text);

  const created: string[] = [];
  for (const r of rows) {
    if (!r.email || !r.password) continue;
    const passwordHash = await bcrypt.hash(r.password, 10);
    const u = await prisma.user.create({
      data: { email: r.email, name: r.name, login: r.login, role: r.role, partnerId: r.partnerId, pointId: r.pointId, passwordHash }
    });
    created.push(u.id);
    await audit({ actorUserId: gate.userId, targetUserId: u.id, action: "USER_IMPORT", meta: { email: r.email } });
  }
  return NextResponse.json({ ok: true, created });
}
