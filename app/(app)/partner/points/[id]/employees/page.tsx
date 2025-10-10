import Link from 'next/link'
import { guardPointView } from '@/lib/access'
import { prisma } from '@/lib/db'
import { createEmployeeAction } from './actions'
import ResetPasswordButton from './ResetPasswordButton'
import SecretInline from '@/components/SecretInline'
import StripTOnMount from '@/components/StripTOnMount'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseSecret(t?: string) {
  if (!t) return null as null | { employeeId: string; login: string; password: string };
  try {
    const json = Buffer.from(t.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const data = JSON.parse(json)
    if (data?.employeeId && data?.login && data?.password) return data
    return null
  } catch {
    return null
  }
}

export default async function EmployeesPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ t?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { point } = await guardPointView(resolvedParams.id)

  const secret = parseSecret(resolvedSearchParams?.t)

  const employees = await prisma.user.findMany({
    where: { pointId: point.id, role: 'EMPLOYEE' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true },
    take: 20,
  })

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Сотрудники точки: {point.name}</h1>
        <Link href={`/partner/points/${point.id}`} className="text-sm underline">← Назад к точке</Link>
      </div>

      {secret && <StripTOnMount />}

      <form action={createEmployeeAction} className="rounded border border-divider p-4 space-y-3 bg-content1">
        <input type="hidden" name="pointId" value={point.id} />
        <div className="font-medium">Добавить сотрудника</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Имя и фамилия*</span>
            <input name="fullName" required className="border border-divider rounded px-3 py-2 bg-background text-foreground" placeholder="Иван Иванов" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Email (логин, не обязательно)</span>
            <input name="email" type="email" className="border border-divider rounded px-3 py-2 bg-background text-foreground" placeholder="user@example.com" />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm opacity-70">Должность (опционально)</span>
            <input name="position" className="border border-divider rounded px-3 py-2 bg-background text-foreground" placeholder="Бариста" />
          </label>
        </div>
        <button className="inline-flex items-center rounded border border-divider px-3 py-1 text-sm hover:bg-content2 bg-content1 text-foreground">Создать сотрудника</button>
      </form>

      <div className="rounded border border-divider bg-content1">
        <div className="px-4 py-3 font-medium border-b border-divider">Список сотрудников</div>
        <ul className="divide-y divide-divider">
          {employees.length === 0 ? (
            <li className="p-4 text-sm opacity-70">Пока нет сотрудников</li>
          ) : (
            employees.map((e) => (
              <li key={e.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{e.name || 'Без имени'}</div>
                    <div className="opacity-70">{e.email}</div>
                  </div>
                  <ResetPasswordButton pointId={resolvedParams.id} employeeId={e.id} login={e.email} />
                </div>
                {secret && secret.employeeId === e.id && (
                  <SecretInline login={secret.login} password={secret.password} />
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}


