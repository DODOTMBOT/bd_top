export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ensureSessionVersionColumn } from '@/lib/db/ensureSessionVersion'
import { sendTelegram } from '@/lib/telegram'

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  name: z.string().optional(),
  login: z.string().min(3, 'Логин должен содержать минимум 3 символа').optional(),
})

export async function POST(request: NextRequest) {
  try {
    await ensureSessionVersionColumn();
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    const { email, password, name, login } = validatedData
    const normalizedEmail = email.trim().toLowerCase()
    const userLogin = login || normalizedEmail.split('@')[0] // Используем email как логин если не указан

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: normalizedEmail },
          { login: userLogin }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email или логином уже существует' },
        { status: 409 }
      )
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10)

    // Создаем пользователя
    const newUser = await prisma.user.create({
      data: {
        login: userLogin,
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
        role: 'USER'
      },
      select: { id: true, login: true, email: true, name: true, role: true, createdAt: true }
    })

    console.log('User created:', { id: newUser.id, email: newUser.email })

    // Отправляем уведомление в Telegram
    sendTelegram(
      [
        `<b>🟢 Новый пользователь</b>`,
        `Имя: <b>${newUser.name || 'Не указано'}</b>`,
        `Логин: <code>${newUser.login}</code>`,
        `Email: <code>${newUser.email}</code>`,
        `Роль: <b>${newUser.role}</b>`,
        `ID: <code>${newUser.id}</code>`,
        `Создан: ${new Date(newUser.createdAt).toLocaleString('ru-RU')}`,
      ].join('\n')
    ).catch(console.error);

    return NextResponse.json(
      { ok: true },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
