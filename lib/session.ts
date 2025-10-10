import { auth } from '@/lib/auth'

export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

export async function getSessionQuick(): Promise<{ userId: string; roles: string[] } | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Получаем роли пользователя из RBAC
    const userRoles = await prisma.userRole.findMany({
      where: { userId: session.user.id },
      include: { role: true },
    });

    const roles = userRoles.map(ur => ur.role.key);
    
    return {
      userId: session.user.id,
      roles,
    };
  } catch (error) {
    console.error('[getSessionQuick] Error:', error);
    return null;
  }
}
