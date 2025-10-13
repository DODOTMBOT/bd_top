'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ partnerId: z.string().min(10) });
const CreatePartner = z.object({
  name: z.string().min(2).max(120),
});

export async function impersonatePartner(formData: FormData) {
  const partnerId = String(formData.get('partnerId') ?? '');
  const parsed = schema.safeParse({ partnerId });
  if (!parsed.success) return { ok: false, error: 'bad partnerId' };

  // Проверяем существование партнёра
  const exists = await prisma.partner.findUnique({ 
    where: { id: parsed.data.partnerId }, 
    select: { id: true } 
  });
  if (!exists) return { ok: false, error: 'Партнёр не найден' };

  // HttpOnly cookie с ID партнёра
  const cookieStore = await cookies();
  cookieStore.set('impersonatePartnerId', parsed.data.partnerId, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', 
    path: '/', 
    maxAge: 60 * 60 * 2, // 2 часа
  });

  revalidatePath('/'); 
  revalidatePath('/admin/partners');
  return { ok: true };
}

export async function clearImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete('impersonatePartnerId');
  revalidatePath('/'); 
  revalidatePath('/admin/partners');
  return { ok: true };
}

export async function quickCreatePartner(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const parsed = CreatePartner.safeParse({ name });
  if (!parsed.success) return { ok: false, error: 'Некорректное имя' };

  try {
    const partner = await prisma.partner.create({
      data: { name: parsed.data.name }, // без точек/сотрудников — допускается
    });
    revalidatePath('/admin/partners');
    return { ok: true, id: partner.id };
  } catch (error) {
    return { ok: false, error: 'Ошибка создания партнёра' };
  }
}
