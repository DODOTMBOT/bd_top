export const revalidate = 0;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200 p-4 space-y-3 sticky top-0">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">HoReCa SaaS</h1>
        <nav className="flex flex-col gap-2">
          {["Dashboard", "Admin", "Owner", "Partner", "Point", "Employee"].map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase()}`}
              className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition"
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-200">
          <div className="flex w-full items-center justify-between px-4 py-3">
            <span className="text-lg font-semibold">Панель администратора</span>
            <button className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-700 transition">
              Выйти
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 lg:p-10">
          <div className="w-full space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
