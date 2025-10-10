import { PrismaClient } from "@prisma/client";

export const runtime = 'nodejs';

const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  g.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  g.prisma = prisma;
}

export default prisma;



