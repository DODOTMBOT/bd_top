# HoReCa SaaS — Frontend UI Setup

> **UI POLICY:** Используем **HeroUI v2.8.0**. Любые импорты из @nextui-org, shadcn/ui, radix/headlessui запрещены ESLint и pre-commit.

**UI Framework:** HeroUI v2.8.0  
**Tailwind:** enabled  
**Dark Mode:** class-based  
**Animation:** framer-motion  

## UI Guidelines

Все компоненты, страницы и layout создаются исключительно на HeroUI:  
```ts
import { Button, Input, Card, Table, Modal, Tabs } from "@heroui/react";
```

### ✅ Разрешено использовать:
- `@heroui/react` — основная UI библиотека
- `@heroui/system` — системные компоненты
- `@heroui/theme` — темизация
- `framer-motion` — анимации
- `tailwindcss` — только для layout, отступов и адаптивности

### ❌ Запрещено использовать:
- `@nextui-org/react`
- `@shadcn/ui`
- `@radix-ui/react-*`
- `@headlessui/react`

## Принципы разработки

1. **Tailwind** — только для позиционирования, отступов и адаптивности
2. **HeroUI компоненты** — для всей логики интерфейса
3. **Единообразие** — все UI элементы должны использовать HeroUI
4. **Темизация** — поддержка светлой/темной темы через HeroUI

## Структура проекта

```
app/
├── (auth)/          # Страницы аутентификации
├── admin/           # Админ панель
├── partner/         # Партнерский интерфейс
├── point/           # Интерфейс точки
├── employee/        # Интерфейс сотрудника
└── layout.tsx       # Основной layout с HeroUIProvider

components/
├── ui/              # UI компоненты на HeroUI
└── auth/            # Компоненты аутентификации
```

## 🚀 Быстрый старт

```bash
# Клонирование и установка
git clone <repository-url>
cd bd_top-2
npm install

# Запуск dev сервера (автоматически настроит .env.local)
npm run dev
```

**Что происходит автоматически:**
- Скрипт `bootstrap-env.mjs` восстанавливает `.env.local` из `.env.local.backup`
- Проверяет наличие всех обязательных переменных (`DATABASE_URL`, `SHADOW_DATABASE_URL`, `NEXTAUTH_SECRET`)
- Если обнаружен `sslmode=verify-full` без корневого CA, временно переключает на `sslmode=require`
- Проверяет подключение к базе данных
- Генерирует Prisma Client

**Доступные команды:**
```bash
npm run dev          # Запуск на порту 3001
npm run bootstrap    # Ручная настройка окружения
npm run db:ping      # Проверка подключения к БД
```

**Переключение между SQLite и PostgreSQL:**

Для **SQLite** (локальная разработка):
```bash
cp .env.local.backup.sqlite .env.local.backup
npm run bootstrap
```

Для **PostgreSQL** (продакшн):
```bash
cp .env.local.backup.postgresql .env.local.backup
npm run bootstrap
```

**Настройка SSL для PostgreSQL:**

Если база данных требует SSL сертификаты, следуйте инструкциям в `SSL_SETUP.md`:

1. Скачайте корневой сертификат Timeweb Cloud
2. Настройте переменные окружения:
   ```bash
   export NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt
   export SSL_CERT_FILE=$HOME/.cloud-certs/root.crt
   export PGSSLROOTCERT=$HOME/.cloud-certs/root.crt
   ```
3. Используйте `sslmode=verify-full` в DATABASE_URL

**Настройка TLS для PostgreSQL:**

Следуйте инструкциям в `TLS_SETUP.md` для настройки SSL сертификатов:

1. **Получите корневой сертификат Timeweb Cloud:**
   ```bash
   mkdir -p ~/.postgresql
   curl -o ~/.postgresql/root.crt https://timeweb.com/ssl/root.crt
   ```

2. **Настройте переменные окружения:**
   ```bash
   export NODE_EXTRA_CA_CERTS=$HOME/.postgresql/root.crt
   export SSL_CERT_FILE=$HOME/.postgresql/root.crt
   export PGSSLROOTCERT=$HOME/.postgresql/root.crt
   ```

3. **Протестируйте подключение:**
   ```bash
   psql "host=910e913fe01583491138102e.twc1.net port=5432 dbname=default_db user=gen_user sslmode=verify-full sslrootcert=$HOME/.postgresql/root.crt"
   ```

**Альтернативное решение - SSH туннель:**

Если SSL не работает, используйте SSH туннель (см. `SSH_TUNNEL_SETUP.md`):

```bash
# Запуск туннеля
./scripts/start-tunnel.sh

# Обновите prisma/.env для использования localhost:5433
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable"
```

## 🔍 Диагностика БД

### Автоматическая диагностика

```bash
# Запуск полной диагностики подключения
npm run db:doctor
```

**Что проверяет диагностика:**
- ✅ **TCP подключение** - доступность хоста и порта
- ✅ **TLS/SSL** - проверка сертификатов и handshake
- ✅ **SQL запросы** - выполнение тестового запроса
- ✅ **Детальный отчет** - конкретные причины проблем и решения

### Настройка SSL сертификатов

```bash
# Создайте директорию для сертификатов
mkdir -p ~/.postgresql

# Скопируйте корневой сертификат Timeweb Cloud
cp root.crt ~/.postgresql/root.crt

# Или скачайте с официального сайта
curl -o ~/.postgresql/root.crt https://timeweb.com/ssl/root.crt
```

### Настройка переменных окружения

Добавьте в `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=verify-full"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/shadow_db?sslmode=verify-full"
DB_SSL_ROOT_CERT=~/.postgresql/root.crt
DB_TEST_QUERY=select 1;
```

### Режимы SSL

| sslmode | Описание | Когда использовать |
|---------|----------|-------------------|
| `verify-full` | Полная проверка SSL + имя хоста | Продакшн с правильным CA |
| `require` | SSL без проверки сертификата | Временное решение |
| `disable` | Без SSL | SSH туннель или локальная БД |

### SSH туннель

Если SSL не работает, используйте SSH туннель:

```bash
# Создайте SSH туннель
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 user@bastion

# Обновите DATABASE_URL
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable"
```

### Ручная диагностика

```bash
# Проверка сетевого подключения
ping 910e913fe01583491138102e.twc1.net
nc -zv 910e913fe01583491138102e.twc1.net 5432

# Проверка через psql
psql "postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=require"

# Проверка через Prisma
npm run db:ping
```

## Технические детали

- **Next.js 14** с App Router
- **TypeScript** для типизации
- **Prisma** для работы с БД
- **NextAuth.js** для аутентификации
- **PostgreSQL** как основная БД
- **RBAC** система управления доступом
```bash
./scripts/init-dev.sh
```

---
# 🚀 Быстрый старт HoReCa SaaS

## Установка и запуск

```bash
git clone https://github.com/DODOTMBOT/bd_top.git
cd bd_top
npm install
npm run bootstrap
npm run dev
```

## Подключение к базе данных

База данных размещена в Timeweb Cloud и требует SSH-туннель для безопасного доступа.

Создайте туннель на своём сервере (VPS):

```bash
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 root@193.233.102.219
```

После этого приложение подключится к базе через `localhost:5433`.

## Проверка

Если всё корректно, вы увидите:

```
✅ .env.local готов
✅ Database connection OK
✅ Prisma Client сгенерирован
```

---

## Команды

- `npm run bootstrap` — проверка окружения и генерация Prisma Client  
- `npm run db:ping` — тестовое подключение к БД  
- `npm run dev` — запуск проекта на `http://localhost:3001`

