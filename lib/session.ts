import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getSessionQuick(req: NextRequest): Promise<{ userId: string; roles: string[] } | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Получаем роли пользователя из RBAC
    const userRoles = await prisma.userRole.findMany({
      where: { userId: session.user.id },
      include: { role: true },
    });

    const roles = userRoles.map(ur => ur.role.name);
    
    return {
      userId: session.user.id,
      roles,
    };
  } catch (error) {
    console.error('[getSessionQuick] Error:', error);
    return null;
  }
}
