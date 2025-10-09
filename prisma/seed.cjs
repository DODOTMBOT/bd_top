// CommonJS seed for local sqlite dev
const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/owner', name: 'Owner' },
    { path: '/partner', name: 'Partner' },
    { path: '/point', name: 'Point' },
    { path: '/employee', name: 'Employee' },
  ];

  for (const p of pages) {
    await prisma.page.upsert({ where: { path: p.path }, update: { name: p.name }, create: { path: p.path, name: p.name } });
  }

  const allPages = await prisma.page.findMany();
  const pageByPath = Object.fromEntries(allPages.map((p) => [p.path, p]));

  // OWNER manage all
  for (const page of allPages) {
    await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'OWNER', pageId: page.id } }, update: { canRead: true, canWrite: true, canManage: true }, create: { role: 'OWNER', pageId: page.id, canRead: true, canWrite: true, canManage: true } });
  }

  // PARTNER
  await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'PARTNER', pageId: pageByPath['/partner'].id } }, update: { canRead: true, canWrite: true, canManage: true }, create: { role: 'PARTNER', pageId: pageByPath['/partner'].id, canRead: true, canWrite: true, canManage: true } });
  await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'PARTNER', pageId: pageByPath['/'].id } }, update: { canRead: true, canWrite: false, canManage: false }, create: { role: 'PARTNER', pageId: pageByPath['/'].id, canRead: true, canWrite: false, canManage: false } });
  for (const p of ['/owner', '/point', '/employee']) {
    await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'PARTNER', pageId: pageByPath[p].id } }, update: { canRead: true, canWrite: false, canManage: false }, create: { role: 'PARTNER', pageId: pageByPath[p].id, canRead: true, canWrite: false, canManage: false } });
  }

  // POINT
  await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'POINT', pageId: pageByPath['/point'].id } }, update: { canRead: true, canWrite: true, canManage: true }, create: { role: 'POINT', pageId: pageByPath['/point'].id, canRead: true, canWrite: true, canManage: true } });
  await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'POINT', pageId: pageByPath['/'].id } }, update: { canRead: true, canWrite: false, canManage: false }, create: { role: 'POINT', pageId: pageByPath['/'].id, canRead: true, canWrite: false, canManage: false } });
  for (const p of ['/owner', '/partner', '/employee']) {
    await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'POINT', pageId: pageByPath[p].id } }, update: { canRead: true, canWrite: false, canManage: false }, create: { role: 'POINT', pageId: pageByPath[p].id, canRead: true, canWrite: false, canManage: false } });
  }

  // USER
  for (const p of ['/', '/employee']) {
    await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'USER', pageId: pageByPath[p].id } }, update: { canRead: true, canWrite: false, canManage: false }, create: { role: 'USER', pageId: pageByPath[p].id, canRead: true, canWrite: false, canManage: false } });
  }
  for (const p of ['/owner', '/partner', '/point']) {
    await prisma.rolePageAccess.upsert({ where: { role_pageId: { role: 'USER', pageId: pageByPath[p].id } }, update: { canRead: false, canWrite: false, canManage: false }, create: { role: 'USER', pageId: pageByPath[p].id, canRead: false, canWrite: false, canManage: false } });
  }

  // Ensure OWNER user exists. If passwordHash empty, set to hash('owner123', 10)
  if (adminEmail) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const passwordHash = await bcryptjs.hash('owner123', 10);
      await prisma.user.create({ data: { email: adminEmail, passwordHash, role: 'OWNER' } });
    } else if (!existing.passwordHash) {
      const passwordHash = await bcryptjs.hash('owner123', 10);
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash } });
    }
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


