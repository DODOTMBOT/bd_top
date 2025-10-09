'use client'
import React from 'react'
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen p-6">
        <h1 className="text-xl font-semibold">Сбой приложения</h1>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="mt-3 text-xs whitespace-pre-wrap p-3 bg-gray-100 rounded">{String(error?.message ?? '')}</pre>
        )}
        <button onClick={reset} className="mt-4 border rounded px-3 py-2 text-sm">Перезагрузить</button>
      </body>
    </html>
  )
}


