import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { quickCreatePartner } from './_actions';
import ImpersonationBanner from './_impersonation-banner';
import PartnersTable from './_partners-table';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PartnersPage() {
  noStore(); // Отключаем кэш для этой страницы

  const session = await auth();
  // Мягкая проверка прав OWNER
  if (!session?.user) {
    redirect('/signin');
  }

  // TODO: Добавить проверку роли OWNER
  // if (!session.user.roles?.includes('OWNER')) {
  //   return (
  //     <div className="rounded-2xl border bg-white shadow-sm p-6">
  //       <div className="text-center text-red-500">
  //         Доступ запрещён. Требуются права OWNER.
  //       </div>
  //     </div>
  //   );
  // }

  // Загружаем партнёров из БД
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { points: true } },
      points: { 
        select: { 
          _count: { select: { employees: true } } 
        } 
      },
      // subscriptionPlan: true, // пока нет связи
    },
  });

  // Суммируем сотрудников по всем точкам партнёра
  const rows = partners.map(p => {
    const employeesTotal = p.points?.reduce((acc, pt) => acc + (pt._count?.employees ?? 0), 0) ?? 0;
    
    // Пока что нет связи с SubscriptionPlan, поэтому используем заглушки
    const planName = '—';
    const status: 'Активна' | 'Нет' | '—' = '—';

    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      points: p._count?.points ?? 0,
      employees: employeesTotal,
      plan: planName,
      payStatus: status,
    };
  });

  return (
    <div className="space-y-6">
      <ImpersonationBanner />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Партнёры</h2>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border bg-white shadow-sm p-8">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              Нет партнёров в системе.
            </div>
            <form action={quickCreatePartner} className="flex items-center gap-2 justify-center">
              <input 
                name="name" 
                placeholder="Название партнёра" 
                className="px-3 py-2 border rounded-lg text-sm" 
                required 
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
              >
                Быстро создать партнёра
              </button>
            </form>
          </div>
        </div>
      ) : (
        <PartnersTable partners={rows} />
      )}
    </div>
  );
}
