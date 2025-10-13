'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { registerAction } from './_actions'

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})
    
    startTransition(async () => {
      const result = await registerAction(formData)
      
      if (result.ok) {
        router.push('/login?registered=1')
      } else {
        if (result.issues) {
          setFieldErrors(result.issues)
        } else {
          setError(result.error || 'Ошибка регистрации')
        }
      }
    })
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">Регистрация партнёра</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <input 
            name="login" 
            placeholder="Логин" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {fieldErrors.login && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.login[0]}</p>
          )}
        </div>

        <div>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input 
              name="firstName" 
              placeholder="Имя" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldErrors.firstName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName[0]}</p>
            )}
          </div>
          <div>
            <input 
              name="lastName" 
              placeholder="Фамилия" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldErrors.lastName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName[0]}</p>
            )}
          </div>
        </div>

        <div>
          <input 
            name="company" 
            placeholder="Название компании" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {fieldErrors.company && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.company[0]}</p>
          )}
        </div>

        <div>
          <input 
            name="password" 
            type="password" 
            placeholder="Пароль" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <input 
            name="confirm" 
            type="password" 
            placeholder="Подтверждение пароля" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {fieldErrors.confirm && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.confirm[0]}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="text-sm mt-6 text-center text-gray-600">
        Уже есть аккаунт?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Войти
        </a>
      </p>
    </div>
  )
}




