'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { Alert } from '@heroui/react'

type AlertVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary'
type ConfirmOptions = {
  title?: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary'|'success'|'danger'|'warning'
  // Доп. кнопка "тяжёлое действие" с красным цветом:
  destructive?: boolean
}
type AlertOptions = {
  title?: string
  message: string | React.ReactNode
  variant?: AlertVariant
  okText?: string
}

type DialogContextType = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
  alert: (opts: AlertOptions) => Promise<void>
  prompt: (opts: ConfirmOptions & { placeholder?: string; defaultValue?: string }) => Promise<string | null>
}

const DialogContext = createContext<DialogContextType | null>(null)

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within <DialogCenterProvider/>')
  return ctx
}

export function DialogCenterProvider({ children }: { children: React.ReactNode }) {
  // confirm state
  const [cOpen, setCOpen] = useState(false)
  const cResolver = useRef<(v:boolean)=>void>()
  const [cOpts, setCOpts] = useState<ConfirmOptions>({ message: '' })

  // alert state
  const [aOpen, setAOpen] = useState(false)
  const aResolver = useRef<()=>void>()
  const [aOpts, setAOpts] = useState<AlertOptions>({ message: '', variant:'default' })

  // prompt state
  const [pOpen, setPOpen] = useState(false)
  const pResolver = useRef<(v:string|null)=>void>()
  const [pOpts, setPOpts] = useState<(ConfirmOptions & { placeholder?: string; defaultValue?: string })>({ message: '' })
  const pInputRef = useRef<HTMLInputElement>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setCOpts({
      title: opts.title ?? 'Подтверждение',
      message: opts.message,
      confirmText: opts.confirmText ?? (opts.destructive ? 'Удалить' : 'ОК'),
      cancelText: opts.cancelText ?? 'Отмена',
      confirmColor: opts.confirmColor ?? (opts.destructive ? 'danger' : 'primary'),
      destructive: !!opts.destructive
    })
    setCOpen(true)
    return new Promise<boolean>(resolve => { cResolver.current = resolve })
  }, [])

  const alert = useCallback((opts: AlertOptions) => {
    setAOpts({
      title: opts.title ?? 'Сообщение',
      message: opts.message,
      variant: opts.variant ?? 'default',
      okText: opts.okText ?? 'ОК'
    })
    setAOpen(true)
    return new Promise<void>(resolve => { aResolver.current = resolve })
  }, [])

  const prompt = useCallback((opts: ConfirmOptions & { placeholder?: string; defaultValue?: string }) => {
    setPOpts({
      title: opts.title ?? 'Введите значение',
      message: opts.message,
      confirmText: opts.confirmText ?? 'Сохранить',
      cancelText: opts.cancelText ?? 'Отмена',
      confirmColor: opts.confirmColor ?? 'primary',
      placeholder: opts.placeholder,
      defaultValue: opts.defaultValue ?? ''
    })
    setPOpen(true)
    return new Promise<string | null>(resolve => { pResolver.current = resolve })
  }, [])

  const value = useMemo<DialogContextType>(() => ({ confirm, alert, prompt }), [confirm, alert, prompt])

  return (
    <DialogContext.Provider value={value}>
      {children}

      {/* CONFIRM — всегда по центру */}
      <Modal isOpen={cOpen} onOpenChange={setCOpen} placement="center" backdrop="blur" hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              {cOpts.title && <ModalHeader className="text-base font-semibold">{cOpts.title}</ModalHeader>}
              <ModalBody className="pt-0">
                <Alert color={cOpts.destructive ? 'danger' : 'primary'} variant="flat">
                  {cOpts.message}
                </Alert>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={() => { setCOpen(false); cResolver.current?.(false) }}>
                  {cOpts.cancelText}
                </Button>
                <Button color={cOpts.confirmColor} onPress={() => { setCOpen(false); cResolver.current?.(true) }}>
                  {cOpts.confirmText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ALERT — всегда по центру */}
      <Modal isOpen={aOpen} onOpenChange={setAOpen} placement="center" backdrop="blur" hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              {aOpts.title && <ModalHeader className="text-base font-semibold">{aOpts.title}</ModalHeader>}
              <ModalBody className="pt-0">
                <Alert color={aOpts.variant === 'danger' ? 'danger'
                                : aOpts.variant === 'success' ? 'success'
                                : aOpts.variant === 'warning' ? 'warning'
                                : aOpts.variant === 'primary' ? 'primary'
                                : aOpts.variant === 'secondary' ? 'secondary'
                                : 'default'
                } variant="flat">
                  {aOpts.message}
                </Alert>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => { setAOpen(false); aResolver.current?.() }}>
                  {aOpts.okText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* PROMPT — поле ввода в центре */}
      <Modal isOpen={pOpen} onOpenChange={setPOpen} placement="center" backdrop="blur" hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              {pOpts.title && <ModalHeader className="text-base font-semibold">{pOpts.title}</ModalHeader>}
              <ModalBody className="pt-0">
                {pOpts.message && <Alert variant="flat">{pOpts.message}</Alert>}
                <input
                  ref={pInputRef}
                  className="w-full rounded-xl border px-3 py-2 outline-none"
                  placeholder={pOpts.placeholder}
                  defaultValue={pOpts.defaultValue}
                  autoFocus
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={() => { setPOpen(false); pResolver.current?.(null) }}>
                  {pOpts.cancelText}
                </Button>
                <Button color={pOpts.confirmColor} onPress={() => {
                  const val = pInputRef.current?.value ?? ''
                  setPOpen(false); pResolver.current?.(val)
                }}>
                  {pOpts.confirmText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DialogContext.Provider>
  )
}
