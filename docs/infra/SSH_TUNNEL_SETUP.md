# Настройка SSH туннеля для PostgreSQL

## Проблема
База данных PostgreSQL недоступна напрямую из-за:
- Неправильных SSL сертификатов
- Сетевых ограничений
- Неправильных учетных данных

## Решение: SSH туннель

### 1. Создание SSH туннеля

```bash
# Создайте SSH туннель на локальный порт 5433
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 user@bastion-server

# Или через промежуточный сервер
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 -J user@bastion-server user@target-server
```

### 2. Настройка Prisma для туннеля

Обновите `prisma/.env`:
```env
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable"
SHADOW_DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/shadow_db?sslmode=disable"
NEXTAUTH_SECRET="8CPUprnvfj05QoU/mJo58+Ruy/H0ruB+SERFEvGH3Ho="
NEXTAUTH_URL="http://localhost:3001"
NODE_ENV="development"
```

### 3. Тестирование через туннель

```bash
# Тест подключения через туннель
psql "postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable" -c "select 1;"

# Тест через Prisma
echo "select 1;" | npx prisma db execute --stdin --schema prisma/schema.prisma
```

### 4. Автоматизация туннеля

Создайте скрипт `scripts/start-tunnel.sh`:
```bash
#!/bin/bash
echo "Запуск SSH туннеля для PostgreSQL..."
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 user@bastion-server &
TUNNEL_PID=$!
echo "Туннель запущен с PID: $TUNNEL_PID"
echo "Для остановки выполните: kill $TUNNEL_PID"
```

### 5. Альтернативные решения

#### Вариант A: Локальная PostgreSQL
```bash
# Установите PostgreSQL локально
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Создайте локальную базу
createdb bd_top_dev
createdb bd_top_shadow

# Обновите prisma/.env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/bd_top_dev?sslmode=disable"
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/bd_top_shadow?sslmode=disable"
```

#### Вариант B: Docker PostgreSQL
```bash
# Запустите PostgreSQL в Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bd_top_dev -p 5432:5432 -d postgres:15

# Обновите prisma/.env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/bd_top_dev?sslmode=disable"
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/bd_top_shadow?sslmode=disable"
```

### 6. Проверка подключения

```bash
# Проверка туннеля
netstat -an | grep 5433

# Проверка подключения
psql "postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable" -c "select version();"

# Проверка через Prisma
npx prisma generate
echo "select 1;" | npx prisma db execute --stdin --schema prisma/schema.prisma
```

## Ожидаемые результаты

**Успешное подключение:**
```
psql (15.0)
Type "help" for help.

default_db=> select 1;
 ?column? 
----------
        1
(1 row)
```

**Успешное подключение Prisma:**
```
✔ Generated Prisma Client (v6.17.1) to ./node_modules/@prisma/client in 64ms
1 row affected
```

