import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-4">Доступ запрещен</h2>
      <p className="text-gray-600 mb-8">
        У вас нет прав для доступа к этой странице.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition"
        >
          На главную
        </Link>
        <Link
          href="/login"
          className="bg-gray-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-gray-700 transition"
        >
          Войти
        </Link>
      </div>
    </div>
  );
}
