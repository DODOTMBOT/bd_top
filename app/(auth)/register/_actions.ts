'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const RegisterSchema = z.object({
  login: z.string().min(3).max(32).regex(/^[a-zA-Z0-9._-]+$/, 'Логин может содержать только латинские буквы, цифры, точки, подчёркивания и дефисы'),
  email: z.string().email('Некорректный email').max(120),
  firstName: z.string().min(1, 'Имя обязательно').max(80),
  lastName: z.string().min(1, 'Фамилия обязательна').max(80),
  company: z.string().min(2, 'Название компании должно содержать минимум 2 символа').max(120),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов').max(72),
  confirm: z.string().min(8).max(72),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Пароли не совпадают' });

export async function registerAction(formData: FormData) {
  const data = {
    login: String(formData.get('login') ?? ''),
    email: String(formData.get('email') ?? ''),
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    company: String(formData.get('company') ?? ''),
    password: String(formData.get('password') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  };

  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { 
      ok: false, 
      error: 'Неверные данные', 
      issues: parsed.error.flatten().fieldErrors 
    };
  }

  try {
    // Проверяем уникальность логина и email
    const [existingLogin, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { login: parsed.data.login }, select: { id: true } }),
      prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } }),
    ]);

    if (existingLogin) {
      return { ok: false, error: 'Логин уже занят' };
    }
    if (existingEmail) {
      return { ok: false, error: 'Email уже используется' };
    }

    // Хешируем пароль
    const hash = await bcrypt.hash(parsed.data.password, 12);

    // Создаём пользователя PARTNER
    const user = await prisma.user.create({
      data: {
        login: parsed.data.login,
        email: parsed.data.email,
        name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
        passwordHash: hash,
        role: 'PARTNER',
      },
      select: { id: true },
    });

    // Создаём компанию и связываем с пользователем
    const partner = await prisma.partner.create({
      data: { 
        name: parsed.data.company, 
        ownerUserId: user.id 
      },
      select: { id: true },
    });

    // Обновляем пользователя, связывая с партнёром
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { partnerId: partner.id } 
    });

    return { ok: true };
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return { ok: false, error: 'Ошибка при создании аккаунта' };
  }
}
