import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Sidebar() {
  const menuItems = await prisma.menu.findMany({ 
    orderBy: { order: "asc" } 
  });

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200 p-4 sticky top-0">
      <h1 className="text-xl font-semibold mb-6">HoReCa SaaS</h1>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link 
            key={item.id} 
            href={item.path} 
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
