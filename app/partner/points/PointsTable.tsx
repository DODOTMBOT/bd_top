"use client";

import { useEffect, useState } from "react";

type Point = { id: string; name: string; login?: string; address?: string };

export default function PointsTable({ points }: { points: Point[] }) {
  const [secret, setSecret] = useState<{ pointId: string; password: string } | null>(null);
  
  useEffect(() => {
    // попытаемся прочитать короткоживущую куку, которую ставит server action при создании
    // доступ к httpOnly невозможен, поэтому используем небольшой bridge через inlined script на странице —
    // если такого нет, «секрет» просто не будет доступен (кнопка скопирует ****)
    const g: any = (globalThis as any);
    if (g.__POINT_ONE_TIME__) {
      try { setSecret(g.__POINT_ONE_TIME__); } catch {}
      delete g.__POINT_ONE_TIME__;
    }
  }, []);

  if (!Array.isArray(points) || points.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Пока нет точек</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Логин
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Пароль
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Адрес
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {points.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {p.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {p.login || ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  onClick={() => {
                    const value = secret && secret.pointId === p.id ? secret.password : '********';
                    navigator.clipboard.writeText(value);
                  }}
                  title="Скопировать пароль"
                >
                  Копировать
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {p.address || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


