import { prisma } from '@/lib/prisma';

const OWNER_ROLE = 'owner';

export async function bootstrapOwnerIfNeeded(ownerEmails: string[]) {
  if (!ownerEmails.length) return;

  // роль owner
  let owner = await prisma.role.findUnique({ where: { key: 'OWNER' } });
  if (!owner) {
    owner = await prisma.role.create({
      data: { key: 'OWNER', name: 'Владелец', description: 'Full access' },
    });
  }

  // ресурс "всё"
  let all = await prisma.resource.findFirst({ where: { pattern: '*' } });
  if (!all) {
    all = await prisma.resource.create({
      data: { kind: 'feature', pattern: '*', name: 'Everything' },
    });
  }

  // grant owner -> *
  await prisma.roleGrant.upsert({
    where: { roleId_resourceId: { roleId: owner.id, resourceId: all.id } },
    create: { roleId: owner.id, resourceId: all.id, access: 'allow' },
    update: { access: 'allow' },
  });

  // назначить роль owner всем email из OWNER_EMAIL
  const users = await prisma.user.findMany({
    where: { email: { in: ownerEmails } },
    select: { id: true, email: true },
  });

  for (const u of users) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: u.id, roleId: owner.id } },
      create: { userId: u.id, roleId: owner.id },
      update: {},
    });
  }
}
