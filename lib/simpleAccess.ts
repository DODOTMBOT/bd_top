import { redirect } from "next/navigation"

// Простая проверка доступа без использования NextAuth
export async function checkSimpleAccess(pathname: string) {
  // Временно разрешаем доступ ко всем страницам
  // TODO: Реализовать проверку через API или кэш
  console.log(`[SIMPLE ACCESS] Checking access for: ${pathname}`)
  return true
}



