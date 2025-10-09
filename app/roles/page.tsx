import { auth } from "@/lib/auth";
import Link from "next/link";
import { Shield, Store, IdCard, Users } from "lucide-react";

export default async function RolesPage() {
  const session = await auth();
  const email = session?.user?.email ?? session?.user?.login ?? "Гость";
  const role  = session?.user?.role ?? "UNKNOWN";

  const tiles = [
    {
      href: "/owner",
      title: "Owner",
      desc: "Полный доступ и настройки",
      icon: <Shield className="size-5" />,
    },
    {
      href: "/partner",
      title: "Partner",
      desc: "Управление точками и персоналом",
      icon: <Store className="size-5" />,
    },
    {
      href: "/point",
      title: "Point",
      desc: "Работа точки и операции",
      icon: <IdCard className="size-5" />,
    },
    {
      href: "/employee",
      title: "Employee",
      desc: "Доступ сотрудника",
      icon: <Users className="size-5" />,
    },
  ];

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Проверка ролей</h1>
          <p className="text-gray-500 mt-1">Выберите раздел для работы</p>
        </div>

        <div className="min-w-[220px] p-4 bg-gray-100 rounded-lg">
          <div className="text-sm font-medium">{email}</div>
          <div className="text-xs text-gray-500">{role}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-blue-100 p-2">{t.icon}</div>
              <div className="flex flex-col">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-gray-500">{t.desc}</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Перейти
            </button>
          </Link>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">Быстрые действия:</span>
          <Link href="/partner/points" className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
            Мои точки
          </Link>
          <Link href="/login" className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
            Сменить пользователя
          </Link>
        </div>
      </div>
    </div>
  );
}
