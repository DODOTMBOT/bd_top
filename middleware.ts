export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    // whitelist: static, favicon, auth endpoints, login, register, and root
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login|register$).*)'
  ]
}



