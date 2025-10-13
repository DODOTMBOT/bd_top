# Система диалогов HeroUI

## Обзор

Единая система диалогов для замены нативных `window.alert`, `window.confirm`, `window.prompt` на красивые HeroUI модальные окна, которые всегда появляются строго по центру страницы.

## Компоненты

### DialogCenter.tsx
- **Контекст**: `DialogContext` для управления состоянием диалогов
- **Провайдер**: `DialogCenterProvider` для оборачивания приложения
- **Хук**: `useDialog()` для доступа к функциям диалогов

### lib/dialog.ts
- **Утилита**: `useAppDialog()` - удобный алиас для `useDialog()`

## Использование

### 1. Подключение в layout

```tsx
// app/providers.tsx
import { DialogCenterProvider } from "@/components/ui/DialogCenter";

export default function Providers({ children }) {
  return (
    <HeroUIProvider>
      <DialogCenterProvider>
        {children}
      </DialogCenterProvider>
    </HeroUIProvider>
  );
}
```

### 2. Использование в компонентах

```tsx
import { useAppDialog } from '@/lib/dialog'

function MyComponent() {
  const { confirm, alert, prompt } = useAppDialog()

  // Подтверждение
  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Подтверждение',
      message: 'Удалить элемент?',
      destructive: true,
      confirmText: 'Удалить',
    })
    if (ok) {
      // выполнить удаление
    }
  }

  // Уведомление
  const handleSuccess = async () => {
    await alert({
      title: 'Готово',
      message: 'Операция выполнена',
      variant: 'success'
    })
  }

  // Ввод текста
  const handleRename = async () => {
    const newName = await prompt({
      title: 'Переименовать',
      message: 'Введите новое название:',
      placeholder: 'Название',
      defaultValue: 'Текущее название'
    })
    if (newName) {
      // обновить название
    }
  }
}
```

## API

### confirm(options)
- **title**: Заголовок диалога
- **message**: Текст сообщения
- **confirmText**: Текст кнопки подтверждения
- **cancelText**: Текст кнопки отмены
- **confirmColor**: Цвет кнопки ('primary'|'success'|'danger'|'warning')
- **destructive**: Красная кнопка для опасных действий

### alert(options)
- **title**: Заголовок диалога
- **message**: Текст сообщения
- **variant**: Тип уведомления ('default'|'success'|'warning'|'danger'|'primary'|'secondary')
- **okText**: Текст кнопки ОК

### prompt(options)
- **title**: Заголовок диалога
- **message**: Текст сообщения
- **placeholder**: Плейсхолдер поля ввода
- **defaultValue**: Значение по умолчанию
- **confirmText**: Текст кнопки подтверждения
- **cancelText**: Текст кнопки отмены

## Особенности

- ✅ **Центрирование**: Все диалоги появляются строго по центру экрана
- ✅ **Блюр фона**: `backdrop="blur"` для красивого эффекта
- ✅ **Единый стиль**: Все диалоги используют HeroUI компоненты
- ✅ **Типизация**: Полная поддержка TypeScript
- ✅ **Доступность**: Правильные ARIA атрибуты
- ✅ **Асинхронность**: Все функции возвращают Promise

## Миграция с нативных диалогов

### Было:
```js
if (confirm('Удалить?')) {
  // действие
}
```

### Стало:
```tsx
const { confirm } = useAppDialog()
const ok = await confirm({ message: 'Удалить?' })
if (ok) {
  // действие
}
```
