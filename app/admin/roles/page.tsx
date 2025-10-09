import { prisma } from '@/lib/prisma';

export default async function RolesPage() {
  const roles = await prisma.rbacRole.findMany({ include: { users: true } });
  return (
    <div className="space-y-4">
      <form action="/admin/actions/role" method="post" className="flex gap-2">
        <input name="name" placeholder="new role" className="border px-2"/>
        <button className="border px-3">Create</button>
      </form>
      <ul className="space-y-2">
        {roles.map(r => (
          <li key={r.id} className="border p-2 flex items-center justify-between">
            <div>{r.name}</div>
            <form action="/admin/actions/role/delete" method="post">
              <input type="hidden" name="id" value={r.id}/>
              <button className="border px-2">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
