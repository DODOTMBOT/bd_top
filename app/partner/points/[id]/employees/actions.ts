'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { guardPointView } from '@/lib/access'

// --- helpers for login/password generation ---
// Cyrillic -> latin (coarse but enough for 3-letter prefix)
function translitCyrToLat(s: string) {
  const map: Record<string, string> = {
    а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i',
    й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t',
    у:'u', ф:'f', х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'',
    э:'e', ю:'yu', я:'ya'
  };
  return s.split('').map((ch) => {
    const low = ch.toLowerCase();
    const t = (map as any)[low];
    if (!t) return /[a-z0-9]/i.test(ch) ? ch : '';
    return ch === low ? t : t.toUpperCase();
  }).join('');
}

function prefix3FromPointName(name: string) {
  const t = translitCyrToLat(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  return (t || 'emp').slice(0, 3).padEnd(3, 'x');
}

function randomDigits(n: number) {
  const bytes = crypto.randomBytes(n);
  let s = '';
  for (let i = 0; i < n; i++) s += (bytes[i] % 10).toString();
  return s;
}

async function generateUniqueLocalPart(pointName: string) {
  const base = prefix3FromPointName(pointName);
  for (let i = 0; i < 40; i++) {
    const need = Math.max(2, 8 - base.length);
    const suffix = randomDigits(Math.min(5, need));
    const local = (base + suffix).slice(0, 8);
    const email = `${local}@app.local`;
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } })
      .catch(async () => null);
    if (!exists) return local;
  }
  return (base + randomDigits(5)).slice(0, 8);
}

function generatePassword8() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function createEmployeeAction(formData: FormData) {
  const pointId = String(formData.get('pointId') ?? '')
  if (!pointId) return { error: 'pointId is required' }

  const { point } = await guardPointView(pointId) // проверка OWNER/PARTNER/POINT и принадлежности

  const fullName = String(formData.get('fullName') ?? '').trim()
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase()
  const position = String(formData.get('position') ?? '').trim() // в текущей схеме не сохраняем
  if (!fullName) return { error: 'Укажите имя сотрудника' }

  let loginEmail = emailRaw
  if (!loginEmail) {
    const p = await prisma.point.findUnique({ where: { id: point.id }, select: { name: true } })
    const local = await generateUniqueLocalPart(p?.name || 'point')
    loginEmail = `${local}@app.local`
  }

  const existing = await prisma.user.findUnique({ where: { email: loginEmail }, select: { id: true } })
  if (existing) return { error: 'Пользователь с таким логином уже существует' }

  const password = generatePassword8()
  const passwordHash = await bcrypt.hash(password, 10)

  const created = await prisma.user.create({
    data: {
      email: loginEmail,
      name: fullName,
      passwordHash,
      mustChangePassword: true,
      role: 'EMPLOYEE',
      pointId: point.id,
    },
    select: { id: true, email: true },
  })

  // отдадим результат через httpOnly flash-cookie (base64url JSON)
  const payload = Buffer.from(
    JSON.stringify({ employeeId: created.id, login: created.email, password }),
    'utf8'
  ).toString('base64url')
  cookies().set('flash.empCreated', payload, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: `/partner/points/${pointId}/employees`,
    maxAge: 180,
  })

  // перенаправляем на промежуточный consume-роут, который уберёт cookie и проставит ?t
  revalidatePath(`/partner/points/${pointId}/employees`)
  redirect(`/partner/points/${pointId}/employees/consume`)
}

export async function ackEmpNotice() {
  cookies().set({ name: 'emp_notice', value: '', maxAge: 0, path: '/' })
  // локальная инвалидация
  revalidatePath('/partner/points')
}

export async function consumeEmpFlash() {
  'use server'
  cookies().delete('flash.empCreated')
}

// ===== Reset employee password (inline reveal) =====
type ResetState = { ok?: boolean; login?: string; password?: string; error?: string }

export async function resetEmployeePasswordAction(pointId: string, employeeId: string): Promise<ResetState> {
  const { point } = await guardPointView(pointId)

  const emp = await prisma.user.findUnique({
    where: { id: employeeId },
    select: { id: true, email: true, role: true, pointId: true },
  })
  if (!emp || emp.pointId !== point.id || emp.role !== 'EMPLOYEE') {
    return { error: 'Сотрудник не найден или не принадлежит этой точке' }
  }

  const newPassword = generatePassword8()
  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({ where: { id: emp.id }, data: { passwordHash, mustChangePassword: true } })

  // invalidate active sessions if using database sessions (best-effort)
  try {
    const { invalidateUserSessions } = await import('@/lib/sessions')
    await invalidateUserSessions(emp.id)
  } catch {}

  return { ok: true, login: emp.email, password: newPassword }
}

export async function resetEmployeePasswordFormAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  'use server'
  const pointId = String(formData.get('pointId') || '')
  const employeeId = String(formData.get('employeeId') || '')
  if (!pointId || !employeeId) return { error: 'Некорректные параметры' }
  return resetEmployeePasswordAction(pointId, employeeId)
}


