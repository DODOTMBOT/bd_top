'use client'

import { useFormState } from 'react-dom'
import SecretInline from '@/components/SecretInline'
import { resetEmployeePasswordFormAction } from './actions'
import CopyButton from '@/components/CopyButton'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useState } from 'react'

type Props = { pointId: string; employeeId: string; login: string }
type ResetState = { ok?: boolean; login?: string; password?: string; error?: string }

export default function ResetPasswordButton({ pointId, employeeId, login }: Props) {
  const initialState: ResetState = {}
  const [state, formAction] = useFormState(resetEmployeePasswordFormAction, initialState)
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2 text-right">
      <div className="inline-flex items-center gap-2 justify-end">
        <CopyButton text={login} label="Копировать логин" />
        {state?.password && (
          <CopyButton text={`${login} ${state.password}`} label="Копировать логин+пароль" />
        )}
        <button
          type="button"
          className="text-xs underline hover:opacity-80"
          onClick={() => setOpen(true)}
        >
          Сгенерировать новый пароль
        </button>
      </div>

      <form action={formAction} className="hidden">
        <input type="hidden" name="pointId" value={pointId} />
        <input type="hidden" name="employeeId" value={employeeId} />
        <button type="submit" id={`submit-reset-${employeeId}`} />
      </form>

      <ConfirmDialog
        open={open}
        title="Сгенерировать новый пароль?"
        description="Текущий пароль станет недействительным. Новый пароль будет показан один раз."
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          const btn = document.getElementById(`submit-reset-${employeeId}`) as HTMLButtonElement | null
          btn?.click()
        }}
      />

      {state?.password && (
        <SecretInline login={login} password={state.password} />
      )}

      {state?.error && (
        <div className="text-xs text-red-600">{state.error}</div>
      )}
    </div>
  )
}


