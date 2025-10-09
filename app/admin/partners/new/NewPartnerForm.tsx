"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { createPartnerAction, getAvailableAccounts } from './actions'

type Account = {
  id: string
  email: string
  name: string | null
  role: string
}

export default function NewPartnerForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  useEffect(() => {
    async function loadAccounts() {
      try {
        const availableAccounts = await getAvailableAccounts()
        setAccounts(availableAccounts)
      } catch (error) {
        console.error('Error loading accounts:', error)
      } finally {
        setLoadingAccounts(false)
      }
    }
    loadAccounts()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await createPartnerAction(formData)

    setLoading(false)

    if (result.ok) {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    } else {
      setError(result.message)
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800">Партнёр успешно создан!</p>
        <a href="/partner/points" className="text-blue-600 hover:underline">
          Перейти к управлению точками
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Input
        name="name"
        label="Название партнёра"
        placeholder="Введите название"
        isRequired
      />

      <Select
        name="accountId"
        label="Выберите аккаунт"
        placeholder="Выберите пользователя"
        isRequired
        isLoading={loadingAccounts}
      >
        {loadingAccounts ? (
          <SelectItem key="loading" value="loading" isDisabled>
            Загрузка...
          </SelectItem>
        ) : accounts.length === 0 ? (
          <SelectItem key="no-accounts" value="no-accounts" isDisabled>
            Нет доступных аккаунтов
          </SelectItem>
        ) : (
          accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.email} {account.name ? `(${account.name})` : ''} - {account.role}
            </SelectItem>
          ))
        )}
      </Select>

      <Button
        type="submit"
        color="primary"
        isLoading={loading}
        isDisabled={loading}
      >
        {loading ? 'Создание...' : 'Создать партнёра'}
      </Button>
    </form>
  )
}
