// scripts/init-partner.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Создание тестового партнера...');

  // Создаем пользователя с ролью PARTNER
  const partner = await prisma.user.create({
    data: {
      login: 'partner_test',
      name: 'Тестовый партнер',
      email: 'partner@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'PARTNER'
    }
  });

  console.log('Создан партнер:', partner.login);
  console.log('ID:', partner.id);
  console.log('Роль:', partner.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
