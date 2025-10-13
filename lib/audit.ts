import { prisma } from "@/lib/prisma";

export async function audit(opts: { actorUserId?: string; targetUserId?: string; action: string; meta?: any }) {
  try {
    await prisma.auditLog.create({ data: { actorUserId: opts.actorUserId, targetUserId: opts.targetUserId, action: opts.action, meta: opts.meta } });
  } catch {}
}
