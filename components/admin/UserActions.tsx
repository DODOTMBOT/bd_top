'use client'

import { useRouter } from 'next/navigation'
import { Button, Tooltip } from '@heroui/react'
import { Lock, Unlock, KeyRound, Trash2 } from 'lucide-react'
import { useAppDialog } from '@/lib/dialog'
import { safeFetch } from '@/lib/safeFetch'

export default function UserActions({ userId, initialBlocked }: { userId: string; initialBlocked: boolean }) {
  const router = useRouter()
  const { confirm, alert, prompt } = useAppDialog()
  const isBlocked = initialBlocked
  // простая версия: после каждого действия обновляем страницу
  async function toggleBlock() {
    const ok = await confirm({
      title: isBlocked ? 'Разблокировать?' : 'Заблокировать?',
      message: isBlocked ? 'Снять блокировку пользователя?' : 'Заблокировать пользователя?',
      confirmText: isBlocked ? 'Разблокировать' : 'Заблокировать',
      confirmColor: isBlocked ? 'success' : 'warning',
    })
    if (!ok) return
    
    try {
      await safeFetch(`/api/admin/users/${userId}/block`, { method: 'PATCH' })
      router.refresh()
    } catch (e: any) {
      await alert({ title: 'Ошибка', message: e.message || 'BLOCK_FAILED', variant: 'danger' })
    }
  }

  async function resetPassword() {
    const p1 = await prompt({ title: 'Новый пароль', message: 'Минимум 8 символов', confirmText: 'Далее', placeholder: 'Пароль' })
    if (p1 === null) return
    if (!p1 || p1.length < 8) return alert({ title: 'Ошибка', message: 'Пароль слишком короткий', variant: 'danger' })
    const p2 = await prompt({ title: 'Подтверждение', message: 'Повторите пароль', confirmText: 'Сохранить', placeholder: 'Пароль ещё раз' })
    if (p2 === null) return
    if (p1 !== p2) return alert({ title: 'Ошибка', message: 'Пароли не совпадают', variant: 'danger' })
    
    try {
      await safeFetch(`/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: p1 }),
      })
      await alert({ title: 'Готово', message: 'Пароль обновлён', variant: 'success' })
    } catch (e: any) {
      await alert({ title: 'Ошибка', message: e.message || 'Не удалось сохранить пароль', variant: 'danger' })
    }
  }

  async function removeUser() {
    const ok = await confirm({ title: 'Удалить пользователя?', message: 'Действие необратимо', destructive: true, confirmText: 'Удалить' })
    if (!ok) return
    
    try {
      await safeFetch(`/api/admin/users/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [userId], action: 'delete' }),
      })
      router.push('/admin') // вернуться в список
    } catch (e: any) {
      await alert({ title: 'Ошибка', message: e.message || 'Не удалось удалить', variant: 'danger' })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip content={isBlocked ? 'Разблокировать' : 'Заблокировать'}>
        <Button isIconOnly size="sm" variant="flat" color={isBlocked ? 'success' : 'warning'} onPress={toggleBlock} aria-label="toggle-block">
          {isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </Button>
      </Tooltip>
      <Tooltip content="Сброс пароля">
        <Button isIconOnly size="sm" variant="flat" onPress={resetPassword} aria-label="reset-password">
          <KeyRound className="h-4 w-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Удалить">
        <Button isIconOnly size="sm" variant="flat" color="danger" onPress={removeUser} aria-label="delete-user">
          <Trash2 className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  )
}
