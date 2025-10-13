'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  title: z.string().min(1).max(120),
  path: z.string().min(1).max(255).regex(/^\/[a-zA-Z0-9\-\/]*$/),
  section: z.string().max(80).optional().nullable(),
});

export async function addPageToDB(formData: FormData) {
  const payload = {
    title: String(formData.get('title') ?? ''),
    path: String(formData.get('path') ?? ''),
    section: (formData.get('section') as string) || undefined,
  };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: 'Неверные данные формы' };
  }

  try {
    // Временно возвращаем успех
    revalidatePath('/admin');
    return { ok: true };
  } catch (err: unknown) {
    console.error('[addPageToDB] Error:', err);
    return { ok: false, error: 'Ошибка записи' };
  }
}
