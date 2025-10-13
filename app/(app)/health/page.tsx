// app/(app)/health/page.tsx
import { listHealthLogs } from "./actions";
import Link from "next/link";

export const metadata = { title: "Журнал здоровья — список" };

export default async function Page() {
  let items = [];
  try {
    items = await listHealthLogs(100);
  } catch (error) {
    console.error('Ошибка загрузки журнала здоровья:', error);
    items = [];
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Журнал здоровья</h1>
        <Link href="/health/new" className="px-4 py-2 rounded-lg bg-black text-white">Добавить запись</Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Дата</th>
              <th className="text-left px-3 py-2">Сотрудник</th>
              <th className="text-left px-3 py-2">Темп.</th>
              <th className="text-left px-3 py-2">Допуск</th>
              <th className="text-left px-3 py-2">Проверил</th>
              <th className="text-left px-3 py-2">Создано</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="px-3 py-2">{new Date(x.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{x.employeeName}</td>
                <td className="px-3 py-2">{x.temperature ?? "—"}</td>
                <td className="px-3 py-2">
                  {x.allowedToWork ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700">да</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">нет</span>
                  )}
                </td>
                <td className="px-3 py-2">{x.managerName ?? "—"}</td>
                <td className="px-3 py-2">{new Date(x.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                  Записей пока нет. Создайте первую.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
