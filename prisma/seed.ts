import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Seed base pages
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/owner', name: 'Owner' },
    { path: '/partner', name: 'Partner' },
    { path: '/point', name: 'Point' },
    { path: '/employee', name: 'Employee' },
  ];

  for (const p of pages) {
    await prisma.page.upsert({
      where: { path: p.path },
      update: { name: p.name },
      create: { path: p.path, name: p.name },
    });
  }

  // Seed role-page access matrix
  const allPages = await prisma.page.findMany();
  const pageByPath = Object.fromEntries(allPages.map((p) => [p.path, p]));

  // OWNER: canManage all
  for (const page of allPages) {
    await prisma.rolePageAccess.upsert({
      where: { role_pageId: { role: 'OWNER', pageId: page.id } },
      update: { canRead: true, canWrite: true, canManage: true },
      create: { role: 'OWNER', pageId: page.id, canRead: true, canWrite: true, canManage: true },
    });
  }

  // PARTNER: manage /partner, read /
  await prisma.rolePageAccess.upsert({
    where: { role_pageId: { role: 'PARTNER', pageId: pageByPath['/partner'].id } },
    update: { canRead: true, canWrite: true, canManage: true },
    create: { role: 'PARTNER', pageId: pageByPath['/partner'].id, canRead: true, canWrite: true, canManage: true },
  });
  await prisma.rolePageAccess.upsert({
    where: { role_pageId: { role: 'PARTNER', pageId: pageByPath['/'].id } },
    update: { canRead: true, canWrite: false, canManage: false },
    create: { role: 'PARTNER', pageId: pageByPath['/'].id, canRead: true, canWrite: false, canManage: false },
  });
  for (const p of ['/owner', '/point', '/employee']) {
    await prisma.rolePageAccess.upsert({
      where: { role_pageId: { role: 'PARTNER', pageId: pageByPath[p].id } },
      update: { canRead: true, canWrite: false, canManage: false },
      create: { role: 'PARTNER', pageId: pageByPath[p].id, canRead: true, canWrite: false, canManage: false },
    });
  }

  // POINT: manage /point, read /
  await prisma.rolePageAccess.upsert({
    where: { role_pageId: { role: 'POINT', pageId: pageByPath['/point'].id } },
    update: { canRead: true, canWrite: true, canManage: true },
    create: { role: 'POINT', pageId: pageByPath['/point'].id, canRead: true, canWrite: true, canManage: true },
  });
  await prisma.rolePageAccess.upsert({
    where: { role_pageId: { role: 'POINT', pageId: pageByPath['/'].id } },
    update: { canRead: true, canWrite: false, canManage: false },
    create: { role: 'POINT', pageId: pageByPath['/'].id, canRead: true, canWrite: false, canManage: false },
  });
  for (const p of ['/owner', '/partner', '/employee']) {
    await prisma.rolePageAccess.upsert({
      where: { role_pageId: { role: 'POINT', pageId: pageByPath[p].id } },
      update: { canRead: true, canWrite: false, canManage: false },
      create: { role: 'POINT', pageId: pageByPath[p].id, canRead: true, canWrite: false, canManage: false },
    });
  }

  // USER: read /employee and /
  for (const p of ['/', '/employee']) {
    await prisma.rolePageAccess.upsert({
      where: { role_pageId: { role: 'EMPLOYEE', pageId: pageByPath[p].id } },
      update: { canRead: true, canWrite: false, canManage: false },
      create: { role: 'EMPLOYEE', pageId: pageByPath[p].id, canRead: true, canWrite: false, canManage: false },
    });
  }
  for (const p of ['/owner', '/partner', '/point']) {
    await prisma.rolePageAccess.upsert({
      where: { role_pageId: { role: 'EMPLOYEE', pageId: pageByPath[p].id } },
      update: { canRead: false, canWrite: false, canManage: false },
      create: { role: 'EMPLOYEE', pageId: pageByPath[p].id, canRead: false, canWrite: false, canManage: false },
    });
  }

  // Seed admin OWNER if creds provided
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        role: 'OWNER',
        isActive: true,
      },
      create: {
        email: adminEmail,
        passwordHash,
        role: 'OWNER',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


