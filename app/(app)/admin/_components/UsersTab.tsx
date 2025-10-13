'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Tooltip, Button, Chip, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import { formatShortRU } from '@/lib/formatDate'
import { useAppDialog } from '@/lib/dialog'
import { ROLE_LABEL_RU, ROLES_ORDER, Role } from '@/lib/roles'
import { Check, X, KeyRound, Trash2, Lock, Unlock } from 'lucide-react'
import { safeFetch } from '@/lib/safeFetch'

// Константы ширин колонок
const COL = {
  name: 'min-w-[160px]',
  login: 'w-[140px]',
  role:  'w-[190px]',
  status:'w-[72px]',
  created:'w-[120px]',
  actions:'w-[128px]', // 3 иконки по ~36 + зазоры
} as const

// Role type теперь импортируется из lib/roles
type Status = 'active'|'blocked'
type UserRow = {
  id: string; email: string; name?: string|null; login?: string|null;
  role: Role; isBlocked: boolean; createdAt: string
}

async function toggleBlock(id: string) {
  const r = await fetch(`/api/admin/users/${id}/block`, { method: 'PATCH' })
  if (!r.ok) throw new Error('BLOCK_FAILED')
}

async function bulk(ids: string[], action: 'block'|'unblock'|'delete') {
  const r = await fetch(`/api/admin/users/bulk`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, action }),
  })
  if (!r.ok) throw new Error('BULK_FAILED')
}

