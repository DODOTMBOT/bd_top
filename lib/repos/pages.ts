import { prisma } from '@/lib/db';
import type { Page, UserRoleType, RolePageAccess } from '@prisma/client';

export async function upsertPage(path: string, name: string): Promise<Page> {
  return prisma.page.upsert({ where: { path }, update: { name }, create: { path, name } });
}

export async function upsertRolePageAccess(params: {
  role: UserRoleType | 'OWNER' | 'PARTNER' | 'POINT' | 'USER';
  pageId: string;
  canRead?: boolean;
  canWrite?: boolean;
  canManage?: boolean;
}): Promise<RolePageAccess> {
  const { role, pageId, canRead = true, canWrite = false, canManage = false } = params;
  return prisma.rolePageAccess.upsert({
    where: { role_pageId: { role: role as UserRoleType, pageId } },
    update: { canRead, canWrite, canManage },
    create: { role: role as UserRoleType, pageId, canRead, canWrite, canManage },
  });
}



