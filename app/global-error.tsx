'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)
  return (
    <html>
      <body className="p-6">
        <h2 className="text-lg font-semibold">Произошла ошибка</h2>
        <pre className="mt-2 bg-black/5 p-3 rounded">{String(error?.message || error)}</pre>
        <button className="mt-4 px-4 py-2 rounded bg-black text-white" onClick={() => window.location.reload()}>
          Перезагрузить
        </button>
      </body>
    </html>
  )
}