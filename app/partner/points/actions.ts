"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePartnerFromSession } from "@/lib/partner";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export type Result = { ok: true } | { ok: false; message: string };

function sanitize(s: unknown) {
  return (typeof s === 'string' ? s.trim() : '') || ''
}

export async function createPointAction(fd: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PARTNER') {
    return { ok: false, message: 'Нет доступа' };
  }

  const partner = await requirePartnerFromSession();

  const name = sanitize(fd.get('name'));
  let login = sanitize(fd.get('login')).toLowerCase();
  const password = sanitize(fd.get('password'));
  // email убрали из формы; оставим совместимость и игнорируем, если придёт
  const emailRaw = sanitize(fd.get('email')).toLowerCase();
  let email: string | null = emailRaw.length ? emailRaw : null;
  const address = (sanitize(fd.get('address')) || '') as string;

  if (!name) return { ok: false, message: 'Введите название точки' };
  if (!login) return { ok: false, message: 'Введите логин' };

  // Разрешаем ввод email в поле логина: переносим его в email, а логин нормализуем из local-part
  if (login.includes('@') && !email) {
    email = login;
    const local = login.split('@')[0] || 'point';
    // нормализуем login: только a-z0-9._-
    let norm = local.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
    if (norm.length < 3) norm = `${norm || 'pnt'}-${randomBytes(2).toString('hex')}`;
    login = norm;
  }

  if (login.length < 3) return { ok: false, message: 'Логин слишком короткий' };
  if (!/^[a-zA-Z0-9._-]+$/.test(login)) return { ok: false, message: 'Допустимы буквы/цифры/._- или email' };
  if (password.length < 6) return { ok: false, message: 'Минимум 6 символов в пароле' };

  try {
    const passwordHash = await hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.user.findFirst({
        where: { OR: [ { login }, email ? { email } : undefined ].filter(Boolean) as any },
        select: { id: true, login: true, email: true },
      });
      if (exists) {
        throw Object.assign(new Error('UNIQUE'), { code: 'P2002', meta: { target: exists.login === login ? 'login' : 'email' } });
      }

      const pointAccount = await tx.user.create({
        data: {
          login,
          email: email || undefined,
          role: 'POINT',
          passwordHash,
          mustChangePassword: false,
        },
        select: { id: true },
      });

      const point = await tx.point.create({
        data: {
          name,
          address: address || null,
          partnerId: partner.id,
          accountId: pointAccount.id,
        },
      });
      return { pointId: point.id };
    });

    revalidatePath('/partner/points');
    // Положим одноразовый секрет на 60 сек, чтобы можно было скопировать пароль для свежесозданной точки
    try {
      cookies().set('point.oneTime', JSON.stringify({ pointId: result.pointId, password }), { httpOnly: true, sameSite: 'lax', path: '/partner/points', maxAge: 60 });
    } catch {}
    return { ok: true };
  } catch (e: any) {
    console.error('[createPointAction] error:', e?.code, e?.meta, e?.message)
    if (e?.code === 'P2002') {
      const t = e?.meta?.target || 'поле';
      return { ok: false, message: `Значение ${t} уже занято` };
    }
    if (e?.code === 'P2003') return { ok: false, message: 'Нарушение внешнего ключа (партнёр или аккаунт не найден)' };
    if (e?.code === 'P2014') return { ok: false, message: 'Неверные связи (relation violation)' };
    if (e?.code === 'P2025') return { ok: false, message: 'Запись не найдена при создании связи' };
    return { ok: false, message: e?.message || 'Не удалось создать точку' };
  }
}

export async function listPointsAction() {
  const partner = await requirePartnerFromSession();
  const points = await prisma.point.findMany({
    where: { partnerId: partner.id },
    select: {
      id: true,
      name: true,
      address: true,
      account: { select: { login: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  // нормализуем структуру под таблицу
  return {
    points: points.map((p) => ({ 
      id: p.id, 
      name: p.name, 
      login: p.account?.login ?? '', 
      address: p.address ?? '',
      createdAt: p.createdAt
    })),
  };
}