export default function UsersTab() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL'|Role>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL'|Status>('ALL')
  const [isCreating, setIsCreating] = useState(false)
  const {isOpen, onOpen, onOpenChange} = useDisclosure()
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (open) {
      setError(null) // Очищаем ошибки при открытии
    }
  }
  const { confirm, alert, prompt } = useAppDialog()


  useEffect(() => {
    let abort = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`HTTP ${res.status}: ${text}`)
        }
        const data: UserRow[] = await res.json()
        if (!abort) setRows(data)
      } catch (e: any) {
        if (!abort) {
          setError(e?.message ?? 'Ошибка загрузки')
          setRows([])
        }
      } finally { 
        if (!abort) setLoading(false) 
      }
    })()
    return () => { abort = true }
  }, [])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (roleFilter !== 'ALL' && r.role !== roleFilter) return false
      const st: Status = r.isBlocked ? 'blocked' : 'active'
      if (statusFilter !== 'ALL' && st !== statusFilter) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        r.email?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.login?.toLowerCase().includes(q)
      )
    })
  }, [rows, roleFilter, statusFilter, query])


  async function onSingleBlock(id: string, isBlocked: boolean) {
    const ok = await confirm({
      title: isBlocked ? 'Разблокировать?' : 'Заблокировать?',
      message: isBlocked ? 'Снять блокировку пользователя?' : 'Заблокировать пользователя?',
      confirmText: isBlocked ? 'Разблокировать' : 'Заблокировать',
      confirmColor: isBlocked ? 'success' : 'warning'
    })
    if (!ok) return
    
    try {
      await safeFetch(`/api/admin/users/${id}/block`, { method: 'PATCH' })
      setRows(prev => prev.map(r => r.id === id ? { ...r, isBlocked: !r.isBlocked } : r))
      await alert({ 
        title: 'Готово', 
        message: isBlocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован', 
        variant: 'success' 
      })
    } catch (e: any) {
      await alert({ 
        title: 'Ошибка', 
        message: e.message || 'BLOCK_FAILED', 
        variant: 'danger' 
      })
    }
  }

  async function updateRole(id: string, role: Role) {
    await safeFetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    })
  }

  async function resetPassword(id: string) {
    // Модалка: два поля через prompt нельзя — используем confirm-цепочку из DialogCenter (или отдельный компонент).
    // Здесь — последовательный сбор двух значений через prompt.
    const pass1 = await prompt({
      title: 'Новый пароль',
      message: 'Введите новый пароль (минимум 8 символов)',
      confirmText: 'Далее',
      cancelText: 'Отмена',
      confirmColor: 'primary',
      placeholder: 'Введите пароль',
    })
    if (pass1 === null) return
    if (!pass1 || pass1.length < 8) { await alert({ title: 'Ошибка', message: 'Пароль слишком короткий', variant: 'danger' }); return }

    const pass2 = await prompt({
      title: 'Подтверждение пароля',
      message: 'Повторите пароль',
      confirmText: 'Сохранить',
      cancelText: 'Отмена',
      confirmColor: 'primary',
      placeholder: 'Повторите пароль',
    })
    if (pass2 === null) return
    if (pass1 !== pass2) { await alert({ title: 'Ошибка', message: 'Пароли не совпадают', variant: 'danger' }); return }

    const ok = await confirm({ title: 'Сохранить пароль?', message: 'Пароль будет немедленно изменён', confirmText: 'Сохранить' })
    if (!ok) return

    try {
      await safeFetch(`/api/admin/users/${id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pass1 })
      })
      await alert({ title: 'Готово', message: 'Пароль обновлён', variant: 'success' })
    } catch (e: any) {
      await alert({ title: 'Ошибка', message: e.message || 'Не удалось сохранить пароль', variant: 'danger' })
    }
  }

  async function onDeleteOne(id: string) {
    const ok = await confirm({
      title: 'Подтверждение',
      message: 'Удалить пользователя?',
      destructive: true,
      confirmText: 'Удалить',
    })
    if (!ok) return
    
    try {
      await safeFetch(`/api/admin/users/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'delete' })
      })
      setRows(prev => prev.filter(r => r.id !== id))
      await alert({ 
        title: 'Готово', 
        message: 'Пользователь удалён', 
        variant: 'success' 
      })
    } catch (e: any) {
      await alert({ 
        title: 'Ошибка', 
        message: e.message || 'Не удалось удалить', 
        variant: 'danger' 
      })
    }
  }


  async function createUser(formData: FormData) {
    setIsCreating(true)
    setError(null)
    try {
      const email = formData.get("email") as string;
      const name = formData.get("name") as string;
      const login = formData.get("login") as string;
      const role = formData.get("role") as Role;
      const password = formData.get("password") as string;

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email && email.trim() !== "" ? email : undefined, 
          name, 
          login, 
          role, 
          password 
        })
      });
      
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      
      // Обновляем список пользователей
      const newUsers = await fetch('/api/admin/users').then(r => r.json())
      setRows(newUsers)
      onOpenChange(false) // Закрываем модальное окно
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка создания пользователя')
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Загрузка…</div>
  if (error) return <div className="text-sm text-red-600">Ошибка: {error}</div>

  return (
    <div className="flex flex-col gap-4">
      {/* Верхняя панель */}
      <div className="flex flex-wrap items-center gap-3">
        <Input className="w-[320px]" placeholder="Поиск (email/имя/логин)" value={query} onValueChange={setQuery} />
        <Select className="w-[200px]" selectedKeys={[roleFilter]} onSelectionChange={(k)=>setRoleFilter(Array.from(k)[0] as any)}>
          <SelectItem key="ALL">Все роли</SelectItem>
          <SelectItem key="OWNER">{ROLE_LABEL_RU.OWNER}</SelectItem>
          <SelectItem key="PARTNER">{ROLE_LABEL_RU.PARTNER}</SelectItem>
          <SelectItem key="POINT">{ROLE_LABEL_RU.POINT}</SelectItem>
          <SelectItem key="USER">{ROLE_LABEL_RU.USER}</SelectItem>
        </Select>
        <Select className="w-[200px]" selectedKeys={[statusFilter]} onSelectionChange={(k)=>setStatusFilter(Array.from(k)[0] as any)}>
          <SelectItem key="ALL">Все статусы</SelectItem>
          <SelectItem key="active">Активен</SelectItem>
          <SelectItem key="blocked">Заблокирован</SelectItem>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button color="primary" onPress={onOpen}>Создать пользователя</Button>
                  </div>
                </div>

      <div className="flex gap-6 text-sm text-foreground-500">
        <div>Всего: {rows.length}</div>
        <div>Активных: {rows.filter(r => !r.isBlocked).length}</div>
        <div>Заблокированных: {rows.filter(r => r.isBlocked).length}</div>
      </div>

      {/* ТАБЛИЦА СО ВСТРОЕННЫМИ ЧЕКБОКСАМИ */}
      <Table
        aria-label="Список пользователей"
        removeWrapper
        isStriped
      >
        <TableHeader>
          <TableColumn className={`${COL.name} whitespace-nowrap`}>Имя</TableColumn>
          <TableColumn className={`${COL.login} whitespace-nowrap`}>Логин</TableColumn>
          <TableColumn className={`${COL.role} whitespace-nowrap`}>Роль</TableColumn>
          <TableColumn className={`${COL.status} whitespace-nowrap`}>Статус</TableColumn>
          <TableColumn className={`${COL.created} whitespace-nowrap`}>Создан</TableColumn>
          <TableColumn className={`${COL.actions} whitespace-nowrap`}>Действия</TableColumn>
        </TableHeader>
        <TableBody isLoading={loading} emptyContent="Нет данных" items={filtered}>
          {(item: UserRow) => (
            <TableRow key={item.id}>
              {/* Имя */}
              <TableCell className={`${COL.name} truncate`} title={item.name ?? '—'}>
                {item.name ?? '—'}
              </TableCell>

              {/* ЛОГИН → ссылка в профиль */}
              <TableCell className={`${COL.login} truncate`}>
                <Link href={`/admin/users/${item.id}`} className="text-primary underline-offset-2 hover:underline">
                  {item.login ?? '—'}
                </Link>
              </TableCell>

              {/* Роль (Select, как ранее) */}
              <TableCell className={COL.role}>
                <Select
                  size="sm"
                  selectedKeys={[item.role]}
                  onSelectionChange={async (keys) => {
                    const next = Array.from(keys)[0] as Role
                    if (next === item.role) return
                    // оптимистично
                    setRows(prev => prev.map(r => r.id === item.id ? { ...r, role: next } : r))
                    try {
                      await updateRole(item.id, next)
                    } catch {
                      // откат
                      setRows(prev => prev.map(r => r.id === item.id ? { ...r, role: item.role } : r))
                      await alert({ title: 'Ошибка', message: 'Не удалось сменить роль', variant: 'danger' })
                    }
                  }}
                  className="w-full"
                  classNames={{ trigger: 'h-9 w-full', value: 'truncate', base: 'w-full' }}
                  popoverProps={{ placement: 'bottom-start' }}
                  aria-label="Смена роли"
                >
                  {ROLES_ORDER.map(r => (
                    <SelectItem key={r}>{ROLE_LABEL_RU[r]}</SelectItem>
                  ))}
                </Select>
              </TableCell>

              {/* Компактный статус с иконкой */}
              <TableCell className={`${COL.status} whitespace-nowrap`}>
                {item.isBlocked ? (
                  <Chip className="h-6 px-2" color="warning" variant="flat"><X className="h-4 w-4" /></Chip>
                ) : (
                  <Chip className="h-6 px-2" color="success" variant="flat"><Check className="h-4 w-4" /></Chip>
                )}
              </TableCell>

              {/* Дата */}
              <TableCell className={`${COL.created} whitespace-nowrap`}>{formatShortRU(item.createdAt)}</TableCell>

              {/* ДЕЙСТВИЯ → иконки */}
              <TableCell className={COL.actions}>
                <div className="flex items-center gap-2">
                  <Tooltip content={item.isBlocked ? 'Разблокировать' : 'Заблокировать'} placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color={item.isBlocked ? 'success' : 'warning'}
                      onPress={() => onSingleBlock(item.id, item.isBlocked)}
                      aria-label={item.isBlocked ? 'Разблокировать' : 'Блокировать'}
                    >
                      {item.isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </Tooltip>

                  <Tooltip content="Сброс пароля" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => resetPassword(item.id)}
                      aria-label="Сброс пароля"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Удалить" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => onDeleteOne(item.id)}
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Модальное окно создания пользователя */}
      <Modal isOpen={isOpen} onOpenChange={handleOpenChange} size="md" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Создать нового пользователя</h3>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await createUser(formData);
                }} className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Введите email (необязательно)"
                    variant="bordered"
                    size="md"
                  />
                  <Input
                    name="name"
                    type="text"
                    label="Имя"
                    placeholder="Введите имя"
                    variant="bordered"
                    size="md"
                  />
                  <Input
                    name="login"
                    type="text"
                    label="Логин"
                    placeholder="Введите логин"
                    variant="bordered"
                    size="md"
                    isRequired
                  />
                  <Select
                    name="role"
                    label="Роль"
                    placeholder="Выберите роль"
                    variant="bordered"
                    size="md"
                    isRequired
                  >
                    <SelectItem key="OWNER" value="OWNER">{ROLE_LABEL_RU.OWNER}</SelectItem>
                    <SelectItem key="PARTNER" value="PARTNER">{ROLE_LABEL_RU.PARTNER}</SelectItem>
                    <SelectItem key="POINT" value="POINT">{ROLE_LABEL_RU.POINT}</SelectItem>
                    <SelectItem key="USER" value="USER">{ROLE_LABEL_RU.USER}</SelectItem>
                  </Select>
                  <Input
                    name="password"
                    type="password"
                    label="Пароль"
                    placeholder="Введите пароль"
                    variant="bordered"
                    size="md"
                    isRequired
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button color="danger" variant="light" onPress={onClose}>
                      Отмена
                    </Button>
                    <Button color="primary" type="submit" isLoading={isCreating}>
                      {isCreating ? 'Создание...' : 'Создать'}
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}