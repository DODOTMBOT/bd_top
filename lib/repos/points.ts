import { prisma } from '@/lib/db';
import type { Point } from '@prisma/client';

export async function findById(id: string): Promise<Point | null> {
  return prisma.point.findUnique({ where: { id } });
}

export async function findByAccountId(accountId: string): Promise<Point | null> {
  return prisma.point.findUnique({ where: { accountId } });
}

export async function create(params: { name: string; partnerId: string; accountId: string }): Promise<Point> {
  return prisma.point.create({ data: { name: params.name, partnerId: params.partnerId, accountId: params.accountId } });
}



