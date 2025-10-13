export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { roleLabel, type Role } from '@/lib/roles'
import { formatShortRU } from '@/lib/formatDate'
import UserActions from '@/components/admin/UserActions'

type Params = { params: { id: string } }

export default async function Page({ params }: Params) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      login: true,
      role: true,
      createdAt: true,
    },
  })
  if (!user) return notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Профиль пользователя</h1>
        <UserActions
          userId={user.id}
          initialBlocked={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Имя" value={user.name ?? '—'} />
        <Field label="Логин" value={user.login ?? '—'} />
        <Field label="Роль" value={roleLabel(user.role as Role)} />
        <Field label="Email" value={user.email ?? '—'} />
        <Field label="Создан" value={formatShortRU(user.createdAt)} />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm text-foreground-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  )
}
