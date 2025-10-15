# Настройка SSL для PostgreSQL

## Проблема
База данных PostgreSQL требует SSL сертификат для подключения с `sslmode=verify-full`.

## Решение

### 1. Получение корневого сертификата Timeweb Cloud

Скачайте корневой сертификат Timeweb Cloud и сохраните его:

```bash
# Создайте директорию для сертификатов
mkdir -p ~/.cloud-certs

# Скачайте корневой сертификат (замените URL на актуальный)
curl -o ~/.cloud-certs/root.crt https://timeweb.com/ssl/root.crt

# Или используйте другой источник сертификата
# wget -O ~/.cloud-certs/root.crt https://timeweb.com/ssl/root.crt
```

### 2. Настройка переменных окружения

```bash
export NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt
export SSL_CERT_FILE=$HOME/.cloud-certs/root.crt
export PGSSLROOTCERT=$HOME/.cloud-certs/root.crt
```

### 3. Обновление .env.local

Верните `sslmode=verify-full` в `.env.local`:

```env
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=verify-full"
SHADOW_DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/shadow_db?sslmode=verify-full"
```

### 4. Проверка подключения

```bash
# Через psql
psql "postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=verify-full&sslrootcert=$HOME/.cloud-certs/root.crt"

# Через Prisma
echo "select 1;" | npx prisma db execute --stdin --schema prisma/schema.prisma
```

### 5. Альтернативное решение

Если сертификат получить нельзя, используйте `sslmode=require`:

```env
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=require"
SHADOW_DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/shadow_db?sslmode=require"
```

## Проверка сетевого подключения

```bash
# Проверьте доступность хоста
ping 910e913fe01583491138102e.twc1.net

# Проверьте порт
telnet 910e913fe01583491138102e.twc1.net 5432

# Или используйте nc
nc -zv 910e913fe01583491138102e.twc1.net 5432
```

## Возможные проблемы

1. **Сетевые ограничения**: Файрвол или VPN блокирует подключение
2. **Неправильные учетные данные**: Проверьте логин и пароль
3. **SSL сертификат**: Требуется корневой сертификат Timeweb Cloud
4. **База данных недоступна**: Сервер может быть выключен или недоступен

