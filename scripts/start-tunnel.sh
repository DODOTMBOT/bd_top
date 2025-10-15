#!/bin/bash

echo "🚀 Запуск SSH туннеля для PostgreSQL..."

# Проверяем, не запущен ли уже туннель
if lsof -Pi :5433 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Туннель уже запущен на порту 5433"
    echo "Для остановки выполните: kill \$(lsof -ti:5433)"
    exit 1
fi

# Запускаем SSH туннель в фоновом режиме
echo "📡 Создаем туннель: localhost:5433 -> 910e913fe01583491138102e.twc1.net:5432"
ssh -NT -L 5433:910e913fe01583491138102e.twc1.net:5432 user@bastion-server &
TUNNEL_PID=$!

# Ждем немного для установки соединения
sleep 2

# Проверяем, что туннель запустился
if lsof -Pi :5433 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Туннель успешно запущен с PID: $TUNNEL_PID"
    echo "🔗 Локальный порт: 5433"
    echo "🎯 Удаленный хост: 910e913fe01583491138102e.twc1.net:5432"
    echo ""
    echo "Для остановки выполните:"
    echo "  kill $TUNNEL_PID"
    echo "  или"
    echo "  kill \$(lsof -ti:5433)"
    echo ""
    echo "Для тестирования подключения:"
    echo "  psql \"postgresql://gen_user:K2%285W_cQSHpplS@localhost:5433/default_db?sslmode=disable\" -c \"select 1;\""
else
    echo "❌ Не удалось запустить туннель"
    echo "Проверьте:"
    echo "  - Доступность SSH сервера"
    echo "  - Правильность учетных данных"
    echo "  - Сетевые ограничения"
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

