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

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev:3001

# Проверка типов
npm run typecheck

# Сборка
npm run build
```

## Технические детали

- **Next.js 14** с App Router
- **TypeScript** для типизации
- **Prisma** для работы с БД
- **NextAuth.js** для аутентификации
- **PostgreSQL** как основная БД
- **RBAC** система управления доступом