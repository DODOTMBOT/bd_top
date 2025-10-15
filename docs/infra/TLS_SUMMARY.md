# Итоговая сводка: Настройка TLS для PostgreSQL

## ✅ Выполненные задачи

### 1. Создана структура для SSL сертификатов
- ✅ Создана директория `~/.postgresql/`
- ✅ Создан демонстрационный сертификат `~/.postgresql/root.crt`
- ✅ Настроены переменные окружения

### 2. Настроены переменные окружения
```bash
export NODE_EXTRA_CA_CERTS=$HOME/.postgresql/root.crt
export SSL_CERT_FILE=$HOME/.postgresql/root.crt
export PGSSLROOTCERT=$HOME/.postgresql/root.crt
```

### 3. Обновлена конфигурация Prisma
- ✅ `prisma/.env` настроен с `sslmode=verify-full`
- ✅ Prisma Client генерируется корректно
- ✅ Схема настроена для PostgreSQL

### 4. Созданы инструкции и скрипты
- ✅ `TLS_SETUP.md` - инструкции по настройке SSL
- ✅ `SSH_TUNNEL_SETUP.md` - альтернативное решение через туннель
- ✅ `scripts/start-tunnel.sh` - скрипт для SSH туннеля

## 🔍 Диагностика проблемы

**Проблема:** Сервер PostgreSQL закрывает соединение с ошибкой "server closed the connection unexpectedly"

**Возможные причины:**
1. **Неправильные SSL сертификаты** - нужен реальный сертификат Timeweb Cloud
2. **Неправильные учетные данные** - проверьте логин/пароль
3. **Сетевые ограничения** - файрвол или VPN блокирует подключение
4. **Настройки сервера** - сервер может требовать специфические SSL параметры

## 🚀 Решения

### Решение 1: Правильный SSL сертификат
```bash
# Получите реальный сертификат из панели Timeweb
curl -o ~/.postgresql/root.crt https://timeweb.com/ssl/root.crt

# Или скачайте из панели управления Timeweb
# SSL сертификаты → CA цепочка → root.crt
```

### Решение 2: SSH туннель
```bash
# Запустите SSH туннель
./scripts/start-tunnel.sh

# Обновите prisma/.env:
DATABASE_URL="postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable"
```

### Решение 3: Локальная PostgreSQL
```bash
# Установите PostgreSQL локально
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Создайте базы данных
createdb bd_top_dev
createdb bd_top_shadow
```

## 📋 Следующие шаги

1. **Получите реальный SSL сертификат** из панели Timeweb
2. **Проверьте учетные данные** в панели управления
3. **Настройте SSH туннель** если SSL не работает
4. **Используйте локальную PostgreSQL** для разработки

## 🎯 Ожидаемый результат

**Успешное подключение psql:**
```
psql (15.0)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
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

## 📞 Поддержка

Если проблема не решается:
1. Обратитесь в поддержку Timeweb для получения правильного SSL сертификата
2. Проверьте настройки базы данных в панели управления
3. Используйте SSH туннель как временное решение
4. Рассмотрите использование локальной PostgreSQL для разработки

