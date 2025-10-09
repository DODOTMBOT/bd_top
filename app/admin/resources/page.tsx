import { prisma } from '@/lib/prisma';

export default async function ResourcesPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  const resources = await prisma.resource.findMany({ orderBy: { pattern: 'asc' } });
  const error = searchParams?.error;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">Управление ресурсами</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ресурсы - это пути и функции, к которым можно настроить доступ. Используйте паттерны для группировки.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Добавить новый ресурс</h3>
        <form action="/admin/actions/resource" method="post" className="flex gap-2">
          <select name="kind" className="border px-3 py-2 rounded" defaultValue="page">
            <option value="page">📄 Страница</option>
            <option value="api">🔌 API</option>
            <option value="feature">⚙️ Функция</option>
          </select>
          <input 
            name="pattern" 
            placeholder="/admin/* или /api/private/*" 
            className="border px-3 py-2 rounded flex-1"
            required
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Добавить
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-600">
          <p><strong>Примеры паттернов:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li><code>/admin/*</code> - все админские страницы</li>
            <li><code>/api/private/*</code> - приватные API</li>
            <li><code>/partner/points</code> - конкретная страница</li>
            <li><code>*</code> - всё в системе</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-medium">Существующие ресурсы</h3>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Ресурсы не созданы</p>
            <p className="text-sm">Создайте первый ресурс выше</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {resources.map(r => (
              <div key={r.id} className={`border rounded-lg p-4 ${r.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {r.kind === 'page' ? '📄' : 
                         r.kind === 'api' ? '🔌' : '⚙️'}
                      </span>
                      <div>
                        <h4 className="font-medium">
                          {r.name || `${r.kind}: ${r.pattern}`}
                        </h4>
                        <code className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {r.pattern}
                        </code>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        r.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-sm text-gray-600 mt-2">{r.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form action="/admin/actions/resource/toggle" method="post">
                      <input type="hidden" name="id" value={r.id}/>
                      <button 
                        name="op" 
                        value={r.isActive ? 'deactivate' : 'activate'} 
                        className={`px-3 py-1 text-sm rounded ${
                          r.isActive 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {r.isActive ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </form>
                    <form action="/admin/actions/resource/delete" method="post">
                      <input type="hidden" name="id" value={r.id}/>
                      <button 
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
