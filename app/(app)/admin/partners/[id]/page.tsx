import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import ImpersonationBanner from '../_impersonation-banner';
import { roleLabel } from '@/lib/roles';

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PartnerDetailPageProps {
  params: { id: string };
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  noStore();

  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }

  // Загружаем партнёра с деталями
  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { points: true } },
      points: { 
        include: {
          _count: { select: { employees: true } },
          employees: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
  });

  if (!partner) {
    notFound();
  }

  const cookieStore = await cookies();
  const impersonatedPartnerId = cookieStore.get('impersonatePartnerId')?.value;
  const isImpersonated = impersonatedPartnerId === partner.id;

  // Суммируем сотрудников
  const totalEmployees = partner.points?.reduce((acc, pt) => acc + (pt._count?.employees ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <ImpersonationBanner />
      
      {isImpersonated && (
        <div className="rounded-xl border bg-amber-50 text-amber-900 px-4 py-2 text-sm">
          ⚠️ Вы находитесь в режиме партнёра: <span className="font-medium">{partner.name}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{partner.name}</h1>
          <p className="text-muted-foreground">
            Создан {new Date(partner.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <a
          href="/admin/partners"
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          ← Назад к списку
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">ID:</span>
              <div className="font-mono text-sm">{partner.id}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Название:</span>
              <div className="font-medium">{partner.name}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Аккаунт:</span>
              <div className="text-sm">{partner.user?.name || partner.user?.email || '—'}</div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Статистика</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Точек:</span>
              <div className="text-2xl font-bold text-primary">{partner._count?.points ?? 0}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Сотрудников:</span>
              <div className="text-2xl font-bold text-primary">{totalEmployees}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Тариф:</span>
              <div className="text-sm">—</div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Действия</h2>
          <div className="space-y-2">
            <a
              href={`/admin/partners/${partner.id}/edit`}
              className="block w-full px-4 py-2 border rounded-lg text-sm text-center hover:bg-gray-50"
            >
              Редактировать
            </a>
            <a
              href={`/admin/partners/${partner.id}/points`}
              className="block w-full px-4 py-2 border rounded-lg text-sm text-center hover:bg-gray-50"
            >
              Управление точками
            </a>
            <a
              href={`/admin/partners/${partner.id}/users`}
              className="block w-full px-4 py-2 border rounded-lg text-sm text-center hover:bg-gray-50"
            >
              Пользователи
            </a>
          </div>
        </div>
      </div>

      {/* Точки */}
      {partner.points && partner.points.length > 0 && (
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Точки ({partner.points.length})</h2>
          <div className="space-y-4">
            {partner.points.map((point) => (
              <div key={point.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{point.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {point._count?.employees ?? 0} сотрудников
                  </span>
                </div>
                {point.address && (
                  <p className="text-sm text-muted-foreground">{point.address}</p>
                )}
                {point.employees && point.employees.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Сотрудники:</p>
                    <div className="space-y-1">
                      {point.employees.map((employee) => (
                        <div key={employee.id} className="text-sm text-muted-foreground">
                          {employee.name || employee.email} ({roleLabel(employee.role)})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
