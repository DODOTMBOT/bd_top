"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, Avatar, Button, Divider, ScrollShadow, Tooltip } from "@heroui/react";
import { LogOut } from "lucide-react";

type NavItem = { href: string; label: string };
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/owner", label: "Owner" },
  { href: "/partner", label: "Partner" },
  { href: "/point", label: "Point" },
  { href: "/employee", label: "Employee" },
];

export default function AppShell({
  children,
  user,
  onLogoutHref = "/api/auth/signout",
}: {
  children: React.ReactNode;
  user?: { name?: string | null; email?: string | null; login?: string | null; role?: string | null };
  onLogoutHref?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-default-50 text-foreground">
      {/* topbar для мобилы */}
      <div className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-divider px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">HoReCa SaaS</div>
        <div className="flex items-center gap-3">
          <Avatar name={user?.name ?? user?.email ?? "U"} size="sm" />
          <Tooltip content="Выйти">
            <Link href={onLogoutHref}><LogOut className="w-4 h-4 opacity-70" /></Link>
          </Tooltip>
        </div>
      </div>

      {/* Основная сетка */}
      <div className="mx-auto max-w-[1400px] px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr_360px] gap-6">

        {/* LEFT: Sidebar */}
        <aside className="hidden md:block relative">
          {/* синий фон + скругления, и «ступенька» к белому контенту */}
          <div className="sidebar-bg rounded-2xl overflow-hidden">
            <div className="px-4 pt-5 pb-4 text-white/90 text-sm font-semibold">Навигация</div>
            <Divider className="border-white/15" />
            <ScrollShadow className="max-h-[calc(100vh-200px)]">
              <nav className="py-2">
                {NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <div key={item.href} className="px-2 py-1">
                      <Link
                        href={item.href}
                        className={[
                          "block px-4 py-3 text-sm rounded-r-2xl transition shadow-none relative",
                          active
                            ? "sidebar-active text-primary-700"
                            : "text-white/90 hover:bg-white/10"
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </nav>
            </ScrollShadow>
          </div>
        </aside>

        {/* CENTER: Content */}
        <main className="min-h-[70vh]">
          <Card className="p-6">{children}</Card>
        </main>

        {/* RIGHT: User panel */}
        <section className="hidden md:flex flex-col">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name ?? user?.email ?? "U"} />
              <div className="truncate">
                <div className="font-medium truncate">{user?.name ?? user?.login ?? "Пользователь"}</div>
                <div className="text-xs text-default-500 truncate">{user?.email ?? "—"}</div>
              </div>
            </div>
            <Divider />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Card className="p-3"><div className="text-xs text-default-500">Роль</div><div className="font-medium">{user?.role ?? "—"}</div></Card>
              <Card className="p-3"><div className="text-xs text-default-500">Статус</div><div className="font-medium">Активен</div></Card>
            </div>
            <Button as={Link} href={onLogoutHref} color="primary" variant="flat" startContent={<LogOut className="w-4 h-4" />}>
              Выйти
            </Button>
          </Card>
        </section>

      </div>
    </div>
  );
}