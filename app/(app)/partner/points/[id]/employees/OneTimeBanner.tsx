'use client'
import { useState } from 'react'

export default function OneTimeBanner({ login, password }: { login: string; password: string }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="rounded-md bg-success-50 p-4 text-sm border border-success-200">
      <div className="font-medium">Сотрудник создан</div>
      <div>Логин: <code>{login}</code></div>
      <div>Пароль: <code>{password}</code></div>
      <p className="opacity-70 mt-2">Пароль показывается один раз — сохраните его.</p>
      <button
        className="mt-2 inline-flex items-center rounded border border-divider px-3 py-1 text-sm hover:bg-content2 bg-content1 text-foreground"
        onClick={() => setVisible(false)}
      >
        Понятно
      </button>
    </div>
  )
}


