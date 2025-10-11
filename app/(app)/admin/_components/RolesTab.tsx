"use client";
import React from "react";

type Role = {
  id: string;
  name: string;
  description?: string;
  pagesAccessCount?: number;
};

const MOCK_ROLES: Role[] = [
  { id: "owner", name: "Владелец", description: "Полный доступ", pagesAccessCount: 999 },
  { id: "partner", name: "Партнёр", description: "Управление точками", pagesAccessCount: 42 },
  { id: "manager", name: "Менеджер точки", description: "Операционные функции", pagesAccessCount: 21 },
  { id: "employee", name: "Сотрудник", description: "Исполнение задач", pagesAccessCount: 7 },
];

export default function RolesTab(): JSX.Element {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Роли</h2>
      <div className="rounded-xl border p-4">
        <ul className="space-y-2">
          {MOCK_ROLES.map((r) => (
            <li key={r.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                {r.description ? (
                  <div className="text-sm text-foreground-500">{r.description}</div>
                ) : null}
              </div>
              <div className="text-sm text-foreground-500">
                Доступов к страницам: {r.pagesAccessCount ?? 0}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
