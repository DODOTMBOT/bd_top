export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <nav className="mb-6 flex gap-4">
        <a href="/admin" className="underline">Grants</a>
        <a href="/admin/roles" className="underline">Roles</a>
        <a href="/admin/resources" className="underline">Resources</a>
      </nav>
      {children}
    </div>
  );
}
