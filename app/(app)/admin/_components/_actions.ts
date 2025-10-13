'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const PlanSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  tagline: z.string().max(200).optional().nullable(),
  priceMonthlyCents: z.coerce.number().int().min(0),
  priceYearlyCents: z.coerce.number().int().min(0).optional().nullable(),
  defaultPeriod: z.enum(['month', 'year']).default('month'),
  popular: z.coerce.boolean().optional().default(false),
  badge: z.string().max(80).optional().nullable(),
  includedModules: z.array(z.string()).optional().default([]),
  limits: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).optional().default([]),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(100),
  isActive: z.coerce.boolean().optional().default(true),
});

export async function createPlan(input: unknown) {
  const parsed = PlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Неверные данные' };
  try {
    await prisma.subscriptionPlan.create({
      data: {
        ...parsed.data,
        includedModules: JSON.stringify(parsed.data.includedModules),
        limits: JSON.stringify(parsed.data.limits),
      },
    });
    revalidatePath('/admin');
    revalidateTag('pricing');
    revalidatePath('/pricing');
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
      ? 'Slug уже используется'
      : 'Ошибка записи';
    return { ok: false, error: msg };
  }
}

export async function updatePlan(input: unknown) {
  const parsed = PlanSchema.safeParse(input);
  if (!parsed.success || !parsed.data.id) return { ok: false, error: 'Неверные данные' };
  try {
    await prisma.subscriptionPlan.update({
      where: { id: parsed.data.id },
      data: {
        ...parsed.data,
        includedModules: JSON.stringify(parsed.data.includedModules),
        limits: JSON.stringify(parsed.data.limits),
      },
    });
    revalidatePath('/admin');
    revalidateTag('pricing');
    revalidatePath('/pricing');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Ошибка обновления' };
  }
}

export async function toggleActive(id: string, isActive: boolean) {
  if (!id) return { ok: false, error: 'Нет id' };
  try {
    await prisma.subscriptionPlan.update({ where: { id }, data: { isActive } });
    revalidatePath('/admin');
    revalidateTag('pricing');
    revalidatePath('/pricing');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Ошибка статуса' };
  }
}

export async function deletePlan(id: string) {
  if (!id) return { ok: false, error: 'Нет id' };
  try {
    await prisma.subscriptionPlan.delete({ where: { id } });
    revalidatePath('/admin');
    revalidateTag('pricing');
    revalidatePath('/pricing');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Ошибка удаления' };
  }
}
