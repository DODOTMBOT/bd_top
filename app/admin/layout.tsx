export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Панель администратора</h1>
        <p className="text-gray-600 text-sm">
          Управление ролями, ресурсами и правами доступа в системе RBAC
        </p>
      </div>
      
      <nav className="mb-6 flex gap-4 border-b pb-4">
        <a href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
          Разрешения
        </a>
        <a href="/admin/roles" className="text-blue-600 hover:text-blue-800 font-medium">
          Роли
        </a>
        <a href="/admin/resources" className="text-blue-600 hover:text-blue-800 font-medium">
          Ресурсы
        </a>
        <a href="/admin/guide" className="text-gray-600 hover:text-gray-800 font-medium">
          Гайд
        </a>
      </nav>
      
      {children}
    </div>
  );
}
