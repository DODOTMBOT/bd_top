import { prisma } from '@/lib/db';
import type { Partner } from '@prisma/client';

export async function findById(id: string): Promise<Partner | null> {
  return prisma.partner.findUnique({ where: { id } });
}

export async function findByAccountId(accountId: string): Promise<Partner | null> {
  return prisma.partner.findUnique({ where: { accountId } });
}

export async function create(params: { name: string; accountId: string }): Promise<Partner> {
  return prisma.partner.create({ data: { name: params.name, accountId: params.accountId } });
}



