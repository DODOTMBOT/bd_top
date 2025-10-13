import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionQuick } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { match } from 'path-to-regexp';

const PUBLIC = ['/', '/login', '/register', '/api/diag/db', '/_next', '/favicon', '/public', '/roles', '/owner', '/partner', '/point', '/employee', '/blocked', '/logout'];

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  
  // Публичные маршруты
  if (PUBLIC.some(s => p.startsWith(s))) return NextResponse.next();

  const sess = await getSessionQuick(); // { userId, roles: string[] } | null
  if (!sess?.userId) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Проверяем блокировку пользователя для всех защищенных маршрутов
  const user = await (prisma as any).user.findUnique({
    where: { id: sess.userId },
    select: { isBlocked: true }
  });

  if (user?.isBlocked) {
    return NextResponse.redirect(new URL('/blocked', req.url));
  }

  // Пример: защищаем только /admin/* RBAC'ом,
  // остальное оставить как есть (не ломаем текущие механизмы)
  if (!p.startsWith('/admin')) return NextResponse.next();

  // Разрешение: owner всегда проходит
  if (sess.roles?.includes('owner')) return NextResponse.next();

  // Иначе проверяем grants
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    select: { id: true, pattern: true },
  });

  const role = await prisma.role.findMany({
    where: { key: { in: sess.roles } },
    select: { id: true },
  });

  if (!role.length) return NextResponse.rewrite(new URL('/403', req.url));

  // все grants для этих ролей
  const grants = await prisma.roleGrant.findMany({
    where: { roleId: { in: role.map(r => r.id) } },
    include: { resource: true },
  });

  // allow/deny по первому совпадению (или замержить как угодно)
  for (const g of grants) {
    const isMatch = g.resource.pattern === '*' ||
      match(g.resource.pattern, { decode: decodeURIComponent })(p);
    if (isMatch) {
      if (g.access === 'allow') return NextResponse.next();
      if (g.access === 'deny') return NextResponse.rewrite(new URL('/403', req.url));
    }
  }

  // по умолчанию — запрет
  return NextResponse.rewrite(new URL('/403', req.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};



