'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerPartnerAction } from './actions'
import { Alert } from '@/components/ui/alert'

function RegisterForm() {
  const router = useRouter()
  const search = useSearchParams()
  const cb = search.get('cb') || '/partner'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)

    let attempt = 0
    while (attempt < 3) {
      const res = await registerPartnerAction({ name: companyName, email, password })
      if (res.ok) {
        router.replace('/partner?registered=1')
        return
      }
      if (res.code === 'DB_UNAVAILABLE') {
        attempt++
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 500 * attempt))
          continue
        }
      }
      setError(res.message)
      break
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Регистрация партнёра</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {error && <Alert title="Ошибка" description={error} />}
        <input type="text" value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Название компании" className="w-full border rounded px-3 py-2" required />
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль (мин. 8)" minLength={8} className="w-full border rounded px-3 py-2" required />
        <button type="submit" disabled={loading} className="w-full border rounded px-3 py-2">{loading ? 'Создаём…' : 'Зарегистрироваться'}</button>
      </form>
      <p className="text-sm mt-4">Уже есть аккаунт? <a className="underline" href={`/login?cb=${encodeURIComponent(cb)}`}>Войти</a></p>
    </div>
  )
}

export default function RegisterPartnerPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <RegisterForm />
    </Suspense>
  )
}



