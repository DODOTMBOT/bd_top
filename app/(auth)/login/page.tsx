"use client"

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

function LoginForm() {
  const { status } = useSession()
  const search = useSearchParams()
  const router = useRouter()
  const callbackUrl = search.get('cb') || '/'
  const justRegistered = search.get('registered') === '1'

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') router.replace(callbackUrl)
  }, [status, callbackUrl, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const res = await signIn('credentials', {
      redirect: false,
      callbackUrl: callbackUrl,
      login: login.trim(),
      password,
    })
    
    setLoading(false)
    
    if (res?.error) {
      if (res.error === 'INVALID_CREDENTIALS') {
        setError('Неверный логин или пароль')
      } else {
        setError('Ошибка входа. Попробуйте еще раз.')
      }
      return
    }
    
    // Успешный логин — редирект на callbackUrl или url из ответа
    router.push(res?.url || callbackUrl)
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Вход</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {justRegistered && (
          <div className="rounded border border-green-300 bg-green-50 p-2 text-sm">
            Аккаунт создан. Войдите, используя ваш логин и пароль.
          </div>
        )}
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Логин"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border rounded px-3 py-2"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full border rounded px-3 py-2"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
      <p className="text-sm mt-4">Нет аккаунта? <a className="underline" href="/register">Зарегистрироваться как партнёр</a></p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  )
}


