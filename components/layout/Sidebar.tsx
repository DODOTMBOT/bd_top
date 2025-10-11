import Link from "next/link";
import { scanAppRoutes } from "@/lib/routeScanner";

const HIDE = new Set(["/","/admin","/login","/register","/auth"]);

export default async function Sidebar() {
  const all = await scanAppRoutes();
  const items = all
    .filter(p => /^\/[a-z0-9-]+$/.test(p.route))
    .filter(p => !HIDE.has(p.route))
    .sort((a,b)=> a.route.localeCompare(b.route));

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200 p-4 sticky top-0">
      <h1 className="text-xl font-semibold mb-6">HoReCa SaaS</h1>
      <nav className="flex flex-col gap-2">
        {items.map(it => (
          <Link key={it.route} href={it.route} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition">
            {it.route.replace("/","").replace(/-/g," ").replace(/\b\w/g, s=>s.toUpperCase())}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
