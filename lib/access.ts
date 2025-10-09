// lib/access.ts
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export type Role = 'OWNER' | 'PARTNER' | 'POINT' | 'USER';

export function mustChangePasswordGuard(user: { role: string; mustChangePassword?: boolean }) {
  if (user.role === 'USER' && user.mustChangePassword) {
    redirect('/me/change-password');
  }
}

// Ресурсный guard для Point
export async function guardPointView(pointId: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?cb=${encodeURIComponent(`/partner/points/${pointId}`)}`);
  }

  const me = session.user as any;
  const role = me.role as Role | undefined;

  const point = await prisma.point.findUnique({
    where: { id: pointId },
    select: {
      id: true,
      name: true,
      partnerId: true,
      accountId: true,
      account: { select: { email: true } },
    },
  });

  if (!point) notFound();

  const allowed =
    role === 'OWNER' ||
    (role === 'PARTNER' && me.partnerId && me.partnerId === point.partnerId) ||
    (role === 'POINT' && me.id && me.id === point.accountId);

  if (!allowed) redirect('/');

  return { session, role, point };
}


