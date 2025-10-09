import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
  // Диагностика: показать хост БД при старте (только dev)
  try {
    const url = process.env.DATABASE_URL ?? "";
    const u = new URL(url);
    console.log(`[DB] Host: ${u.hostname}:${u.port} DB: ${u.pathname.slice(1)}`);
  } catch {
    console.log("[DB] Invalid DATABASE_URL");
  }
}

export async function isDbAvailable(timeoutMs = 1500): Promise<boolean> {
  try {
    const p = prisma.$queryRaw`SELECT 1`;
    const t = new Promise<boolean>((_, rej) => setTimeout(() => rej(new Error("DB_TIMEOUT")), timeoutMs));
    await Promise.race([p, t]);
    return true;
  } catch {
    return false;
  }
}

export function isDbInitError(e: unknown): boolean {
  return (
    e instanceof Error &&
    // @ts-ignore
    (e.name === "PrismaClientInitializationError" || (e as any)?.code === "P1001")
  );
}

export function isP1001(e: unknown): boolean {
  return (
    e instanceof Error &&
    // @ts-ignore
    (((e as any)?.code === "P1001") || ((e as any)?.name === "PrismaClientInitializationError"))
  );
}

export async function dbPing(timeoutMs = 1200): Promise<boolean> {
  try {
    const p = prisma.$queryRaw`SELECT 1`;
    const t = new Promise((_, rej) => setTimeout(() => rej(new Error("DB_TIMEOUT")), timeoutMs));
    await Promise.race([p, t]);
    return true;
  } catch {
    return false;
  }
}



