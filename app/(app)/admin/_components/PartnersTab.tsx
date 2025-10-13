'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Chip, Spinner } from '@heroui/react'
import { formatShortRU } from '@/lib/formatDate'
import { safeFetch } from '@/lib/safeFetch'

type Partner = {
  id: string
  name: string
  login: string
  email: string | null
  createdAt: string
  pointsOwned: Point[]
}

type Point = {
  id: string
  name: string
  address: string
  pointUser: {
    login: string
  }
  createdAt: string
}

export default function PartnersTab() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPartners()
  }, [])

  async function loadPartners() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await safeFetch('/api/admin/partners')
      if (!response.ok) {
        throw new Error('Ошибка загрузки партнеров')
      }
      
      const data = await response.json()
      setPartners(data.partners || [])
    } catch (err) {
      console.error('Ошибка загрузки партнеров:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadPartners}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Партнеров пока нет
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Партнеры и их точки</h2>
        <div className="text-sm text-gray-500">
          Всего партнеров: {partners.length}
        </div>
      </div>

      <div className="grid gap-6">
        {partners.map((partner) => (
          <Card key={partner.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-medium">{partner.name}</h3>
                    <p className="text-sm text-gray-500">
                      Логин: {partner.login}
                      {partner.email && ` • ${partner.email}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Chip color="primary" variant="flat">
                    Партнер
                  </Chip>
                  <p className="text-xs text-gray-500 mt-1">
                    Создан: {formatShortRU(new Date(partner.createdAt))}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardBody className="pt-0">
              {partner.pointsOwned.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  У этого партнера пока нет торговых точек
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">
                    Торговые точки ({partner.pointsOwned.length}):
                  </h4>
                  <div className="grid gap-3">
                    {partner.pointsOwned.map((point) => (
                      <div 
                        key={point.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{point.name}</div>
                          <div className="text-sm text-gray-600">{point.address}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Создана: {formatShortRU(new Date(point.createdAt))}
                          </div>
                        </div>
                        <div className="text-right">
                          <Chip size="sm" color="secondary" variant="flat">
                            Логин: {point.pointUser.login}
                          </Chip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
