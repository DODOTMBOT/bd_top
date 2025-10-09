'use client'

import { useEffect } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-[min(90vw,28rem)] rounded-md bg-white p-4 shadow-lg">
        <div className="text-base font-medium">{title}</div>
        {description && <div className="mt-2 text-sm text-gray-600">{description}</div>}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
}



