'use client';

import { useState } from 'react';

export default function SecretInline({ login, password }: { login: string; password: string }) {
  const [show, setShow] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(`${login} ${password}`);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-2 rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-800">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">Логин:</span>
        <code>{login}</code>

        <span className="ml-3 font-medium">Пароль:</span>
        <code>{show ? password : '••••••••'}</code>

        <button
          type="button"
          className="ml-2 underline"
          onClick={() => setShow((s) => !s)}
        >
          {show ? 'Скрыть' : 'Показать'}
        </button>

        <button
          type="button"
          className="ml-2 underline"
          onClick={copy}
        >
          Копировать
        </button>

        <span className="ml-auto opacity-60">Пароль пропадёт после перезагрузки/ухода со страницы.</span>
      </div>
    </div>
  );
}



