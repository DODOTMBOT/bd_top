import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Страница не найдена</h1>
      <Link href="/" className="underline mt-4 inline-block">На главную</Link>
    </div>
  )
}


