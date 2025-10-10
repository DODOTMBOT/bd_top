// app/partner/points/[id]/page.tsx
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Role = 'OWNER' | 'PARTNER' | 'POINT' | 'USER';

// Доступ к странице конкретной точки
async function guardPointView(pointId: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?cb=${encodeURIComponent(`/partner/points/${pointId}`)}`);
  }

  const me = session.user as { id?: string; role?: string; partnerId?: string | null };
  const role = me.role as Role | undefined;

  // минимальная выборка для проверки доступа
  const accessPoint = await prisma.point.findUnique({
    where: { id: pointId },
    select: {
      partnerId: true,
      accountId: true,
    },
  });
  if (!accessPoint) notFound();

  const allowed =
    role === 'OWNER' ||
    (role === 'PARTNER' && me.partnerId === accessPoint.partnerId) ||
    (role === 'POINT' && me.id === accessPoint.accountId);

  if (!allowed) redirect('/');

  // минимальная выборка данных для UI
  const point = await prisma.point.findUnique({
    where: { id: pointId },
    select: { id: true, name: true, account: { select: { email: true } } },
  });
  if (!point) notFound();

  return { point, role };
}

export default async function PartnerPointPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { point } = await guardPointView(resolvedParams.id);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Точка: {point.name}</h1>

      <div className="text-sm opacity-70">
        Аккаунт точки (POINT): {point.account?.email ?? '—'}
      </div>

      <div className="flex gap-3">
        <Link
          href="/partner/points"
          className="inline-flex items-center rounded border border-divider px-3 py-1 text-sm hover:bg-content2 bg-content1 text-foreground"
        >
          ← Назад к списку точек
        </Link>
        <Link
          href={`/partner/points/${point.id}/employees`}
          className="inline-flex items-center rounded border border-divider px-3 py-1 text-sm hover:bg-content2 bg-content1 text-foreground"
        >
          Сотрудники этой точки
        </Link>
      </div>

      <div className="rounded border border-divider p-4 text-sm bg-content1">
        Здесь будет управление конкретной точкой.
      </div>
    </section>
  );
}
