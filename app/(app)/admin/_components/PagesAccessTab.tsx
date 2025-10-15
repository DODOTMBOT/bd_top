'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Checkbox, Button, Spinner } from '@heroui/react'
import { useAppDialog } from '@/lib/dialog'

type Role = {
  id: string
  name: string
}

type Page = {
  id: string
  name: string
  path: string
  accesses: Array<{
    id: string
    roleId: string
    pageId: string
    canAccess: boolean
    role: Role
  }>
}

type AccessMatrix = {
  [pageId: string]: {
    [roleId: string]: boolean
  }
}

export default function PagesTab() {
  const [pages, setPages] = useState<Page[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [accessMatrix, setAccessMatrix] = useState<AccessMatrix>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { alert } = useAppDialog()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/pages/access')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      
      setPages(data.pages)
      setRoles(data.roles)
      
      // Создаем матрицу доступа
      const matrix: AccessMatrix = {}
      data.pages.forEach((page: Page) => {
        matrix[page.id] = {}
        data.roles.forEach((role: Role) => {
          const access = page.accesses.find(a => a.roleId === role.id)
          matrix[page.id][role.id] = access?.canAccess || false
        })
      })
      setAccessMatrix(matrix)
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка загрузки')
      await alert({ 
        title: 'Ошибка', 
        message: e?.message ?? 'Ошибка загрузки данных', 
        variant: 'danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAccess = (pageId: string, roleId: string) => {
    setAccessMatrix(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [roleId]: !prev[pageId]?.[roleId],
      },
    }))
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      // Подготавливаем все изменения для отправки в новом формате
      const updates = []
      for (const pageId in accessMatrix) {
        for (const roleId in accessMatrix[pageId]) {
          const page = pages.find(p => p.id === pageId)
          const role = roles.find(r => r.id === roleId)
          
          if (page && role) {
            updates.push({
              roleName: role.name,
              pagePath: page.path,
              allowed: accessMatrix[pageId][roleId],
            })
          }
        }
      }

      console.log("[UI] Sending updates:", updates)

      const response = await fetch('/api/admin/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await alert({ 
        title: 'Успех', 
        message: 'Изменения сохранены', 
        variant: 'success' 
      })
    } catch (e: any) {
      await alert({ 
        title: 'Ошибка', 
        message: e?.message ?? 'Ошибка сохранения изменений', 
        variant: 'danger' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Ошибка: {error}</p>
        <Button color="primary" onPress={loadData} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Управление доступом к страницам</h2>
        <div className="flex gap-2">
          <Button color="primary" onPress={loadData} variant="light">
            Обновить
          </Button>
          <Button 
            color="success" 
            onPress={saveAllChanges}
            isLoading={saving}
            isDisabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Page access matrix">
          <TableHeader>
            <TableColumn className="min-w-[200px]">Страница</TableColumn>
            {roles.map(role => (
              <TableColumn key={role.id} className="text-center min-w-[120px]">
                {role.name}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {pages.map(page => (
              <TableRow key={page.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{page.name}</div>
                    <div className="text-sm text-gray-500">{page.path}</div>
                  </div>
                </TableCell>
                {roles.map(role => (
                  <TableCell key={`${page.id}-${role.id}`} className="text-center">
                    <Checkbox
                      isSelected={accessMatrix[page.id]?.[role.id] || false}
                      onValueChange={() => toggleAccess(page.id, role.id)}
                      color="primary"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}