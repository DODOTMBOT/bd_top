import { prisma } from '@/lib/prisma';

export default async function RolesPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  const roles = await prisma.rbacRole.findMany({ 
    include: { users: { include: { user: true } } } 
  });
  const error = searchParams?.error;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">Управление ролями</h2>
        <p className="text-sm text-gray-600 mb-4">
          Роли определяют набор прав пользователей. Создавайте роли для разных типов пользователей.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Создать новую роль</h3>
        <form action="/admin/actions/role" method="post" className="flex gap-2">
          <input 
            name="name" 
            placeholder="Название роли (например: manager)" 
            className="border px-3 py-2 rounded flex-1"
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Создать
          </button>
        </form>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-medium">Существующие роли</h3>
        {roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Роли не созданы</p>
            <p className="text-sm">Создайте первую роль выше</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {roles.map((r: any) => (
              <div key={r.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-lg">
                        {r.name === 'owner' ? '👑 Владелец' : 
                         r.name === 'partner' ? '🏢 Партнёр' :
                         r.name === 'employee' ? '👤 Сотрудник' : 
                         `🔧 ${r.name}`}
                      </h4>
                      <span className="text-sm text-gray-500">
                        ({r.users.length} пользователей)
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                    )}
                    {r.users.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Пользователи:</p>
                        <div className="flex flex-wrap gap-1">
                          {r.users.slice(0, 3).map((ur: any) => (
                            <span key={ur.userId} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {ur.user.email}
                            </span>
                          ))}
                          {r.users.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{r.users.length - 3} ещё
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <form action="/admin/actions/role/delete" method="post">
                    <input type="hidden" name="id" value={r.id}/>
                    <button 
                      className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50"
                    >
                      Удалить
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
