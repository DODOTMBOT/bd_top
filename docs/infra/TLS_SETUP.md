# Настройка TLS для PostgreSQL

## 1. Получение корневого сертификата Timeweb Cloud

### Способ 1: Через панель Timeweb
1. Войдите в панель управления Timeweb
2. Перейдите в раздел "SSL сертификаты" 
3. Найдите "CA цепочка" или "root.crt"
4. Скачайте файл сертификата

### Способ 2: Через API или документацию
```bash
# Попробуйте скачать с официального сайта
curl -o ~/.postgresql/root.crt https://timeweb.com/ssl/root.crt

# Или с другого источника
curl -o ~/.postgresql/root.crt https://timeweb.com/ca/root.crt
```

### Способ 3: Создание демонстрационного сертификата
```bash
# Создайте самоподписанный сертификат для тестирования
openssl req -x509 -newkey rsa:4096 -keyout ~/.postgresql/root.key -out ~/.postgresql/root.crt -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Timeweb/OU=IT/CN=timeweb.com"
```

## 2. Настройка переменных окружения

```bash
# Установите переменные окружения
export NODE_EXTRA_CA_CERTS=$HOME/.postgresql/root.crt
export SSL_CERT_FILE=$HOME/.postgresql/root.crt
export PGSSLROOTCERT=$HOME/.postgresql/root.crt

# Добавьте в ~/.bashrc или ~/.zshrc для постоянного использования
echo 'export NODE_EXTRA_CA_CERTS=$HOME/.postgresql/root.crt' >> ~/.bashrc
echo 'export SSL_CERT_FILE=$HOME/.postgresql/root.crt' >> ~/.bashrc
echo 'export PGSSLROOTCERT=$HOME/.postgresql/root.crt' >> ~/.bashrc
```

## 3. Тестирование подключения через psql

```bash
# Тест с полной верификацией SSL
psql "host=910e913fe01583491138102e.twc1.net port=5432 dbname=default_db user=gen_user sslmode=verify-full sslrootcert=$HOME/.postgresql/root.crt"

# Альтернативный синтаксис
psql "postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt"
```

## 4. Настройка Prisma

### Обновите prisma/.env:
```env
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/default_db?sslmode=verify-full"
SHADOW_DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@910e913fe01583491138102e.twc1.net:5432/shadow_db?sslmode=verify-full"
```

### Тестирование Prisma:
```bash
# Генерация клиента
npx prisma generate

# Тест подключения
echo "select 1;" | npx prisma db execute --stdin --schema prisma/schema.prisma
```

## 5. Альтернативное решение - SSH туннель

Если сертификат получить невозможно:

```bash
# Создайте SSH туннель
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 user@bastion-server

# Обновите prisma/.env:
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable"
SHADOW_DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/shadow_db?sslmode=disable"
```

## 6. Диагностика проблем

```bash
# Проверка сертификата
openssl x509 -in ~/.postgresql/root.crt -text -noout

# Проверка SSL соединения
openssl s_client -connect 910e913fe01583491138102e.twc1.net:5432 -starttls postgres

# Проверка переменных окружения
echo $NODE_EXTRA_CA_CERTS
echo $SSL_CERT_FILE
echo $PGSSLROOTCERT
```

## 7. Ожидаемые результаты

**Успешное подключение psql:**
```
psql (15.0)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

default_db=>
```

**Успешное подключение Prisma:**
```
✔ Generated Prisma Client (v6.17.1) to ./node_modules/@prisma/client in 64ms
1 row affected
```

