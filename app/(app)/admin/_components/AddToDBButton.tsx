'use client';

import { useTransition, useState } from 'react';
import { addPageToDB } from '../_actions';

interface AddToDBButtonProps {
  title: string;
  path: string;
  section?: string;
}

export default function AddToDBButton({ title, path, section }: AddToDBButtonProps) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      action={(formData) => {
        setMsg(null);
        startTransition(async () => {
          const res = await addPageToDB(formData as any);
          if (!res?.ok) setMsg(res?.error ?? 'Ошибка');
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="section" value={section ?? ''} />
      <button
        type="submit"
        disabled={pending}
        className="text-primary hover:underline disabled:opacity-50"
        aria-label="Добавить страницу в базу данных"
        title="Зарегистрировать в БД для управления доступами"
      >
        Добавить в БД
      </button>
      {msg && <span className="text-xs text-red-500">{msg}</span>}
    </form>
  );
}
