import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (!u.passwordHash || u.passwordHash.trim().length === 0) {
      const passwordHash = await bcryptjs.hash('changeme123', 10);
      await prisma.user.update({ where: { id: u.id }, data: { passwordHash } });
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




