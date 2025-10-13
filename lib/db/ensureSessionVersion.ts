import { prisma } from "@/lib/prisma";

let ensured = false;

/** Гарантирует наличие столбца "sessionVersion" в таблице "User" для текущего подключения. */
export async function ensureSessionVersionColumn(): Promise<void> {
  if (ensured) return;
  try {
    // Проверка через information_schema (Postgres) — не упадём на SQLite
    const rows: any[] = await prisma
      .$queryRawUnsafe(
        `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'sessionVersion'
    `
      )
      .catch(() => [] as any[]);

    if (Array.isArray(rows) && rows.length > 0) {
      ensured = true;
      return;
    }

    // Попытка PG
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 0;`
      );
      ensured = true;
      return;
    } catch (_) {
      // ignore, попробуем SQLite
    }

    // Попытка SQLite: PRAGMA + ALTER TABLE (без IF NOT EXISTS — защищаемся ручной проверкой)
    const pragma: any[] = await prisma.$queryRawUnsafe(`PRAGMA table_info("User");`).catch(() => [] as any[]);
    const has = Array.isArray(pragma) && pragma.some((c: any) => c?.name === "sessionVersion");
    if (!has) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;`
      );
    }
    ensured = true;
  } catch (e) {
    // не падаем — пусть API вернёт понятную ошибку
    console.error("ensureSessionVersionColumn failed:", e);
  }
}


