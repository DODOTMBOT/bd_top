import { prisma } from '@/lib/prisma';

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { pattern: 'asc' } });
  return (
    <div className="space-y-4">
      <form action="/admin/actions/resource" method="post" className="flex gap-2">
        <select name="kind" className="border px-2" defaultValue="page">
          <option value="page">page</option>
          <option value="api">api</option>
          <option value="feature">feature</option>
        </select>
        <input name="pattern" placeholder="/admin/*" className="border px-2"/>
        <button className="border px-3">Add</button>
      </form>
      <ul className="space-y-2">
        {resources.map(r => (
          <li key={r.id} className="border p-2 flex items-center justify-between">
            <div><b>{r.kind}</b> <span className="font-mono">{r.pattern}</span></div>
            <form action="/admin/actions/resource/toggle" method="post" className="flex gap-2">
              <input type="hidden" name="id" value={r.id}/>
              <button name="op" value={r.isActive ? 'deactivate' : 'activate'} className="border px-2">
                {r.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button formAction="/admin/actions/resource/delete" className="border px-2">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
