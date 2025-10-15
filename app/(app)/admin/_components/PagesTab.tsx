'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Spinner } from '@heroui/react'
import { useAppDialog } from '@/lib/dialog'

type PageRow = { 
  route: string
  file: string
  isDynamic: boolean
  protected: boolean
  kind: string
}

export default function PagesTab({ pages }: { pages: PageRow[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { alert } = useAppDialog()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Страницы приложения</h2>
        <Button color="primary" onPress={() => window.location.reload()}>
          Обновить
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Application pages">
          <TableHeader>
            <TableColumn>Маршрут</TableColumn>
            <TableColumn>Файл</TableColumn>
            <TableColumn>Тип</TableColumn>
            <TableColumn>Защищено</TableColumn>
            <TableColumn>Динамический</TableColumn>
          </TableHeader>
          <TableBody>
            {!pages?.length ? (
              <TableRow>
                <TableCell className="text-center text-gray-500 text-sm py-4">-</TableCell>
                <TableCell className="text-center text-gray-500 text-sm py-4">-</TableCell>
                <TableCell className="text-center text-gray-500 text-sm py-4">-</TableCell>
                <TableCell className="text-center text-gray-500 text-sm py-4">-</TableCell>
                <TableCell className="text-center text-gray-500 text-sm py-4">Нет страниц</TableCell>
              </TableRow>
            ) : (
              pages.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{page.route}</TableCell>
                  <TableCell className="font-mono text-sm">{page.file}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      page.kind === 'page' ? 'bg-blue-100 text-blue-800' :
                      page.kind === 'layout' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {page.kind}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      page.protected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {page.protected ? 'Да' : 'Нет'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      page.isDynamic ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.isDynamic ? 'Да' : 'Нет'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}