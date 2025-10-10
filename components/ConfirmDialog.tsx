'use client'


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
      <div className="relative z-10 w-[min(90vw,28rem)] rounded-md bg-content1 p-4 shadow-lg border border-divider">
        <div className="text-base font-medium">{title}</div>
        {description && <div className="mt-2 text-sm text-default-600">{description}</div>}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded border border-divider px-3 py-1 text-sm hover:bg-content2 bg-content1 text-foreground"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded bg-danger px-3 py-1 text-sm text-danger-foreground hover:bg-danger/90"
            onClick={onConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
}



