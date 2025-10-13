import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* левый сайдбар один раз на всю оболочку */}
      {/* Sidebar — серверный компонент, тянет меню из БД, скрытые не показывает */}
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}