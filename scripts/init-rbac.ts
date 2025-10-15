#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles = ['OWNER', 'PARTNER', 'POINT', 'EMPLOYEE', 'USER'];

const pages = [
  { name: 'Админка', path: '/admin' },
  { name: 'Профиль', path: '/profile' },
  { name: 'Подписки', path: '/pricing' },
  { name: 'Дашборд', path: '/dashboard' },
  { name: 'Владелец', path: '/owner' },
  { name: 'Партнер', path: '/partner' },
  { name: 'Точка', path: '/point' },
  { name: 'Сотрудник', path: '/employee' },
  { name: 'Здоровье', path: '/health' },
  { name: 'Блокировка', path: '/blocked' },
];

async function initRBAC() {
  console.log('🚀 Инициализация системы управления доступом...');
  
  try {
    // Создаем роли
    console.log('📝 Создание ролей...');
    for (const roleName of roles) {
      await prisma.accessRole.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
      console.log(`✅ Роль ${roleName} создана`);
    }

    // Создаем страницы
    console.log('📄 Создание страниц...');
    for (const page of pages) {
      await prisma.accessPage.upsert({
        where: { path: page.path },
        update: {},
        create: { name: page.name, path: page.path },
      });
      console.log(`✅ Страница ${page.name} (${page.path}) создана`);
    }

    // Получаем созданные роли и страницы
    const createdRoles = await prisma.accessRole.findMany();
    const createdPages = await prisma.accessPage.findMany();

    // Создаем базовые права доступа
    console.log('🔐 Настройка базовых прав доступа...');
    
    for (const page of createdPages) {
      for (const role of createdRoles) {
        let canAccess = false;
        
        // Логика доступа по умолчанию
        switch (role.name) {
          case 'OWNER':
            canAccess = true; // Владелец имеет доступ ко всему
            break;
          case 'PARTNER':
            canAccess = ['/admin', '/profile', '/pricing', '/dashboard', '/partner', '/health'].includes(page.path);
            break;
          case 'POINT':
            canAccess = ['/profile', '/pricing', '/dashboard', '/point', '/health'].includes(page.path);
            break;
          case 'EMPLOYEE':
            canAccess = ['/profile', '/dashboard', '/employee', '/health'].includes(page.path);
            break;
          case 'USER':
            canAccess = ['/profile', '/pricing', '/dashboard'].includes(page.path);
            break;
        }

        await prisma.accessRolePageAccess.upsert({
          where: {
            roleId_pageId: {
              roleId: role.id,
              pageId: page.id,
            },
          },
          update: { canAccess },
          create: {
            roleId: role.id,
            pageId: page.id,
            canAccess,
          },
        });
      }
    }

    console.log('🎉 Система управления доступом инициализирована!');
    
    // Выводим статистику
    const roleCount = await prisma.accessRole.count();
    const pageCount = await prisma.accessPage.count();
    const accessCount = await prisma.accessRolePageAccess.count();
    
    console.log(`📊 Статистика:`);
    console.log(`   - Ролей: ${roleCount}`);
    console.log(`   - Страниц: ${pageCount}`);
    console.log(`   - Правил доступа: ${accessCount}`);

  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initRBAC().catch(console.error);
