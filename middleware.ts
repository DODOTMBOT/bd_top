import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionQuick } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { match } from 'path-to-regexp';

const PUBLIC = ['/', '/login', '/register', '/api/diag/db', '/_next', '/favicon', '/public', '/roles', '/owner', '/partner', '/point', '/employee'];

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  
  // Публичные маршруты
  if (PUBLIC.some(s => p.startsWith(s))) return NextResponse.next();

  // Пример: защищаем только /admin/* RBAC'ом,
  // остальное оставить как есть (не ломаем текущие механизмы)
  if (!p.startsWith('/admin')) return NextResponse.next();

  const sess = await getSessionQuick(req); // { userId, roles: string[] } | null
  if (!sess?.userId) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Разрешение: owner всегда проходит
  if (sess.roles?.includes('owner')) return NextResponse.next();

  // Иначе проверяем grants
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    select: { id: true, pattern: true },
  });

  const role = await prisma.rbacRole.findMany({
    where: { name: { in: sess.roles } },
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
  matcher: ['/admin/:path*'],
};



