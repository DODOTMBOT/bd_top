import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-3xl font-semibold mb-6">HoReCa SaaS</h1>
      <p className="text-gray-600 mb-8">Выберите действие</p>
      <Link
        href="/roles"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition-colors"
      >
        Проверка ролей
      </Link>
    </div>
  );
}
