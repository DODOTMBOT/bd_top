import { PrismaClient } from "@prisma/client";
const g = global as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

// Экспорты для совместимости
export const dbPing = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

export const isP1001 = (error: any) => {
  return error?.code === 'P1001';
};