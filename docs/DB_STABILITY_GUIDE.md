# Руководство по стабильной работе PostgreSQL в Timeweb

## Обзор

Данное руководство содержит полную памятку по настройке и стабильной работе PostgreSQL в Timeweb Cloud с использованием Prisma ORM.

## 1. Переменные окружения

### Важные правила

- `.env` и `.env.local` **всегда должны быть одинаковыми**
- Пароль в URL **обязательно URL-кодируется**:
  - `(` → `%28`
  - `)` → `%29` 
  - `!` → `%21`
  - `*` → `%2A`

### Пример верных переменных окружения

```env
DATABASE_URL=postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=verify-full
SHADOW_DATABASE_URL=postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/shadow_db?sslmode=verify-full
NEXTAUTH_SECRET=8CPUprnvfj05QoU/mJo58+Ruy/H0ruB+SERFEvGH3Ho=
AUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost:3001
```

### Структура DATABASE_URL

```
postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=verify-full
```

## 2. SSL сертификат

### Создание сертификата (выполнить один раз)

```bash
mkdir -p ~/.cloud-certs
curl -o ~/.cloud-certs/root.crt https://st.timeweb.com/cloud-static/ca.crt
chmod 0600 ~/.cloud-certs/root.crt
```

### Проверка сертификата

```bash
ls -la ~/.cloud-certs/root.crt
# Должен показать файл с правами 600
```

## 3. Скрипты package.json

Добавить в `package.json` следующие скрипты:

```json
{
  "scripts": {
    "dev:3001": "kill-port 3001 || true && NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt next dev -p 3001",
    "db:test": "NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt node scripts/test-db.js",
    "db:migrate:deploy": "NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt prisma migrate deploy",
    "db:generate": "NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt prisma generate",
    "db:status": "NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt prisma migrate status"
  }
}
```

## 4. Скрипты проверки

### scripts/check-env.js

Создать файл `scripts/check-env.js`:

```javascript
const fs = require('fs');
const path = require('path');

function checkEnv() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Файл .env не найден');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Проверка DATABASE_URL
  if (!envContent.includes('DATABASE_URL=')) {
    console.error('❌ DATABASE_URL не найден в .env');
    process.exit(1);
  }
  
  // Проверка sslmode=verify-full
  if (!envContent.includes('sslmode=verify-full')) {
    console.error('❌ sslmode=verify-full не найден в DATABASE_URL');
    process.exit(1);
  }
  
  // Проверка на необработанные спецсимволы
  const specialChars = ['(', ')', '!', '*'];
  for (const char of specialChars) {
    if (envContent.includes(char) && !envContent.includes(encodeURIComponent(char))) {
      console.error(`❌ Найден необработанный спецсимвол: ${char}`);
      console.error('   Используйте URL-кодирование:', encodeURIComponent(char));
      process.exit(1);
    }
  }
  
  console.log('✅ .env файл корректен');
}

checkEnv();
```

### scripts/test-db.js

Создать файл `scripts/test-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DB] OK');
    process.exit(0);
  } catch (error) {
    console.error('[DB] FAIL');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
```

## 5. Миграции

### Важные правила

- **Всегда применяйте миграции через `migrate deploy`**
- **НЕ используйте `migrate dev` без прав CREATEDB**
- Используйте `migrate dev` только для локальной разработки с SQLite

### Команды миграций

```bash
# Генерация Prisma Client
npm run db:generate

# Проверка статуса миграций
npm run db:status

# Применение миграций (для продакшена)
npm run db:migrate:deploy

# Тест подключения к БД
npm run db:test
```

## 6. Настройка Timeweb

### Public Access

1. В панели Timeweb включить **Public access**
2. Разрешить ваш IPv4 адрес
3. Узнать ваш IP: `curl -4 https://api.ipify.org`
4. Порт 5432 должен быть открыт

### Проверка связи

```bash
# Проверка доступности хоста и порта
nc -vz 910e913fe01583491138102e.twc1.net 5432

# Ожидаемый результат:
# Connection to 910e913fe01583491138102e.twc1.net 5432 port [tcp/postgresql] succeeded!
```

## 7. Последовательность запуска

### Первоначальная настройка

```bash
# 1. Создать SSL сертификат
mkdir -p ~/.cloud-certs
curl -o ~/.cloud-certs/root.crt https://st.timeweb.com/cloud-static/ca.crt
chmod 0600 ~/.cloud-certs/root.crt

# 2. Проверить .env
node scripts/check-env.js

# 3. Проверить связь
nc -vz 910e913fe01583491138102e.twc1.net 5432

# 4. Сгенерировать Prisma Client
npm run db:generate

# 5. Проверить подключение к БД
npm run db:test

# 6. Применить миграции
npm run db:migrate:deploy

# 7. Запустить сервер
npm run dev:3001
```

### Ежедневная работа

```bash
# Запуск сервера
npm run dev:3001

# Проверка БД при проблемах
npm run db:test
```

## 8. Таблица ошибок Prisma

| Код ошибки | Описание | Причина | Решение |
|------------|----------|---------|---------|
| **P1000** | Authentication failed | Неверные учетные данные | Проверить username/password в DATABASE_URL |
| **P1001** | Can't reach database server | Сервер недоступен | Проверить хост, порт, сеть, firewall |
| **P1012** | Schema validation error | Неверная схема Prisma | Проверить prisma/schema.prisma |
| **P3014** | Migration failed | Ошибка миграции | Проверить SQL в миграции, откатить |
| **P3019** | Migration not found | Миграция не найдена | Выполнить `prisma migrate deploy` |

### Дополнительные ошибки

| Код ошибки | Описание | Причина | Решение |
|------------|----------|---------|---------|
| **P1002** | Database server closed connection | Таймаут соединения | Увеличить timeout в Prisma |
| **P1003** | Database does not exist | База данных не существует | Создать БД в Timeweb |
| **P1008** | Operations timed out | Операция превысила время ожидания | Оптимизировать запросы |
| **P1017** | Server has closed the connection | Сервер закрыл соединение | Проверить стабильность сети |

## 9. Отладка

### Логи Prisma

Добавить в `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Проверка переменных окружения

```bash
# Проверить загруженные переменные
node -e "console.log(process.env.DATABASE_URL)"

# Проверить SSL сертификат
echo $NODE_EXTRA_CA_CERTS
```

### Мониторинг соединений

```bash
# Проверить активные соединения к БД
npm run db:test

# Проверить статус миграций
npm run db:status
```

## 10. Резервное копирование

### Создание бэкапа

```bash
# Экспорт схемы
pg_dump -h 910e913fe01583491138102e.twc1.net -U gen_user -d default_db --schema-only > schema.sql

# Экспорт данных
pg_dump -h 910e913fe01583491138102e.twc1.net -U gen_user -d default_db --data-only > data.sql
```

## 11. Контакты и поддержка

- **Timeweb Support**: https://timeweb.com/support
- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

---

**Последнее обновление**: $(date)
**Версия**: 1.0

