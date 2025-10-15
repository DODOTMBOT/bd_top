#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  { login: 'admin1', email: 'admin1@test.com', name: 'Админ 1', role: 'OWNER' },
  { login: 'partner1', email: 'partner1@test.com', name: 'Партнёр 1', role: 'PARTNER' },
  { login: 'partner2', email: 'partner2@test.com', name: 'Партнёр 2', role: 'PARTNER' },
  { login: 'point1', email: 'point1@test.com', name: 'Точка 1', role: 'POINT' },
  { login: 'point2', email: 'point2@test.com', name: 'Точка 2', role: 'POINT' },
  { login: 'employee1', email: 'employee1@test.com', name: 'Сотрудник 1', role: 'EMPLOYEE' },
  { login: 'employee2', email: 'employee2@test.com', name: 'Сотрудник 2', role: 'EMPLOYEE' },
  { login: 'user1', email: 'user1@test.com', name: 'Пользователь 1', role: 'USER' },
  { login: 'user2', email: 'user2@test.com', name: 'Пользователь 2', role: 'USER' },
  { login: 'user3', email: 'user3@test.com', name: 'Пользователь 3', role: 'USER' },
];

async function createTestUsers() {
  console.log('🚀 Создание тестовых пользователей...');
  
  const passwordHash = await bcrypt.hash('test123', 10);
  
  for (const userData of testUsers) {
    try {
      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findUnique({
        where: { login: userData.login }
      });
      
      if (existingUser) {
        console.log(`⚠️  Пользователь ${userData.login} уже существует, пропускаем`);
        continue;
      }
      
      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          login: userData.login,
          email: userData.email,
          name: userData.name,
          passwordHash,
          role: userData.role as any,
        },
        select: {
          id: true,
          login: true,
          name: true,
          role: true,
        }
      });
      
      console.log(`✅ Создан пользователь: ${user.login} (${user.name}) - ${user.role}`);
      
      // Если это партнёр, создаем запись Partner
      if (userData.role === 'PARTNER') {
        await prisma.partner.create({
          data: {
            name: `${userData.name} - Компания`,
            ownerUserId: user.id,
          }
        });
        console.log(`  📊 Создана компания для партнёра ${user.login}`);
      }
      
    } catch (error) {
      console.error(`❌ Ошибка при создании пользователя ${userData.login}:`, error);
    }
  }
  
  console.log('🎉 Генерация тестовых пользователей завершена!');
}

async function main() {
  try {
    await createTestUsers();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


