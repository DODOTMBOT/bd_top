'use client';

import {useEffect} from 'react';
import {Alert, Button} from '@heroui/react';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'default'|'success'|'warning'|'danger';
};

export default function CenteredAlert({
  open,
  title = 'Подтверждение',
  message,
  confirmText = 'OK',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  severity = 'warning',
}: Props) {
  // закрытие по Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md">
        <Alert
          title={title}
          description={message}
          severity={severity}
          className="rounded-2xl"
          endContent={
            <div className="flex gap-2">
              <Button variant="flat" onPress={onCancel}>{cancelText}</Button>
              <Button color="danger" onPress={onConfirm}>{confirmText}</Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
