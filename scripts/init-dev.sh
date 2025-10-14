#!/usr/bin/env bash
set -euo pipefail

# 1. Копирование .env.local
if [ ! -f .env.local ]; then
  echo "📄 Копирую .env.local.example → .env.local"
  cp .env.local.example .env.local
else
  echo "✅ .env.local уже существует"
fi

# 2. Запуск SSH-туннеля в фоне
echo "🔗 Подключаю SSH-туннель на localhost:5433"
ssh -fNT -L 5433:910e913fe01583491138102e.twc1.net:5432 horeca-db-tunnel

# 3. Проверка подключения к БД
echo "🔍 Проверка соединения с базой..."
npx prisma db pull

# 4. Запуск dev-сервера
echo "🚀 Запускаю приложение"
npm run dev
