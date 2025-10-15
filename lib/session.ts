import { auth } from '@/lib/auth'

export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

export async function getSessionQuick(): Promise<{ userId: string; roles: string[] } | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Получаем пользователя и его роль
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, roleId: true }
    });

    if (!user) return null;

    // Определяем роли пользователя
    const roles = [];
    if (user.role) {
      roles.push(user.role);
    }
    if (user.roleId) {
      // Если есть roleId, получаем роль из новой системы RBAC
      const accessRole = await prisma.accessRole.findUnique({
        where: { id: user.roleId },
        select: { name: true }
      });
      if (accessRole) {
        roles.push(accessRole.name);
      }
    }
    
    return {
      userId: session.user.id,
      roles,
    };
  } catch (error) {
    console.error('[getSessionQuick] Error:', error);
    return null;
  }
}
