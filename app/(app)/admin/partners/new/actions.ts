"use server"

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type CreatePartnerResult = 
  | { ok: true }
  | { ok: false; message: string }

export async function createPartnerAction(formData: FormData): Promise<CreatePartnerResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { ok: false, message: 'Не авторизован' }
    }

    const name = formData.get('name') as string
    const accountId = formData.get('accountId') as string

    if (!name?.trim()) {
      return { ok: false, message: 'Введите название партнёра' }
    }

    if (!accountId) {
      return { ok: false, message: 'Выберите аккаунт' }
    }

    // Проверяем, что аккаунт существует
    const account = await prisma.user.findUnique({
      where: { id: accountId },
      select: { id: true, email: true, role: true }
    })

    if (!account) {
      return { ok: false, message: 'Аккаунт не найден' }
    }

    // Проверяем, что у этого аккаунта ещё нет партнёра
    const existingPartner = await prisma.partner.findUnique({
      where: { accountId }
    })

    if (existingPartner) {
      return { ok: false, message: 'У этого аккаунта уже есть партнёр' }
    }

    // Создаем партнёра
    await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          name: name.trim(),
          accountId
        }
      })

      // Обновляем роль пользователя на PARTNER и связываем с партнёром
      await tx.user.update({
        where: { id: accountId },
        data: {
          role: 'PARTNER',
          partnerId: partner.id
        }
      })
    })

    revalidatePath('/partner/points')
    revalidatePath('/admin/partners')

    return { ok: true }
  } catch (error: unknown) {
    console.error('[createPartnerAction] error:', error)
    return { ok: false, message: 'Ошибка при создании партнёра' }
  }
}

export async function getAvailableAccounts() {
  try {
    const accounts = await prisma.user.findMany({
      where: {
        role: { not: 'PARTNER' },
        partnerId: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      orderBy: { email: 'asc' }
    })

    return accounts
  } catch (error) {
    console.error('[getAvailableAccounts] error:', error)
    return []
  }
}
