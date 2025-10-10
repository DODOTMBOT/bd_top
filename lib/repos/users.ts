import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';
import { $Enums } from '@prisma/client';

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createOwner(params: { email: string; passwordHash: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: $Enums.UserRoleType.OWNER } });
}

export async function createPartnerAccount(params: { email: string; passwordHash: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: $Enums.UserRoleType.PARTNER } });
}

export async function createPointAccount(params: { email: string; passwordHash: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: $Enums.UserRoleType.POINT } });
}

export async function createEmployee(params: { email: string; passwordHash: string; pointId: string }): Promise<User> {
  return prisma.user.create({ data: { email: params.email, passwordHash: params.passwordHash, role: $Enums.UserRoleType.EMPLOYEE, pointId: params.pointId } });
}

export async function setActive(userId: string, isActive: boolean): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { isActive } });
}



