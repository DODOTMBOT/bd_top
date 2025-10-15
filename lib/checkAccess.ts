import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

// Принудительное обновление для предотвращения кэширования
export const dynamic = "force-dynamic"

// Проверка прав пользователя на конкретный маршрут
export async function checkAccess(pathname: string) {
  const session = await auth()
  if (!session?.user) {
    console.log("[ACCESS] No user in session")
    return redirect("/login")
  }

  const userRole = session.user.role
  const normalizedPath = pathname.replace(/\/+$/, "").split("?")[0]

  console.log("=== ACCESS DEBUG START ===")
  console.log("User:", session.user)
  console.log("Role from session:", userRole)
  console.log("Requested path:", normalizedPath)

  // Получаем все доступы для роли (принудительно из БД)
  // Новая таблица RolePageAccess: фильтрация по roleName/allowed
  // Временный лог, чтобы убедиться что метод существует в клиенте
  console.log('[ACCESS DEBUG] Prisma models:', Object.keys(prisma))
  const roleAccess = await (prisma as any).rolePageAccess.findMany({
    where: {
      roleName: userRole,
      allowed: true,
    },
    include: {
      page: true,
    },
  })

  console.log("RolePageAccess entries:", roleAccess.length)
  console.log("Routes from DB:", roleAccess.map((r) => r.page.path))
  console.log("=== ACCESS DEBUG END ===")

  const allowedPaths = roleAccess.map((r: any) => r.page.path.replace(/\/+$/, ""))
  const hasAccess = allowedPaths.includes(normalizedPath)

  if (!hasAccess) {
    console.warn(`[ACCESS] Denied for role ${userRole} on ${normalizedPath}`)
    return redirect("/blocked")
  }

  console.log(`[ACCESS] ${userRole} -> ${normalizedPath}: allowed`)
  return true
}
