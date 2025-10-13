// scripts/init-health-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Инициализация тестовых данных для журнала здоровья...');

  // Найдем первого пользователя
  const user = await prisma.user.findFirst({
    where: { role: 'OWNER' }
  });

  if (!user) {
    console.log('Пользователь не найден');
    return;
  }

  console.log('Найден пользователь:', user.login);

  // Создадим партнера, если его нет
  let partner = await prisma.partner.findFirst({
    where: { ownerUserId: user.id }
  });

  if (!partner) {
    partner = await prisma.partner.create({
      data: {
        name: 'Тестовый партнер',
        ownerUserId: user.id
      }
    });
    console.log('Создан партнер:', partner.name);
  }

  // Создадим точку, если её нет
  let point = await prisma.point.findFirst({
    where: { partnerId: partner.id }
  });

  if (!point) {
    point = await prisma.point.create({
      data: {
        name: 'Тестовая точка',
        address: 'Тестовый адрес',
        partnerId: partner.id,
        userId: user.id
      }
    });
    console.log('Создана точка:', point.name);
  }

  // Обновим пользователя, чтобы у него был partnerId и pointId
  await prisma.user.update({
    where: { id: user.id },
    data: {
      partnerId: partner.id,
      pointId: point.id
    }
  });

  console.log('Пользователь обновлен с partnerId и pointId');

  // Создадим несколько тестовых сотрудников
  const employees = await prisma.user.findMany({
    where: { 
      role: 'USER',
      pointId: point.id
    }
  });

  if (employees.length === 0) {
    const employee1 = await prisma.user.create({
      data: {
        login: 'employee1',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        passwordHash: '$2a$10$dummy.hash.for.testing',
        role: 'USER',
        partnerId: partner.id,
        pointId: point.id
      }
    });

    const employee2 = await prisma.user.create({
      data: {
        login: 'employee2',
        name: 'Мария Сидорова',
        email: 'maria@example.com',
        passwordHash: '$2a$10$dummy.hash.for.testing',
        role: 'USER',
        partnerId: partner.id,
        pointId: point.id
      }
    });

    console.log('Созданы сотрудники:', employee1.name, employee2.name);
  }

  console.log('Инициализация завершена!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
