"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import LogoutButton from "@/components/auth/LogoutButton"

interface Page {
  id: string
  name: string
  path: string
}

export default function Sidebar() {
  const { data: session } = useSession()
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    const loadPages = async () => {
      if (session?.user?.role) {
        try {
          const response = await fetch('/api/admin/pages/access')
          if (response.ok) {
            const data = await response.json()
            // Фильтруем страницы по роли пользователя
            const userPages = data.pages.filter((page: any) => 
              page.accesses.some((access: any) => 
                access.role.name === session.user.role && access.canAccess
              )
            )
            setPages(userPages)
          }
        } catch (error) {
          console.error('Ошибка загрузки страниц:', error)
        }
      }
    }

    loadPages()
  }, [session?.user?.role])

  return (
    <aside className="flex flex-col justify-between h-full p-6 border-r bg-white">
      <div>
        <h1 className="text-2xl font-bold mb-8">HoReCa SaaS</h1>
        <nav className="flex flex-col gap-4">
          {pages.map(page => (
            <a key={page.id} href={page.path} className="text-lg font-medium">
              {page.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t pt-4 mt-6 text-sm text-gray-600">
        {session?.user ? (
          <>
            <p>Вошёл как <b>{session.user.login}</b></p>
            <p>Роль: <b>{session.user.role}</b></p>
            <LogoutButton />
          </>
        ) : (
          <p className="text-gray-500">Не авторизован</p>
        )}
      </div>
    </aside>
  )
}
