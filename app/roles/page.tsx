import { auth } from "@/lib/auth";
import Link from "next/link";
import { Shield, Store, IdCard, Users } from "lucide-react";
import { Card, CardBody, CardHeader, Button, Badge } from "@/components/ui";

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

        <Badge content={role} color="primary" variant="flat">
          <div className="min-w-[220px] p-4 bg-gray-100 rounded-lg">
            <div className="text-sm font-medium">{email}</div>
            <div className="text-xs text-gray-500">{role}</div>
          </div>
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Card key={t.href} className="hover:shadow-md transition-shadow" isPressable as={Link} href={t.href}>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2">{t.icon}</div>
              <div className="flex flex-col">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-gray-500">{t.desc}</span>
              </div>
            </CardHeader>
            <CardBody>
              <Button color="primary" className="w-full">
                Перейти
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50 border-dashed">
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">Быстрые действия:</span>
            <Button as={Link} href="/partner/points" color="primary" variant="flat" size="sm">
              Мои точки
            </Button>
            <Button as={Link} href="/login" variant="flat" size="sm">
              Сменить пользователя
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
