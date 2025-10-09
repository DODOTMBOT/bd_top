import { prisma } from '@/lib/prisma';
import { ensureBootstrap } from './_bootstrap';

export default async function GrantsPage() {
  await ensureBootstrap();
  const roles = await prisma.rbacRole.findMany({ orderBy: { name: 'asc' } });
  const resources = await prisma.resource.findMany({ orderBy: { pattern: 'asc' } });
  const grants = await prisma.roleGrant.findMany();

  // Простой UI: матрица allow/deny/none с server actions
  // (минималистично — без дизайна библиотек)
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Grants</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Resource</th>
            {roles.map(r => <th key={r.id} className="border p-2">{r.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {resources.map(res => (
            <tr key={res.id}>
              <td className="border p-2 font-mono">{res.pattern}</td>
              {roles.map(r => {
                const g = grants.find(g => g.roleId === r.id && g.resourceId === res.id);
                const val = g?.access ?? 'none';
                return (
                  <td key={r.id} className="border p-2">
                    <form action={`/admin/actions/grant`} method="post">
                      <input type="hidden" name="roleId" value={r.id}/>
                      <input type="hidden" name="resourceId" value={res.id}/>
                      <select name="access" defaultValue={val} className="border p-1">
                        <option value="none">—</option>
                        <option value="allow">allow</option>
                        <option value="deny">deny</option>
                      </select>
                      <button className="ml-2 border px-2">Save</button>
                    </form>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
