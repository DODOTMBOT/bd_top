import { prisma } from '@/lib/db';
import type { Role, User } from '@prisma/client';

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createOwner(params: { email: string; passwordHash: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: 'OWNER' as Role } });
}

export async function createPartnerAccount(params: { email: string; passwordHash: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: 'PARTNER' as Role } });
}

export async function createPointAccount(params: { email: string; passwordHash: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: 'POINT' as Role } });
}

export async function createEmployee(params: { email: string; passwordHash: string; pointId: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: 'USER' as Role, pointId: params.pointId } });
}

export async function setActive(userId: string, isActive: boolean): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { isActive } });
}



