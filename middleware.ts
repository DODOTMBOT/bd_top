import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: any) {
  const { pathname } = req.nextUrl

  // Разрешённые маршруты без проверки авторизации
  const publicPaths = ["/login", "/register", "/blocked", "/api", "/_next", "/favicon.ico"]

  // Если путь входит в список разрешённых — пропускаем middleware
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Проверка токена авторизации
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Временно убираем проверку доступа через Prisma из middleware
  // TODO: Реализовать проверку доступа через API или кэш
  return NextResponse.next()
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
}