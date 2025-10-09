import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  currentPassword: z.string().min(1, 'Укажите текущий пароль'),
  newPassword: z.string().min(6, 'Минимум 6 символов').max(72),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Пароли не совпадают', path: ['confirm'] })

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function changePasswordAction(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) redirect('/login?cb=/me/change-password')

  let meId = (session.user as any).id as string | undefined
  const email = session.user.email as string | undefined
  if (!email) redirect('/')
  if (!meId) {
    const u = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (!u) redirect('/')
    meId = u.id
  }

  const parsed = schema.safeParse({
    currentPassword: String(formData.get('currentPassword') || ''),
    newPassword: String(formData.get('newPassword') || ''),
    confirm: String(formData.get('confirm') || ''),
  })
  if (!parsed.success) {
    redirect('/me/change-password?e=validation')
  }

  const user = await prisma.user.findUnique({ where: { id: meId }, select: { passwordHash: true } })
  if (!user) redirect('/')

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!ok) redirect('/me/change-password?e=invalid_current')

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({ where: { id: meId }, data: { passwordHash: newHash, mustChangePassword: false } })

  try {
    const { invalidateUserSessions } = await import('@/lib/sessions')
    await invalidateUserSessions(meId)
  } catch {}

  redirect('/')
}

export default async function ChangePasswordPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?cb=/me/change-password')

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Смена пароля</h1>
      <p className="text-sm opacity-70">Для продолжения работы необходимо сменить пароль.</p>

      <form action={changePasswordAction} className="max-w-md space-y-3 rounded border p-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Текущий пароль</label>
          <input name="currentPassword" type="password" required className="border rounded px-3 py-2" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Новый пароль</label>
          <input name="newPassword" type="password" minLength={6} required className="border rounded px-3 py-2" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Подтверждение</label>
          <input name="confirm" type="password" required className="border rounded px-3 py-2" />
        </div>
        <button className="inline-flex items-center rounded border px-3 py-1 text-sm hover:bg-gray-50">Сменить пароль</button>
      </form>
    </section>
  )
}
