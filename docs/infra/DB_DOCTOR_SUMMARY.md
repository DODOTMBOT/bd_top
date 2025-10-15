# Итоговая сводка: Автоматическая диагностика PostgreSQL

## ✅ Выполненные задачи

### 1. Создан скрипт-диагност `scripts/db-doctor.mjs`
- ✅ **TCP проверка** - доступность хоста и порта через `net.connect()`
- ✅ **TLS/SSL проверка** - поддержка `verify-full`, `require`, `disable`
- ✅ **SQL проверка** - выполнение тестового запроса
- ✅ **Детальный отчет** - конкретные причины проблем и решения
- ✅ **Цветной вывод** - наглядное отображение статусов

### 2. Обновлен `package.json`
- ✅ Добавлен скрипт `db:doctor`
- ✅ Установлены зависимости `pg@^8.12.0` и `dotenv@^16.4.5`
- ✅ Сохранен скрипт `db:ping` для Prisma

### 3. Настроена конфигурация Prisma
- ✅ `prisma/.env` копируется из `.env.local`
- ✅ `prisma/schema.prisma` настроен для PostgreSQL
- ✅ Поддержка `shadowDatabaseUrl`

### 4. Обновлена документация
- ✅ README.md с разделом "Диагностика БД"
- ✅ Инструкции по настройке SSL сертификатов
- ✅ Таблица режимов SSL
- ✅ Примеры SSH туннеля

### 5. Обновлен `.env.example`
- ✅ Добавлены поля `DB_SSL_ROOT_CERT` и `DB_TEST_QUERY`
- ✅ Примеры конфигурации для разных режимов

## 🔍 Функциональность диагностики

### Что проверяет `npm run db:doctor`:

1. **TCP подключение**
   - Доступность хоста и порта
   - Таймаут 5 секунд
   - Детальные ошибки (ECONNREFUSED, timeout)

2. **TLS/SSL подключение**
   - Поддержка `sslmode=verify-full` с CA сертификатом
   - Поддержка `sslmode=require` без проверки сертификата
   - Поддержка `sslmode=disable` без SSL
   - Диагностика ошибок handshake

3. **SQL запросы**
   - Выполнение тестового запроса (по умолчанию `select 1;`)
   - Измерение времени выполнения
   - Диагностика ошибок аутентификации

### Примеры вывода:

**Успешная диагностика:**
```
🔍 Диагностика подключения к PostgreSQL
==================================================
📋 DATABASE_URL: postgresql://user:***@host:5432/db?sslmode=require
📋 SSL Root Cert: /Users/user/.postgresql/root.crt
📋 Test Query: select 1;

🌐 Проверка TCP подключения...
✅ TCP: OK

🔒 Проверка TLS подключения...
✅ TLS: OK

💾 Проверка SQL запроса...
✅ SQL: OK (45 ms)

📊 Сводка:
✅ Все проверки пройдены успешно!
```

**Диагностика с проблемами:**
```
🔍 Диагностика подключения к PostgreSQL
==================================================
📋 DATABASE_URL: postgresql://user:***@host:5432/db?sslmode=verify-full
📋 SSL Root Cert: /Users/user/.postgresql/root.crt
📋 Test Query: select 1;

🌐 Проверка TCP подключения...
✅ TCP: OK

🔒 Проверка TLS подключения...
❌ TLS: FAIL (NO CA (ожидается DB_SSL_ROOT_CERT=...))

💾 Проверка SQL запроса...
❌ SQL: FAIL (Connection terminated unexpectedly)

📊 Сводка:
❌ Проблема: Отсутствует SSL сертификат
💡 Что делать:
   1. Положите CA в ~/.postgresql/root.crt: mkdir -p ~/.postgresql && cp root.crt ~/.postgresql/root.crt
   2. Переключите sslmode на require или disable
   3. Используйте SSH туннель с sslmode=disable
```

## 🚀 Использование

### Базовое использование:
```bash
# Запуск диагностики
npm run db:doctor

# Проверка через Prisma
npm run db:ping
```

### Настройка переменных окружения:
```env
# .env.local
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=verify-full"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/shadow_db?sslmode=verify-full"
DB_SSL_ROOT_CERT=~/.postgresql/root.crt
DB_TEST_QUERY=select 1;
```

### Режимы SSL:
- `verify-full` - полная проверка SSL + имя хоста
- `require` - SSL без проверки сертификата  
- `disable` - без SSL

## 🔧 Решение проблем

### Проблема: "Connection terminated unexpectedly"
**Причины:**
1. Неправильные учетные данные
2. База данных недоступна
3. Сетевые ограничения
4. Неправильные SSL настройки

**Решения:**
1. Проверьте учетные данные в панели управления
2. Используйте SSH туннель: `ssh -NT -L 5433:host:5432 user@bastion`
3. Переключите на `sslmode=disable` для туннеля
4. Используйте локальную PostgreSQL для разработки

### Проблема: "NO CA"
**Решение:**
```bash
mkdir -p ~/.postgresql
cp root.crt ~/.postgresql/root.crt
```

### Проблема: "HOSTNAME MISMATCH"
**Решение:**
1. Используйте правильный CA сертификат
2. Переключите на `sslmode=require`
3. Используйте SSH туннель

## 📋 Следующие шаги

1. **Получите реальный SSL сертификат** из панели Timeweb
2. **Проверьте учетные данные** в панели управления
3. **Настройте SSH туннель** если SSL не работает
4. **Используйте локальную PostgreSQL** для разработки

**Система диагностики готова к использованию!** 🎯

