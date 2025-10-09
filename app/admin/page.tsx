import { prisma } from '@/lib/prisma';
import { ensureBootstrap } from './_bootstrap';

export default async function GrantsPage() {
  await ensureBootstrap();
  const roles = await prisma.rbacRole.findMany({ orderBy: { name: 'asc' } });
  const resources = await prisma.resource.findMany({ orderBy: { pattern: 'asc' } });
  const grants = await prisma.roleGrant.findMany();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">Матрица разрешений</h2>
        <p className="text-sm text-gray-600 mb-4">
          Настройте права доступа ролей к ресурсам. <strong>Разрешить</strong> - доступ есть, 
          <strong> Запретить</strong> - доступ заблокирован, <strong>—</strong> - нет настроек.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-3 text-left font-medium">Ресурс</th>
              {roles.map(r => (
                <th key={r.id} className="border p-3 text-center font-medium">
                  {r.name === 'owner' ? 'Владелец' : 
                   r.name === 'partner' ? 'Партнёр' :
                   r.name === 'employee' ? 'Сотрудник' : r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map(res => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="border p-3 font-mono text-sm">
                  <div className="font-medium">{res.name}</div>
                  <div className="text-gray-500">{res.pattern}</div>
                </td>
                {roles.map(r => {
                  const g = grants.find(g => g.roleId === r.id && g.resourceId === res.id);
                  const val = g?.access ?? 'none';
                  return (
                    <td key={r.id} className="border p-3 text-center">
                      <form action={`/admin/actions/grant`} method="post">
                        <input type="hidden" name="roleId" value={r.id}/>
                        <input type="hidden" name="resourceId" value={res.id}/>
                        <select 
                          name="access" 
                          defaultValue={val} 
                          className="border p-1 text-sm rounded"
                        >
                          <option value="none">—</option>
                          <option value="allow">✅ Разрешить</option>
                          <option value="deny">❌ Запретить</option>
                        </select>
                        <button className="ml-2 border px-2 py-1 text-xs rounded bg-blue-50 hover:bg-blue-100">
                          Сохранить
                        </button>
                      </form>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {resources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Нет ресурсов для настройки разрешений.</p>
          <p className="text-sm">Создайте ресурсы в разделе "Ресурсы"</p>
        </div>
      )}
    </div>
  );
}
