import { PrismaClient } from '@prisma/client';
import { labelFromPath } from '../utils/format';

const prisma = new PrismaClient();

async function initPages() {
  try {
    console.log('Инициализация страниц...');

    // Создаем папку 'hidden'
    const hiddenFolder = await prisma.folder.upsert({
      where: { slug: 'hidden' },
      update: {},
      create: { name: 'Скрытые', slug: 'hidden', order: 0 },
    });

    console.log('Папка "Скрытые" создана:', hiddenFolder);

    // Создаем базовые страницы
    const pages = [
      { path: '/admin', order: 0 },
      { path: '/dashboard', order: 1 },
      { path: '/employee', order: 2 },
      { path: '/owner', order: 3 },
      { path: '/partner', order: 4 },
      { path: '/point', order: 5 },
    ];

    for (const pageData of pages) {
      const page = await prisma.page.upsert({
        where: { path: pageData.path },
        update: {},
        create: {
          label: labelFromPath(pageData.path),
          path: pageData.path,
          order: pageData.order,
          folderId: null,
          isHidden: false,
        },
      });
      console.log('Страница создана:', page);
    }

    console.log('Инициализация завершена!');
  } catch (error) {
    console.error('Ошибка инициализации:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initPages();
