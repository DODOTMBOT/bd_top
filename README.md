## ENV в dev

**⚠️ ВАЖНО:** В dev используем только `.env.local`; файлы `.env` и `.env.development` не применяются. При смене IP/БД — меняется только `.env.local`.

## ENV & миграции

**⚠️ ВАЖНО:** В dev используем `.env.local`; файл `.env` не должен содержать старых `DATABASE_URL` с устаревшими хостами/пользователями.

Создайте `.env.local` (для локальной разработки):

```env
DATABASE_URL="postgresql://gen_user:s%7CO3g%25FS_%7DtKgJ@5.129.193.208:5432/default_db?sslmode=require"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET=<32-64 символа, сгенерируйте через: openssl rand -base64 32>
```

Миграции:

- Dev: `npx prisma migrate dev -n "<change>"`
- Prod: `npx prisma migrate deploy`

Запрещено: `prisma migrate reset`, `prisma db push` по прод-данным.

## Смена провайдера БД

**История:** Проект изначально использовал SQLite для локальной разработки. Все старые миграции SQLite были удалены при переходе на PostgreSQL (кластер Timeweb).

**Текущий провайдер:** PostgreSQL  
**Старые миграции:** Удалены (несовместимы с PostgreSQL)  
**Новая история миграций:** Начинается с `init_postgres`

При первом запуске на новой БД выполните:
```bash
npm run db:push
# или
npm run prisma:deploy
```

## Диагностика подключения к БД

### Проверка TCP доступности:
```bash
nc -vz 5.129.193.208 5432
```

### Проверка через psql (если установлен):
```bash
psql "postgresql://gen_user:s|O3g%FS_}tKgJ@5.129.193.208:5432/default_db?sslmode=require" -c "SELECT version();"
```

### API Health-check:
```bash
curl http://localhost:3001/api/db/ping
```

**Примечание:** Если возникают проблемы с подключением, проверьте:
- Firewall правила (порт 5432 должен быть открыт для вашего IP)
- IP-адрес может быть ограничен маской /32 (только конкретный IP)
- SSL сертификаты и режим sslmode

## HoReCa SaaS — Starter

Minimal Next.js 15 (App Router, TypeScript) starter with TailwindCSS, ESLint, and Prettier. No DB or auth.

### Requirements
- Node.js LTS 20 (see `.nvmrc`)
- npm

### Getting Started
```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Scripts
- `dev`: start the dev server
- `build`: production build
- `start`: run the production server
- `lint`: run ESLint
- `typecheck`: run TypeScript type checking
- `format`: format with Prettier

```bash
npm run build
npm run start
npm run lint
npm run typecheck
npm run format
```

### Environment
Copy `.env.example` to `.env.local` and adjust values:

```bash
cp .env.example .env.local
```

Contents of `.env.example`:

```env
NEXT_PUBLIC_APP_NAME=HoReCa SaaS
```

## Database

For local development without an external DB, we temporarily use SQLite.

Env vars (in `.env.local`):

```env
# Для локальной разработки используйте PostgreSQL Timeweb (см. секцию ENV & миграции выше)
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=ChangeMe_123
```

### Local development without external DB

Commands:

```bash
npx prisma db push
npm run db:seed
npx prisma studio
```

DB health check endpoint:

```bash
curl http://localhost:3000/api/db-health
```

### Project Structure
- `app/`: App Router pages and API routes
- `components/`: UI components
- `lib/`: utilities and helpers
- `public/`: static assets
- `styles/`: global styles (Tailwind)

### Health Check
GET `http://localhost:3000/api/healthz` returns:

```json
{ "status": "ok" }
```


