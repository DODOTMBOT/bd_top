export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import AdminShell from "./_components/AdminShell";
import { scanAppRoutes } from "@/src/lib/routeScanner";
import { prisma } from "@/lib/prisma";

const PROTECT = new Set(["/","/admin","/dashboard","/owner","/partner","/point","/employee"]);

export default async function AdminPage() {
  const rows = await scanAppRoutes();
  const pages = rows.map(r => ({
    route: r.route,
    file: r.file || '',
    isDynamic: r.isDynamic,
    protected: PROTECT.has(r.route),
    kind: r.kind, // передаём тип
  }));

  // Загружаем планы подписки
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <AdminShell pages={pages} plans={plans} />;
}